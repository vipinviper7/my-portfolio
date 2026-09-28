import Foundation

public struct WidgetSnapshot: Codable, Sendable, Equatable {
    public var nextDueID: UUID?
    public var nextDueBody: String?
    public var nextDueAt: Date?
    public var overdueCount: Int
    public var inboxPreview: String?
    public var openCount: Int

    public init(
        nextDueID: UUID? = nil,
        nextDueBody: String? = nil,
        nextDueAt: Date? = nil,
        overdueCount: Int = 0,
        inboxPreview: String? = nil,
        openCount: Int = 0
    ) {
        self.nextDueID = nextDueID
        self.nextDueBody = nextDueBody
        self.nextDueAt = nextDueAt
        self.overdueCount = overdueCount
        self.inboxPreview = inboxPreview
        self.openCount = openCount
    }

    public static let empty = WidgetSnapshot()

    public var hasNextDue: Bool { nextDueBody != nil && nextDueAt != nil }
}
