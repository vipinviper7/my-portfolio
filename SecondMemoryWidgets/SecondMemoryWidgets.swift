import WidgetKit
import SwiftUI
import SecondMemoryCore
import SecondMemoryKit

struct NextDueEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
}

struct NextDueProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextDueEntry {
        NextDueEntry(
            date: .now,
            snapshot: WidgetSnapshot(
                nextDueBody: "Call dentist Tuesday",
                nextDueAt: .now.addingTimeInterval(3600),
                overdueCount: 1,
                inboxPreview: "Password hint on fridge",
                openCount: 3
            )
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (NextDueEntry) -> Void) {
        completion(NextDueEntry(date: .now, snapshot: SnapshotStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NextDueEntry>) -> Void) {
        let snapshot = SnapshotStore.load()
        let now = Date.now
        var dates: [Date] = [now]
        if let due = snapshot.nextDueAt, due > now {
            dates.append(due)
        }
        dates.append(now.addingTimeInterval(15 * 60))
        let entries = dates.map { NextDueEntry(date: $0, snapshot: snapshot) }
        completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(15 * 60))))
    }
}

struct NextDueWidgetView: View {
    var entry: NextDueEntry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        switch family {
        #if os(iOS)
        case .accessoryCircular:
            accessoryCircular
        case .accessoryInline:
            accessoryInline
        case .accessoryRectangular:
            accessoryRectangular
        #endif
        default:
            systemFamily
        }
    }

    private var itemURL: URL {
        entry.snapshot.nextDueID.map(SM.Link.item) ?? SM.Link.capture
    }

    private var systemFamily: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Now")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
            if let body = entry.snapshot.nextDueBody, let due = entry.snapshot.nextDueAt {
                Text(body)
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .lineLimit(family == .systemSmall ? 3 : 2)
                Text(due, style: .time)
                    .font(.subheadline)
                    .foregroundStyle(due < entry.date ? Color.orange : Color.secondary)
            } else if let inbox = entry.snapshot.inboxPreview {
                Text(inbox)
                    .font(.headline)
                    .lineLimit(3)
                Text("Inbox")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                Text("Nothing waiting")
                    .font(.headline)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .containerBackground(.background, for: .widget)
        .widgetURL(entry.itemURL)
    }

    #if os(iOS)
    private var accessoryRectangular: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.snapshot.nextDueBody ?? "Second Memory")
                .font(.headline)
                .lineLimit(1)
            if let due = entry.snapshot.nextDueAt {
                Text(due, style: .time)
                    .font(.subheadline)
            } else {
                Text("Inbox")
                    .font(.subheadline)
            }
        }
        .containerBackground(for: .widget) { AccessoryWidgetBackground() }
        .widgetURL(itemURL)
    }

    private var accessoryInline: some View {
        Label(entry.snapshot.nextDueBody ?? "Nothing waiting", systemImage: "square.and.pencil")
            .widgetURL(itemURL)
    }

    private var accessoryCircular: some View {
        Image(systemName: "square.and.pencil")
            .font(.title3)
            .containerBackground(for: .widget) { AccessoryWidgetBackground() }
            .widgetURL(itemURL)
    }
    #endif
}

struct NextDueWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: SM.widgetKindNextDue, provider: NextDueProvider()) { entry in
            NextDueWidgetView(entry: entry)
        }
        .configurationDisplayName("Now")
        .description("The next thing that needs you.")
        .supportedFamilies(Self.families)
    }

    private static var families: [WidgetFamily] {
        #if os(iOS)
        [.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline]
        #else
        [.systemSmall, .systemMedium]
        #endif
    }
}

struct CaptureWidgetView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "square.and.pencil")
                .font(.title2)
                .foregroundStyle(.tint)
            Text("Remember")
                .font(.headline)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(.background, for: .widget)
        .widgetURL(SM.Link.capture)
    }
}

struct CaptureProvider: TimelineProvider {
    struct Entry: TimelineEntry {
        var date: Date
    }

    func placeholder(in context: Context) -> Entry { Entry(date: .now) }
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: .now))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        completion(Timeline(entries: [Entry(date: .now)], policy: .never))
    }
}

struct CaptureWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: SM.widgetKindCapture, provider: CaptureProvider()) { _ in
            CaptureWidgetView()
        }
        .configurationDisplayName("Capture")
        .description("One tap to remember something.")
        .supportedFamilies([.systemSmall])
    }
}

@main
struct SecondMemoryWidgets: WidgetBundle {
    var body: some Widget {
        NextDueWidget()
        CaptureWidget()
    }
}
