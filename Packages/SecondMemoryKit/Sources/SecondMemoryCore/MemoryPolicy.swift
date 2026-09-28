import Foundation

public enum MemoryLane: Sendable {
    case now
    case inbox
}

public enum MemoryPolicy: Sendable {
    public static var doneRetention: TimeInterval {
        TimeInterval(SM.doneRetentionDays * 24 * 60 * 60)
    }

    public static func isCompleted(_ completedAt: Date?) -> Bool {
        completedAt != nil
    }

    /// Overdue only — never inbox size.
    public static func isOverdue(dueAt: Date?, completedAt: Date?, now: Date = .now) -> Bool {
        guard completedAt == nil, let dueAt else { return false }
        return dueAt < now
    }

    public static func belongsInNow(dueAt: Date?, completedAt: Date?) -> Bool {
        completedAt == nil && dueAt != nil
    }

    public static func belongsInInbox(dueAt: Date?, completedAt: Date?) -> Bool {
        completedAt == nil && dueAt == nil
    }

    public static func lane(dueAt: Date?, completedAt: Date?) -> MemoryLane? {
        if belongsInNow(dueAt: dueAt, completedAt: completedAt) { return .now }
        if belongsInInbox(dueAt: dueAt, completedAt: completedAt) { return .inbox }
        return nil
    }

    /// Done items stay searchable for 30 days, then hidden (not deleted).
    public static func isVisibleInSearch(completedAt: Date?, now: Date = .now) -> Bool {
        guard let completedAt else { return true }
        return now.timeIntervalSince(completedAt) <= doneRetention
    }

    public static func overdueCount<S: Sequence>(
        of items: S,
        now: Date = .now
    ) -> Int where S.Element == (dueAt: Date?, completedAt: Date?) {
        items.reduce(into: 0) { count, item in
            if isOverdue(dueAt: item.dueAt, completedAt: item.completedAt, now: now) {
                count += 1
            }
        }
    }

    public static func openLoopCount<S: Sequence>(
        of items: S
    ) -> Int where S.Element == (dueAt: Date?, completedAt: Date?) {
        items.reduce(into: 0) { count, item in
            if belongsInInbox(dueAt: item.dueAt, completedAt: item.completedAt) {
                count += 1
            }
        }
    }

    public static func nextDue<S: Sequence>(
        of items: S,
        now: Date = .now
    ) -> (body: String, dueAt: Date)? where S.Element == (body: String, dueAt: Date?, completedAt: Date?) {
        items
            .compactMap { item -> (body: String, dueAt: Date)? in
                guard item.completedAt == nil, let dueAt = item.dueAt else { return nil }
                return (item.body, dueAt)
            }
            .sorted { $0.dueAt < $1.dueAt }
            .first
    }

    public static func matchesSearch(_ body: String, query: String) -> Bool {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !needle.isEmpty else { return true }
        return body.localizedCaseInsensitiveContains(needle)
    }
}
