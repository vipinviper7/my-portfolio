import XCTest
import SecondMemoryCore

final class MemoryPolicyTests: XCTestCase {
    private let now = Date(timeIntervalSince1970: 1_727_500_000)

    func testInboxIsUndatedOpenItems() {
        XCTAssertTrue(MemoryPolicy.belongsInInbox(dueAt: nil, completedAt: nil))
        XCTAssertFalse(MemoryPolicy.belongsInInbox(dueAt: now, completedAt: nil))
        XCTAssertFalse(MemoryPolicy.belongsInInbox(dueAt: nil, completedAt: now))
    }

    func testNowIsDatedOpenItems() {
        XCTAssertTrue(MemoryPolicy.belongsInNow(dueAt: now, completedAt: nil))
        XCTAssertFalse(MemoryPolicy.belongsInNow(dueAt: nil, completedAt: nil))
        XCTAssertFalse(MemoryPolicy.belongsInNow(dueAt: now, completedAt: now))
    }

    func testOverdueOnlyWhenPastAndOpen() {
        XCTAssertTrue(MemoryPolicy.isOverdue(dueAt: now.addingTimeInterval(-1), completedAt: nil, now: now))
        XCTAssertFalse(MemoryPolicy.isOverdue(dueAt: now.addingTimeInterval(1), completedAt: nil, now: now))
        XCTAssertFalse(MemoryPolicy.isOverdue(dueAt: now.addingTimeInterval(-1), completedAt: now, now: now))
        XCTAssertFalse(MemoryPolicy.isOverdue(dueAt: nil, completedAt: nil, now: now))
    }

    func testDoneHiddenAfterThirtyDays() {
        let recent = now.addingTimeInterval(-MemoryPolicy.doneRetention + 60)
        let stale = now.addingTimeInterval(-MemoryPolicy.doneRetention - 60)
        XCTAssertTrue(MemoryPolicy.isVisibleInSearch(completedAt: nil, now: now))
        XCTAssertTrue(MemoryPolicy.isVisibleInSearch(completedAt: recent, now: now))
        XCTAssertFalse(MemoryPolicy.isVisibleInSearch(completedAt: stale, now: now))
    }

    func testBadgeCountsOverdueOnly() {
        let items: [(dueAt: Date?, completedAt: Date?)] = [
            (now.addingTimeInterval(-10), nil),
            (now.addingTimeInterval(10), nil),
            (nil, nil),
            (now.addingTimeInterval(-10), now)
        ]
        XCTAssertEqual(MemoryPolicy.overdueCount(of: items, now: now), 1)
        XCTAssertEqual(MemoryPolicy.openLoopCount(of: items), 1)
    }

    func testSearchIsCaseInsensitive() {
        XCTAssertTrue(MemoryPolicy.matchesSearch("Call dentist Tuesday", query: "dentist"))
        XCTAssertTrue(MemoryPolicy.matchesSearch("Call dentist Tuesday", query: "DENTIST"))
        XCTAssertFalse(MemoryPolicy.matchesSearch("Call dentist Tuesday", query: "Rahul"))
        XCTAssertTrue(MemoryPolicy.matchesSearch("anything", query: "  "))
    }

    func testNextDueIsEarliestOpen() {
        let items: [(body: String, dueAt: Date?, completedAt: Date?)] = [
            ("later", now.addingTimeInterval(200), nil),
            ("soon", now.addingTimeInterval(50), nil),
            ("done", now.addingTimeInterval(10), now),
            ("inbox", nil, nil)
        ]
        let next = MemoryPolicy.nextDue(of: items, now: now)
        XCTAssertEqual(next?.body, "soon")
    }
}
