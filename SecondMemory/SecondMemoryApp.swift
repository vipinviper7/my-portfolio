import SwiftUI
import SwiftData
import UserNotifications
import SecondMemoryKit
import SecondMemoryCore

@main
struct SecondMemoryApp: App {
    @State private var router = Router()
    private let container: ModelContainer

    init() {
        let resolved: ModelContainer
        do {
            resolved = try MemoryStore.makeContainer()
        } catch {
            resolved = MemoryStore.makePreviewContainer()
        }
        container = resolved
        NotificationService.shared.registerCategories()
        UNUserNotificationCenter.current().delegate = NotificationDelegate.shared
        NotificationDelegate.shared.container = resolved
    }

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environment(router)
                .onAppear {
                    NotificationDelegate.shared.router = router
                }
        }
        .modelContainer(container)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Memory") {
                    router.open(.capture)
                }
                .keyboardShortcut("n", modifiers: .command)
            }
        }
        #if os(macOS)
        .defaultSize(width: 420, height: 760)
        .windowResizability(.contentMinSize)
        .windowStyle(.automatic)
        #endif

        #if os(macOS)
        MenuBarExtra(SM.appName, systemImage: "square.and.pencil") {
            MenuBarCaptureView()
                .modelContainer(container)
        }
        .menuBarExtraStyle(.window)
        #endif
    }
}
