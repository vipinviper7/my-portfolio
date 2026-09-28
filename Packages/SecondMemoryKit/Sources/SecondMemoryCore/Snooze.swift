import Foundation

public enum SnoozePreset: String, CaseIterable, Sendable, Identifiable {
    case oneHour
    case tonight
    case tomorrow

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .oneHour: return "1 Hour"
        case .tonight: return "Tonight"
        case .tomorrow: return "Tomorrow"
        }
    }

    public var systemImage: String {
        switch self {
        case .oneHour: return "clock"
        case .tonight: return "moon"
        case .tomorrow: return "sunrise"
        }
    }

    public var notificationActionID: String {
        switch self {
        case .oneHour: return SM.Notification.snooze1h
        case .tonight: return SM.Notification.snoozeTonight
        case .tomorrow: return SM.Notification.snoozeTomorrow
        }
    }

    public static func from(actionIdentifier: String) -> SnoozePreset? {
        switch actionIdentifier {
        case SM.Notification.snooze1h: return .oneHour
        case SM.Notification.snoozeTonight: return .tonight
        case SM.Notification.snoozeTomorrow: return .tomorrow
        default: return nil
        }
    }
}

public enum Snooze: Sendable {
    public static func date(
        for preset: SnoozePreset,
        now: Date = .now,
        calendar: Calendar = .current
    ) -> Date {
        switch preset {
        case .oneHour:
            return now.addingTimeInterval(60 * 60)
        case .tonight:
            return nextTime(hour: SM.tonightHour, minute: 0, after: now, calendar: calendar)
        case .tomorrow:
            let startOfToday = calendar.startOfDay(for: now)
            let tomorrow = calendar.date(byAdding: .day, value: 1, to: startOfToday) ?? now.addingTimeInterval(86_400)
            return calendar.date(bySettingHour: SM.tomorrowHour, minute: 0, second: 0, of: tomorrow) ?? tomorrow
        }
    }

    public static func nextOpenLoops(
        now: Date = .now,
        calendar: Calendar = .current
    ) -> Date {
        nextTime(hour: SM.openLoopsHour, minute: 0, after: now, calendar: calendar)
    }

    /// Next occurrence of hour:minute that is strictly after `now`.
    public static func nextTime(
        hour: Int,
        minute: Int,
        after now: Date,
        calendar: Calendar = .current
    ) -> Date {
        var components = calendar.dateComponents([.year, .month, .day], from: now)
        components.hour = hour
        components.minute = minute
        components.second = 0
        let today = calendar.date(from: components) ?? now
        if today > now {
            return today
        }
        return calendar.date(byAdding: .day, value: 1, to: today) ?? today.addingTimeInterval(86_400)
    }
}
