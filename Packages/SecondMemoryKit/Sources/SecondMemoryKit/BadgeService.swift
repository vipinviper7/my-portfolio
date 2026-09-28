import Foundation
import UserNotifications

public enum BadgeService {
    /// App badge is overdue count only — never inbox size.
    public static func update(overdueCount: Int) {
        UNUserNotificationCenter.current().setBadgeCount(max(0, overdueCount))
    }
}
