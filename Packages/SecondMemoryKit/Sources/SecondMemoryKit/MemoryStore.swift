import Foundation
import SwiftData
import SecondMemoryCore

public enum MemoryStore {
    public static let schema = Schema([MemoryItem.self])

    public static func makeContainer() throws -> ModelContainer {
        if let cloud = try? ModelContainer(for: schema, configurations: [cloudConfiguration()]) {
            return cloud
        }
        do {
            return try ModelContainer(for: schema, configurations: [localConfiguration()])
        } catch {
            let memory = ModelConfiguration(
                "SecondMemory-Memory",
                schema: schema,
                isStoredInMemoryOnly: true,
                cloudKitDatabase: .none
            )
            return try ModelContainer(for: schema, configurations: [memory])
        }
    }

    public static func makePreviewContainer(items: [MemoryItem] = []) -> ModelContainer {
        let configuration = ModelConfiguration(
            "SecondMemory-Preview",
            schema: schema,
            isStoredInMemoryOnly: true,
            cloudKitDatabase: .none
        )
        let container = try! ModelContainer(for: schema, configurations: [configuration])
        for item in items {
            container.mainContext.insert(item)
        }
        return container
    }

    public static func storeURL() -> URL {
        let fileName = "SecondMemory.store"
        if let group = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: SM.appGroupID
        ) {
            return group.appendingPathComponent(fileName)
        }
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        try? FileManager.default.createDirectory(at: support, withIntermediateDirectories: true)
        return support.appendingPathComponent(fileName)
    }

    private static func cloudConfiguration() -> ModelConfiguration {
        ModelConfiguration(
            "SecondMemory",
            schema: schema,
            url: storeURL(),
            cloudKitDatabase: .automatic
        )
    }

    private static func localConfiguration() -> ModelConfiguration {
        ModelConfiguration(
            "SecondMemory",
            schema: schema,
            url: storeURL(),
            cloudKitDatabase: .none
        )
    }
}
