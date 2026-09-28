import Foundation
import UserNotifications
import SwiftData
import SecondMemoryCore

@MainActor
public final class NotificationService {
    public static let shared = NotificationService()

    private init() {}

    public func registerCategories() {
        let snoozeHour = UNNotificationAction(
            identifier: SM.Notification.snooze1h,
            title: SnoozePreset.oneHour.title,
            options: []
        )
        let snoozeTonight = UNNotificationAction(
            identifier: SM.Notification.snoozeTonight,
            title: SnoozePreset.tonight.title,
            options: []
        )
        let snoozeTomorrow = UNNotificationAction(
            identifier: SM.Notification.snoozeTomorrow,
            title: SnoozePreset.tomorrow.title,
            options: []
        )
        let done = UNNotificationAction(
            identifier: SM.Notification.done,
            title: "Done",
            options: [.destructive]
        )

        let due = UNNotificationCategory(
            identifier: SM.Notification.dueCategory,
            actions: [snoozeHour, snoozeTonight, snoozeTomorrow, done],
            intentIdentifiers: [],
            options: []
        )
        let openLoops = UNNotificationCategory(
            identifier: SM.Notification.openLoopsCategory,
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        UNUserNotificationCenter.current().setNotificationCategories([due, openLoops])
    }

    public func requestAuthorizationIfNeeded() async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .notDetermined else { return }
        _ = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
    }

    public func refresh(context: ModelContext, now: Date = .now) {
        let items = fetchAll(context: context)
        SnapshotStore.write(from: items, now: now)
        BadgeService.update(overdueCount: items.filter(\.isOverdue).count)
        SpotlightIndex.update(items)
        scheduleDueNotifications(for: items, now: now)
        scheduleOpenLoops(for: items)
        reloadWidgets()
    }

    public func handleNotificationResponse(
        _ response: UNNotificationResponse,
        context: ModelContext
    ) -> DeepLink? {
        let userInfo = response.notification.request.content.userInfo
        let kind = userInfo[SM.Notification.kindKey] as? String
        let itemID = (userInfo[SM.Notification.itemIDKey] as? String).flatMap(UUID.init)

        if response.actionIdentifier == UNNotificationDefaultActionIdentifier {
            if kind == SM.Notification.kindOpenLoops {
                return .capture
            }
            if let itemID {
                return .item(itemID)
            }
            return nil
        }

        if response.actionIdentifier == SM.Notification.done, let itemID {
            if let item = fetch(id: itemID, context: context) {
                item.markDone()
                try? context.save()
                refresh(context: context)
            }
            return nil
        }

        if let preset = SnoozePreset.from(actionIdentifier: response.actionIdentifier), let itemID {
            if let item = fetch(id: itemID, context: context) {
                item.snooze(preset)
                try? context.save()
                refresh(context: context)
            }
            return nil
        }

        return nil
    }

    private func scheduleDueNotifications(for items: [MemoryItem], now: Date) {
        let center = UNUserNotificationCenter.current()
        let openDated = items.filter { $0.isNow }
        let keepIDs = Set(openDated.map { dueRequestID($0.id) })

        center.getPendingNotificationRequests { requests in
            let stale = requests
                .map(\.identifier)
                .filter { $0.hasPrefix("due-") && !keepIDs.contains($0) }
            center.removePendingNotificationRequests(withIdentifiers: stale)
        }

        for item in openDated {
            guard let dueAt = item.dueAt else { continue }
            let identifier = dueRequestID(item.id)
            if dueAt <= now {
                continue
            }
            let content = UNMutableNotificationContent()
            content.title = SM.appName
            content.body = item.body
            content.sound = .default
            content.categoryIdentifier = SM.Notification.dueCategory
            content.threadIdentifier = SM.Notification.kindDue
            content.userInfo = [
                SM.Notification.itemIDKey: item.id.uuidString,
                SM.Notification.kindKey: SM.Notification.kindDue
            ]
            let projectedBadge = items.filter(\.isOverdue).count + 1
            content.badge = NSNumber(value: projectedBadge)

            let components = Calendar.current.dateComponents(
                [.year, .month, .day, .hour, .minute],
                from: dueAt
            )
            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
            center.add(request)
        }
    }

    private func scheduleOpenLoops(for items: [MemoryItem]) {
        let center = UNUserNotificationCenter.current()
        let loops = items.filter(\.isInbox)
        guard !loops.isEmpty else {
            center.removePendingNotificationRequests(withIdentifiers: [SM.Notification.openLoopsID])
            return
        }

        let content = UNMutableNotificationContent()
        content.title = SM.appName
        if loops.count == 1, let only = loops.first {
            content.body = only.body
        } else {
            content.body = "\(loops.count) open loops"
        }
        content.sound = .default
        content.categoryIdentifier = SM.Notification.openLoopsCategory
        content.threadIdentifier = SM.Notification.kindOpenLoops
        content.userInfo = [SM.Notification.kindKey: SM.Notification.kindOpenLoops]
        content.interruptionLevel = .active

        var components = DateComponents()
        components.hour = SM.openLoopsHour
        components.minute = 0
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(
            identifier: SM.Notification.openLoopsID,
            content: content,
            trigger: trigger
        )
        center.add(request)
    }

    private func fetchAll(context: ModelContext) -> [MemoryItem] {
        let descriptor = FetchDescriptor<MemoryItem>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    private func fetch(id: UUID, context: ModelContext) -> MemoryItem? {
        let target = id
        let descriptor = FetchDescriptor<MemoryItem>(
            predicate: #Predicate { $0.id == target }
        )
        return try? context.fetch(descriptor).first
    }

    private func dueRequestID(_ id: UUID) -> String {
        "due-\(id.uuidString)"
    }

    private func reloadWidgets() {
        WidgetReloader.reload()
    }
}
