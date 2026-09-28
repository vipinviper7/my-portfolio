import Foundation
import SwiftData
import SecondMemoryCore

public enum InboxWriter {
    @discardableResult
    public static func save(
        _ raw: String,
        dueAt: Date? = nil,
        context: ModelContext
    ) -> MemoryItem? {
        let body = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return nil }
        let item = MemoryItem(body: body, dueAt: dueAt)
        context.insert(item)
        try? context.save()
        return item
    }
}
