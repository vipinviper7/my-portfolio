#if canImport(WidgetKit)
import WidgetKit

enum WidgetReloader {
    static func reload() {
        WidgetCenter.shared.reloadAllTimelines()
    }
}
#else
enum WidgetReloader {
    static func reload() {}
}
#endif
