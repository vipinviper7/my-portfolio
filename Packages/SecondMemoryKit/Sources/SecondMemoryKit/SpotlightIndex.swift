import CoreSpotlight
import Foundation
import UniformTypeIdentifiers
import SecondMemoryCore

public enum SpotlightIndex {
    public static let domain = "com.vipinebenezer.secondmemory.items"
    public static let activityType = "com.vipinebenezer.secondmemory.item"

    public static func update(_ items: [MemoryItem]) {
        let visible = items.filter { MemoryPolicy.isVisibleInSearch(completedAt: $0.completedAt) }
        let searchable = visible.map { item -> CSSearchableItem in
            let attributes = CSSearchableItemAttributeSet(contentType: .text)
            attributes.title = item.body
            attributes.displayName = item.body
            attributes.contentDescription = SM.appName
            attributes.keywords = [SM.appName, "inbox", "reminder"]
            if let dueAt = item.dueAt {
                attributes.dueDate = dueAt
            }
            attributes.addedDate = item.createdAt
            return CSSearchableItem(
                uniqueIdentifier: item.id.uuidString,
                domainIdentifier: domain,
                attributeSet: attributes
            )
        }
        CSSearchableIndex.default().indexSearchableItems(searchable)
    }

    public static func itemID(from activity: NSUserActivity) -> UUID? {
        if let id = activity.userInfo?["id"] as? String {
            return UUID(uuidString: id)
        }
        if activity.activityType == CSSearchableItemActionType,
           let id = activity.userInfo?[CSSearchableItemActivityIdentifier] as? String {
            return UUID(uuidString: id)
        }
        return nil
    }
}
