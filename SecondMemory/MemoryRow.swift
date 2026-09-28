import SwiftUI
import SecondMemoryKit
import SecondMemoryCore

struct MemoryRow: View {
    @Bindable var item: MemoryItem
    var onDone: () -> Void
    var onSnooze: (SnoozePreset) -> Void

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Button(action: onDone) {
                Image(systemName: item.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(item.isCompleted ? Color.accentColor : Color.secondary.opacity(0.55))
                    .symbolRenderingMode(.hierarchical)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(item.isCompleted ? "Mark as not done" : "Done")

            VStack(alignment: .leading, spacing: 3) {
                Text(item.body)
                    .font(.body)
                    .foregroundStyle(item.isCompleted ? .secondary : .primary)
                    .strikethrough(item.isCompleted, color: .secondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                if let dueAt = item.dueAt {
                    Text(DueCopy.line(dueAt, overdue: item.isOverdue && !item.isCompleted))
                        .font(.subheadline)
                        .foregroundStyle(item.isOverdue && !item.isCompleted ? Color.orange : Color.secondary)
                } else if item.isCompleted, let completedAt = item.completedAt {
                    Text("Done \(completedAt.formatted(.relative(presentation: .named)))")
                        .font(.subheadline)
                        .foregroundStyle(.tertiary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.vertical, 5)
        .contentShape(Rectangle())
        .contextMenu { menu }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button(action: onDone) {
                Label("Done", systemImage: "checkmark")
            }
            .tint(.green)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            ForEach(SnoozePreset.allCases) { preset in
                Button {
                    onSnooze(preset)
                } label: {
                    Label(preset.title, systemImage: preset.systemImage)
                }
                .tint(tint(for: preset))
            }
        }
    }

    @ViewBuilder
    private var menu: some View {
        Button(action: onDone) {
            Label(item.isCompleted ? "Not Done" : "Done", systemImage: "checkmark.circle")
        }
        Menu {
            ForEach(SnoozePreset.allCases) { preset in
                Button(preset.title) { onSnooze(preset) }
            }
        } label: {
            Label("Snooze", systemImage: "moon.zzz")
        }
    }

    private func tint(for preset: SnoozePreset) -> Color {
        switch preset {
        case .oneHour: return .indigo
        case .tonight: return .purple
        case .tomorrow: return .blue
        }
    }
}

enum DueCopy {
    static func line(_ date: Date, overdue: Bool, now: Date = .now, calendar: Calendar = .current) -> String {
        if overdue {
            return "Overdue · \(time(date, now: now, calendar: calendar))"
        }
        return time(date, now: now, calendar: calendar)
    }

    static func time(_ date: Date, now: Date = .now, calendar: Calendar = .current) -> String {
        if calendar.isDateInToday(date) {
            return date.formatted(date: .omitted, time: .shortened)
        }
        if calendar.isDateInTomorrow(date) {
            return "Tomorrow \(date.formatted(date: .omitted, time: .shortened))"
        }
        if calendar.isDateInYesterday(date) {
            return "Yesterday \(date.formatted(date: .omitted, time: .shortened))"
        }
        let days = calendar.dateComponents([.day], from: calendar.startOfDay(for: now), to: calendar.startOfDay(for: date)).day ?? 0
        if abs(days) < 7 {
            return date.formatted(.dateTime.weekday(.wide).hour().minute())
        }
        return date.formatted(.dateTime.month(.abbreviated).day().hour().minute())
    }
}
