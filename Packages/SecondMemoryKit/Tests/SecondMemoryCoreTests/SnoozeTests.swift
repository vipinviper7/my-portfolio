import XCTest
import SecondMemoryCore

final class SnoozeTests: XCTestCase {
    private var calendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0)!
        return calendar
    }

    private func date(_ year: Int, _ month: Int, _ day: Int, _ hour: Int, _ minute: Int = 0) -> Date {
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = day
        components.hour = hour
        components.minute = minute
        return calendar.date(from: components)!
    }

    func testOneHour() {
        let now = date(2026, 9, 28, 10, 15)
        XCTAssertEqual(
            Snooze.date(for: .oneHour, now: now, calendar: calendar),
            now.addingTimeInterval(3600)
        )
    }

    func testTonightStillAhead() {
        let now = date(2026, 9, 28, 19, 0)
        let result = Snooze.date(for: .tonight, now: now, calendar: calendar)
        XCTAssertEqual(result, date(2026, 9, 28, 20))
    }

    func testTonightAlreadyPastRollsToNextDay() {
        let now = date(2026, 9, 28, 20, 1)
        let result = Snooze.date(for: .tonight, now: now, calendar: calendar)
        XCTAssertEqual(result, date(2026, 9, 29, 20))
    }

    func testTomorrowIsAlwaysNextMorning() {
        let morning = date(2026, 9, 28, 8, 0)
        let evening = date(2026, 9, 28, 22, 0)
        XCTAssertEqual(Snooze.date(for: .tomorrow, now: morning, calendar: calendar), date(2026, 9, 29, 9))
        XCTAssertEqual(Snooze.date(for: .tomorrow, now: evening, calendar: calendar), date(2026, 9, 29, 9))
    }

    func testOpenLoopsBeforeNinePM() {
        let now = date(2026, 9, 28, 16)
        XCTAssertEqual(Snooze.nextOpenLoops(now: now, calendar: calendar), date(2026, 9, 28, 21))
    }

    func testOpenLoopsAtNinePMGoesTomorrow() {
        let now = date(2026, 9, 28, 21)
        XCTAssertEqual(Snooze.nextOpenLoops(now: now, calendar: calendar), date(2026, 9, 29, 21))
    }
}
