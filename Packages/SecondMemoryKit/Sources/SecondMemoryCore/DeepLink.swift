import Foundation

public enum DeepLink: Equatable, Sendable {
    case capture
    case item(UUID)

    public init?(url: URL) {
        guard url.scheme == SM.urlScheme else { return nil }
        let host = url.host ?? url.pathComponents.dropFirst().first
        switch host {
        case SM.Link.captureHost:
            self = .capture
        case SM.Link.itemHost:
            let idString: String?
            if url.pathComponents.count >= 2 {
                idString = url.pathComponents.last
            } else {
                idString = url.path.trimmingCharacters(in: CharacterSet(charactersIn: "/")).nilIfEmpty
            }
            guard let idString, let id = UUID(uuidString: idString) else { return nil }
            self = .item(id)
        default:
            return nil
        }
    }
}

private extension String {
    var nilIfEmpty: String? { isEmpty ? nil : self }
}
