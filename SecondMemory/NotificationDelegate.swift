import Foundation
import UserNotifications
import SwiftData
import SecondMemoryKit
import SecondMemoryCore

final class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationDelegate()

    var container: ModelContainer?
    var router: Router?

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound, .badge, .list]
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        guard let container else { return }
        let link = await MainActor.run {
            NotificationService.shared.handleNotificationResponse(
                response,
                context: container.mainContext
            )
        }
        if let link {
            await MainActor.run {
                router?.open(link)
            }
        }
    }
}
