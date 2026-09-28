// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SecondMemoryKit",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "SecondMemoryCore", targets: ["SecondMemoryCore"]),
        .library(name: "SecondMemoryKit", targets: ["SecondMemoryKit"])
    ],
    targets: [
        .target(name: "SecondMemoryCore"),
        .target(name: "SecondMemoryKit", dependencies: ["SecondMemoryCore"]),
        .testTarget(name: "SecondMemoryCoreTests", dependencies: ["SecondMemoryCore"])
    ]
)
