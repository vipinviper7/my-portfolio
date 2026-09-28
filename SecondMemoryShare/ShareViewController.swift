import Foundation
import UniformTypeIdentifiers
import SecondMemoryKit
import SecondMemoryCore

#if os(iOS)
import UIKit

final class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        saveAndFinish()
    }

    private func saveAndFinish() {
        ShareIngest.extract(from: extensionContext) { text in
            Task { @MainActor in
                ShareIngest.persist(text)
                self.extensionContext?.completeRequest(returningItems: nil)
            }
        }
    }
}
#else
import AppKit

final class ShareViewController: NSViewController {
    override func loadView() {
        view = NSView(frame: NSRect(x: 0, y: 0, width: 120, height: 40))
    }

    override func viewDidAppear() {
        super.viewDidAppear()
        ShareIngest.extract(from: extensionContext) { text in
            Task { @MainActor in
                ShareIngest.persist(text)
                self.extensionContext?.completeRequest(returningItems: nil)
            }
        }
    }
}
#endif

enum ShareIngest {
    static func extract(
        from context: NSExtensionContext?,
        completion: @escaping (String) -> Void
    ) {
        guard let item = context?.inputItems.first as? NSExtensionItem else {
            completion("")
            return
        }
        if let text = item.attributedContentText?.string, !text.isEmpty {
            completion(text)
            return
        }
        let providers = item.attachments ?? []
        if let provider = providers.first(where: { $0.hasItemConformingToTypeIdentifier(UTType.url.identifier) }) {
            provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { data, _ in
                let text: String
                if let url = data as? URL {
                    text = url.absoluteString
                } else if let url = data as? NSURL {
                    text = url.absoluteString ?? ""
                } else {
                    text = item.attributedContentText?.string ?? ""
                }
                DispatchQueue.main.async { completion(text) }
            }
            return
        }
        if let provider = providers.first(where: { $0.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) }) {
            provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { data, _ in
                let text = (data as? String)
                    ?? (data as? NSString).map(String.init)
                    ?? ((data as? Data).flatMap { String(data: $0, encoding: .utf8) })
                    ?? ""
                DispatchQueue.main.async { completion(text) }
            }
            return
        }
        completion(item.attributedContentText?.string ?? "")
    }

    @MainActor
    static func persist(_ text: String) {
        guard let container = try? MemoryStore.makeContainer() else { return }
        let context = container.mainContext
        _ = InboxWriter.save(text, context: context)
        NotificationService.shared.refresh(context: context)
    }
}
