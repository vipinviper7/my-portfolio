import SwiftUI
import SecondMemoryCore

struct CaptureBar: View {
    @Binding var text: String
    var focused: FocusState<Bool>.Binding
    var onSubmit: () -> Void

    var body: some View {
        HStack(alignment: .bottom, spacing: 10) {
            TextField("Remember this", text: $text, axis: .vertical)
                .font(.body)
                .textFieldStyle(.plain)
                .lineLimit(1...6)
                .focused(focused)
                .submitLabel(.done)
                .onSubmit(onSubmit)
                #if os(iOS)
                .textInputAutocapitalization(.sentences)
                #endif

            if canSave {
                Button(action: onSubmit) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(.tint)
                }
                .buttonStyle(.plain)
                .keyboardShortcut(.return, modifiers: .command)
                .accessibilityLabel("Save")
                .transition(.opacity.combined(with: .scale(scale: 0.85)))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .animation(.easeInOut(duration: 0.15), value: canSave)
        .accessibilityElement(children: .contain)
    }

    private var canSave: Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}

struct CaptureCard: View {
    @Binding var text: String
    var focused: FocusState<Bool>.Binding
    var onSubmit: () -> Void

    var body: some View {
        CaptureBar(text: $text, focused: focused, onSubmit: onSubmit)
            .background(cardFill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            #if os(iOS)
            .padding(.horizontal, 16)
            #else
            .padding(.horizontal, 20)
            #endif
            .padding(.top, 8)
            .padding(.bottom, 4)
    }

    private var cardFill: Color {
        #if os(iOS)
        Color(uiColor: .secondarySystemGroupedBackground)
        #else
        Color(nsColor: .controlBackgroundColor)
        #endif
    }
}
