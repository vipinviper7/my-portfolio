import SwiftUI
import SwiftData
import SecondMemoryKit
import SecondMemoryCore

struct MemoryDetailView: View {
    @Bindable var item: MemoryItem
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss

    @State private var remind = false
    @State private var draftDue: Date = Date().addingTimeInterval(3600)

    var body: some View {
        List {
            Section {
                TextField("Remember this", text: $item.body, axis: .vertical)
                    .font(.body)
                    .lineLimit(3...20)
                    #if os(iOS)
                    .textInputAutocapitalization(.sentences)
                    #endif
            }

            Section {
                Toggle("Remind me", isOn: $remind)
                if remind {
                    DatePicker(
                        "Time",
                        selection: $draftDue
                    )
                    .datePickerStyle(.compact)
                }
            } footer: {
                Text("Skip a time if you only need to find this later.")
            }

            if remind {
                Section("Snooze") {
                    ForEach(SnoozePreset.allCases) { preset in
                        Button {
                            item.snooze(preset)
                            draftDue = item.dueAt ?? draftDue
                            persist()
                        } label: {
                            Label(preset.title, systemImage: preset.systemImage)
                        }
                    }
                }
            }
        }
        #if os(iOS)
        .listStyle(.insetGrouped)
        #else
        .listStyle(.inset)
        #endif
        .navigationTitle("Memory")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button(item.isCompleted ? "Not Done" : "Done") {
                    if item.isCompleted {
                        item.reopen()
                    } else {
                        item.markDone()
                    }
                    persist()
                    dismiss()
                }
            }
        }
        .onAppear {
            remind = item.dueAt != nil
            draftDue = item.dueAt ?? Snooze.date(for: .oneHour)
        }
        .onChange(of: remind) { _, on in
            if on {
                item.dueAt = draftDue
            } else {
                item.dueAt = nil
            }
            persist()
        }
        .onChange(of: draftDue) { _, date in
            guard remind else { return }
            item.dueAt = date
            persist()
        }
        .onChange(of: item.body) { _, _ in
            persist()
        }
        .onDisappear {
            persist()
        }
    }

    private func persist() {
        let trimmed = item.body.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return
        }
        item.body = trimmed
        try? context.save()
        NotificationService.shared.refresh(context: context)
        Task {
            await NotificationService.shared.requestAuthorizationIfNeeded()
        }
    }
}
