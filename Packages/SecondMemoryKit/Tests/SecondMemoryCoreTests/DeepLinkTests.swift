import XCTest
import SecondMemoryCore

final class DeepLinkTests: XCTestCase {
    func testCapture() {
        XCTAssertEqual(DeepLink(url: URL(string: "secondmemory://capture")!), .capture)
    }

    func testItem() {
        let id = UUID(uuidString: "A2B8C1D4-E5F6-4789-ABCD-EF0123456789")!
        XCTAssertEqual(DeepLink(url: SM.Link.item(id)), .item(id))
    }

    func testRejectsOtherSchemes() {
        XCTAssertNil(DeepLink(url: URL(string: "https://example.com")!))
    }
}
