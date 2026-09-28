import Foundation

/// Locked product constants. Do not promote these to settings.
public enum SM: Sendable {
    public static let appName = "Second Memory"
    public static let bundleID = "com.vipinebenezer.secondmemory"
    public static let appGroupID = "group.com.vipinebenezer.secondmemory"
    public static let iCloudContainer = "iCloud.com.vipinebenezer.secondmemory"
    public static let urlScheme = "secondmemory"
    public static let widgetKindNextDue = "SecondMemoryNextDueWidget"
    public static let widgetKindCapture = "SecondMemoryCaptureWidget"
    public static let snapshotDefaultsKey = "widget.snapshot"
    public static let pendingCaptureKey = "pending.capture"
    public static let openLoopsHour = 21
    public static let tonightHour = 20
    public static let tomorrowHour = 9
    public static let doneRetentionDays = 30

    public enum Notification {
        public static let dueCategory = "SM_DUE"
        public static let openLoopsCategory = "SM_OPEN_LOOPS"
        public static let snooze1h = "SM_SNOOZE_1H"
        public static let snoozeTonight = "SM_SNOOZE_TONIGHT"
        public static let snoozeTomorrow = "SM_SNOOZE_TOMORROW"
        public static let done = "SM_DONE"
        public static let openLoopsID = "open-loops-daily"
        public static let itemIDKey = "itemID"
        public static let kindKey = "kind"
        public static let kindDue = "due"
        public static let kindOpenLoops = "openLoops"
    }

    public enum Link {
        public static let captureHost = "capture"
        public static let itemHost = "item"

        public static var capture: URL {
            URL(string: "\(SM.urlScheme)://\(captureHost)")!
        }

        public static func item(_ id: UUID) -> URL {
            URL(string: "\(SM.urlScheme)://\(itemHost)/\(id.uuidString)")!
        }
    }
}
