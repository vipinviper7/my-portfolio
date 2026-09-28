import SwiftUI
import SwiftData
import CoreSpotlight
import SecondMemoryKit
import SecondMemoryCore

struct HomeView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.scenePhase) private var scenePhase
    @Environment(Router.self) private var router

    @Query(sort: \MemoryItem.createdAt, order: .reverse)
    private var allItems: [MemoryItem]

    @State private var draft = ""
    @State private var query = ""
    @State private var path: [UUID] = []
    @State private var showSaved = false
    @FocusState private var captureFocused: Bool

    var body: some View {
        NavigationStack(path: $path) {
            VStack(spacing: 0) {
                CaptureCard(text: $draft, focused: $captureFocused, onSubmit: save)
                list
            }
            .background(pageBackground)
            .navigationTitle(SM.appName)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.large)
            #endif
            .searchable(text: $query, placement: .toolbar, prompt: "Search")
            #if os(macOS)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        focusCapture()
                    } label: {
                        Label("New", systemImage: "square.and.pencil")
                    }
                    .keyboardShortcut("n", modifiers: .command)
                }
            }
            #endif
            .navigationDestination(for: UUID.self) { id in
                if let item = allItems.first(where: { $0.id == id }) {
                    MemoryDetailView(item: item)
                } else {
                    ContentUnavailableView("Missing", systemImage: "tray")
                }
            }
            .overlay(alignment: .top) { savedToast }
            #if os(iOS)
            .sensoryFeedback(.success, trigger: showSaved) { old, new in
                !old && new
            }
            #endif
        }
        .onAppear {
            NotificationService.shared.refresh(context: context)
            consumePendingCaptureFlag()
            consumeRouter()
            #if os(macOS)
            captureFocused = true
            #endif
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                NotificationService.shared.refresh(context: context)
                consumePendingCaptureFlag()
            }
        }
        .onChange(of: router.pending) { _, _ in
            consumeRouter()
        }
        .onChange(of: router.captureNonce) { _, _ in
            focusCapture()
        }
        .onOpenURL { url in
            if let link = DeepLink(url: url) {
                router.open(link)
            }
        }
        .onContinueUserActivity(SpotlightIndex.activityType) { activity in
            if let id = SpotlightIndex.itemID(from: activity) {
                router.open(.item(id))
            }
        }
        .onContinueUserActivity(CSSearchableItemActionType) { activity in
            if let id = SpotlightIndex.itemID(from: activity) {
                router.open(.item(id))
            }
        }
        .task {
            await NotificationService.shared.requestAuthorizationIfNeeded()
        }
    }

    @ViewBuilder
    private var list: some View {
        List {
            if isSearching {
                searchSection
            } else {
                if !nowItems.isEmpty {
                    Section("Now") {
                        ForEach(nowItems) { item in
                            row(item)
                        }
                    }
                }

                if inboxItems.isEmpty && nowItems.isEmpty {
                    Section("Inbox") {
                        emptyState
                    }
                } else if !inboxItems.isEmpty {
                    Section("Inbox") {
                        ForEach(inboxItems) { item in
                            row(item)
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
        #if os(iOS)
        .scrollDismissesKeyboard(.interactively)
        #endif
        .scrollContentBackground(.hidden)
    }

    @ViewBuilder
    private var searchSection: some View {
        let hits = searchResults
        if hits.isEmpty {
            ContentUnavailableView.search(text: query)
        } else {
            Section("Results") {
                ForEach(hits) { item in
                    row(item)
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Nothing waiting")
                .font(.body)
                .foregroundStyle(.primary)
            Text("Anything you capture lands here.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 8)
        .listRowBackground(Color.clear)
        .accessibilityElement(children: .combine)
    }

    private func row(_ item: MemoryItem) -> some View {
        NavigationLink(value: item.id) {
            MemoryRow(
                item: item,
                onDone: { toggleDone(item) },
                onSnooze: { preset in snooze(item, preset) }
            )
        }
    }

    @ViewBuilder
    private var savedToast: some View {
        if showSaved {
            Label("Saved", systemImage: "checkmark")
                .font(.subheadline.weight(.semibold))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial, in: Capsule())
                .padding(.top, 8)
                .transition(.opacity.combined(with: .move(edge: .top)))
        }
    }

    private var isSearching: Bool {
        !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var nowItems: [MemoryItem] {
        allItems
            .filter(\.isNow)
            .sorted { lhs, rhs in
                (lhs.dueAt ?? .distantFuture) < (rhs.dueAt ?? .distantFuture)
            }
    }

    private var inboxItems: [MemoryItem] {
        allItems.filter(\.isInbox)
    }

    private var searchResults: [MemoryItem] {
        allItems.filter { item in
            MemoryPolicy.isVisibleInSearch(completedAt: item.completedAt)
                && MemoryPolicy.matchesSearch(item.body, query: query)
        }
    }

    private var pageBackground: Color {
        #if os(iOS)
        Color(uiColor: .systemGroupedBackground)
        #else
        Color(nsColor: .windowBackgroundColor)
        #endif
    }

    private func save() {
        guard InboxWriter.save(draft, context: context) != nil else { return }
        draft = ""
        NotificationService.shared.refresh(context: context)
        confirmSaved()
        captureFocused = true
        Task {
            await NotificationService.shared.requestAuthorizationIfNeeded()
        }
    }

    private func toggleDone(_ item: MemoryItem) {
        if item.isCompleted {
            item.reopen()
        } else {
            item.markDone()
        }
        try? context.save()
        NotificationService.shared.refresh(context: context)
    }

    private func snooze(_ item: MemoryItem, _ preset: SnoozePreset) {
        item.snooze(preset)
        try? context.save()
        NotificationService.shared.refresh(context: context)
        Task {
            await NotificationService.shared.requestAuthorizationIfNeeded()
        }
    }

    private func confirmSaved() {
        withAnimation(.easeInOut(duration: 0.2)) {
            showSaved = true
        }
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(1100))
            withAnimation(.easeInOut(duration: 0.25)) {
                showSaved = false
            }
        }
    }

    private func focusCapture() {
        captureFocused = true
        query = ""
    }

    private func consumeRouter() {
        switch router.pending {
        case .capture:
            router.pending = nil
            focusCapture()
        case .item(let id):
            router.pending = nil
            if allItems.contains(where: { $0.id == id }) {
                path = [id]
            }
        case nil:
            break
        }
    }

    private func consumePendingCaptureFlag() {
        let defaults = SnapshotStore.defaults()
        if defaults.bool(forKey: SM.pendingCaptureKey) {
            defaults.set(false, forKey: SM.pendingCaptureKey)
            focusCapture()
        }
    }
}

#Preview("Home") {
    let dentist = MemoryItem(body: "Call dentist Tuesday")
    dentist.dueAt = Date().addingTimeInterval(-3600)
    let rahul = MemoryItem(body: "Ask Rahul about Catalyst assets")
    rahul.dueAt = Calendar.current.date(bySettingHour: 16, minute: 0, second: 0, of: Date())
    let fridge = MemoryItem(body: "Password hint on fridge")
    let container = MemoryStore.makePreviewContainer(items: [dentist, rahul, fridge])
    return HomeView()
        .modelContainer(container)
        .environment(Router())
}
