import Foundation
import SecondMemoryCore

public enum SnapshotStore {
    public static func defaults() -> UserDefaults {
        UserDefaults(suiteName: SM.appGroupID) ?? .standard
    }

    public static func save(_ snapshot: WidgetSnapshot) {
        if let data = try? JSONEncoder().encode(snapshot) {
            defaults().set(data, forKey: SM.snapshotDefaultsKey)
        }
    }

    public static func load() -> WidgetSnapshot {
        guard let data = defaults().data(forKey: SM.snapshotDefaultsKey),
              let snapshot = try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
        else {
            return .empty
        }
        return snapshot
    }

    public static func write(
        from items: [MemoryItem],
        now: Date = .now
    ) {
        let tuples = items.map { (body: $0.body, dueAt: $0.dueAt, completedAt: $0.completedAt) }
        let next = MemoryPolicy.nextDue(of: tuples, now: now)
        let nextItem = items
            .filter { $0.completedAt == nil && $0.dueAt != nil }
            .sorted { ($0.dueAt ?? .distantFuture) < ($1.dueAt ?? .distantFuture) }
            .first
        let inbox = items.first(where: { $0.isInbox })?.body
        let snapshot = WidgetSnapshot(
            nextDueID: nextItem?.id,
            nextDueBody: next?.body,
            nextDueAt: next?.dueAt,
            overdueCount: items.filter(\.isOverdue).count,
            inboxPreview: inbox,
            openCount: items.filter { $0.completedAt == nil }.count
        )
        save(snapshot)
    }
}
