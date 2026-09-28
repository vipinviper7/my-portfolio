# Second Memory

A private inbox for thoughts that would otherwise vanish. Type something, it’s saved. Optional times bring it back. Search finds it later.

Personal app for Vipin Ebenezer. Not a Reminders clone, not a project manager.

## Open in Xcode

Requires **Xcode 16 or later** on a Mac, plus an Apple ID (free team is enough to run on Simulator).

1. Copy this folder onto a Mac.
2. Open `SecondMemory.xcodeproj`.
3. Select the **SecondMemory** scheme.
4. Signing & Capabilities → **Team** → your Apple ID.
5. Run on **iPhone Simulator** or **My Mac**.

First launch is the capture field. There is no onboarding.

### Destinations

| Run on | What you get |
| --- | --- |
| iPhone | Capture, Now + Inbox, search, notifications, widgets, share sheet |
| Mac | Same inbox, menu-bar capture, ⌘N / ⌘↩, Spotlight |

iOS 17+ / macOS 14+. SwiftUI, SwiftData. No account besides Apple ID.

## What ships

- Capture field always first. No title, list, tag, or time required. Empty after save.
- One inbox (undated) + Now (anything with a time).
- Optional due time on an item. Snooze: **1 Hour / Tonight 20:00 / Tomorrow 09:00**. Done.
- Daily open-loops nudge at **21:00** local, only when undated items exist.
- Search including done items for **30 days**, then hidden (not deleted).
- Badge = **overdue count only**.
- Share sheet (text / URL) and widgets (next due + capture).
- Shortcuts: “Remember this in Second Memory”.
- Private SwiftData store. Does **not** read or write Apple Reminders.

## iCloud

The store tries CloudKit, then falls back to on-device so a missing container never blocks capture.

To sync iPhone ↔ Mac:

1. Signing & Capabilities on **SecondMemory**.
2. Enable **iCloud** with CloudKit. Container: `iCloud.com.vipinebenezer.secondmemory`.
3. Enable **App Groups**: `group.com.vipinebenezer.secondmemory`.
4. Enable **Push Notifications** (CloudKit silent push).
5. Same Apple ID on both devices.

If signing fails on a free team, uncheck iCloud / Push / App Groups. The app still runs locally; widgets and share may not share a store until App Groups is on.

## Tests

In Xcode: Product → Test. The local package `Packages/SecondMemoryKit` covers snooze dates, Now vs Inbox, overdue badge math, and 30-day done visibility.

## Layout

```
SecondMemory.xcodeproj      Multiplatform app + widget + share
SecondMemory/               SwiftUI app (iOS + macOS)
SecondMemoryWidgets/        Lock Screen / Home Screen / Mac widgets
SecondMemoryShare/          Share sheet → inbox
Packages/SecondMemoryKit/   SwiftData model, notifications, policy
```

## Not in MVP

Lists, tags, recurrences, location, voice, photos, natural-language times, Apple Reminders, Watch, web.
