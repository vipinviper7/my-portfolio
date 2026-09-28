import SwiftUI
import SwiftData
import SecondMemoryKit
import SecondMemoryCore

#if os(macOS)
struct MenuBarCaptureView: View {
    @Environment(\.modelContext) private var context
    @State private var draft = ""
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(SM.appName)
                .font(.headline)
            CaptureBar(text: $draft, focused: $focused, onSubmit: save)
                .background(Color(nsColor: .controlBackgroundColor), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            Text("Return saves. No lists, no filing.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(width: 320)
        .onAppear { focused = true }
    }

    private func save() {
        guard InboxWriter.save(draft, context: context) != nil else { return }
        draft = ""
        NotificationService.shared.refresh(context: context)
        focused = true
    }
}
#endif
