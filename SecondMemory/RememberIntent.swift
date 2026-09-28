import AppIntents
import SwiftData
import SecondMemoryKit
import SecondMemoryCore

struct RememberIntent: AppIntent {
    static var title: LocalizedStringResource = "Remember this"
    static var description: IntentDescription = "Save a thought to Second Memory."
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Text", inputConnectionBehavior: .connectToPreviousIntentResult)
    var text: String

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let container = try MemoryStore.makeContainer()
        let context = container.mainContext
        guard InboxWriter.save(text, context: context) != nil else {
            return .result(dialog: "Nothing to save.")
        }
        NotificationService.shared.refresh(context: context)
        return .result(dialog: "Saved.")
    }
}

struct OpenCaptureIntent: AppIntent {
    static var title: LocalizedStringResource = "Capture"
    static var description: IntentDescription = "Open Second Memory to capture a thought."
    static var openAppWhenRun: Bool = true

    func perform() async throws -> some IntentResult {
        UserDefaults(suiteName: SM.appGroupID)?.set(true, forKey: SM.pendingCaptureKey)
        return .result()
    }
}

struct SecondMemoryShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: RememberIntent(),
            phrases: [
                "Remember \(\.$text) in \(.applicationName)",
                "Remember this in \(.applicationName)"
            ],
            shortTitle: "Remember",
            systemImageName: "square.and.pencil"
        )
        AppShortcut(
            intent: OpenCaptureIntent(),
            phrases: [
                "Capture in \(.applicationName)",
                "Open \(.applicationName)"
            ],
            shortTitle: "Capture",
            systemImageName: "square.and.pencil"
        )
    }
}
