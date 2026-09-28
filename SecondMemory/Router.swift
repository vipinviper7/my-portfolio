import Foundation
import Observation
import SecondMemoryCore

@Observable
@MainActor
final class Router {
    var pending: DeepLink?
    var captureNonce: Int = 0

    func open(_ link: DeepLink) {
        pending = link
        if case .capture = link {
            captureNonce += 1
        }
    }

    func consumeItem() -> UUID? {
        guard case .item(let id) = pending else { return nil }
        pending = nil
        return id
    }
}
