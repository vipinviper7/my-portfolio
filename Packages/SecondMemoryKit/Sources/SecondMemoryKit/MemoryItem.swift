import Foundation
import SwiftData
import SecondMemoryCore

@Model
public final class MemoryItem {
    public var id: UUID = UUID()
    public var body: String = ""
    public var createdAt: Date = Date.now
    public var dueAt: Date? = nil
    public var completedAt: Date? = nil

    public init(body: String, dueAt: Date? = nil, createdAt: Date = .now) {
        self.id = UUID()
        self.body = body
        self.createdAt = createdAt
        self.dueAt = dueAt
        self.completedAt = nil
    }

    public var isCompleted: Bool {
        MemoryPolicy.isCompleted(completedAt)
    }

    public var isOverdue: Bool {
        MemoryPolicy.isOverdue(dueAt: dueAt, completedAt: completedAt)
    }

    public var isNow: Bool {
        MemoryPolicy.belongsInNow(dueAt: dueAt, completedAt: completedAt)
    }

    public var isInbox: Bool {
        MemoryPolicy.belongsInInbox(dueAt: dueAt, completedAt: completedAt)
    }

    public func markDone(at date: Date = .now) {
        completedAt = date
    }

    public func reopen() {
        completedAt = nil
    }

    public func snooze(_ preset: SnoozePreset, now: Date = .now, calendar: Calendar = .current) {
        completedAt = nil
        dueAt = Snooze.date(for: preset, now: now, calendar: calendar)
    }
}
