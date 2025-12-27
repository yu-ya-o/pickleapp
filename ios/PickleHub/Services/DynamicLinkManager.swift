import Foundation
import FirebaseDynamicLinks

class DynamicLinkManager {
    static let shared = DynamicLinkManager()

    private init() {}

    // MARK: - Generate Dynamic Links

    /// Generate a Dynamic Link for an event
    /// - Parameter eventId: The ID of the event
    /// - Returns: The short Dynamic Link URL, or nil if generation fails
    func generateEventLink(eventId: String) -> URL? {
        // Check if domain is configured
        guard Config.dynamicLinkDomain != "YOUR_DYNAMIC_LINK_DOMAIN" else {
            print("⚠️ Dynamic Link domain not configured in Config.swift")
            return nil
        }

        // Build the deep link URL (e.g., https://picklehub.page.link/events/123)
        guard let link = URL(string: "https://\(Config.dynamicLinkDomain)/events/\(eventId)") else {
            print("❌ Failed to create deep link URL")
            return nil
        }

        // Create Dynamic Link components
        guard let linkBuilder = DynamicLinkComponents(link: link, domainURIPrefix: "https://\(Config.dynamicLinkDomain)") else {
            print("❌ Failed to create DynamicLinkComponents")
            return nil
        }

        // iOS parameters
        linkBuilder.iOSParameters = DynamicLinkIOSParameters(bundleID: Bundle.main.bundleIdentifier ?? "com.picklehub.app")
        linkBuilder.iOSParameters?.appStoreID = Config.appStoreID

        // Social meta tags for sharing
        linkBuilder.socialMetaTagParameters = DynamicLinkSocialMetaTagParameters()
        linkBuilder.socialMetaTagParameters?.title = "PickleHub イベント"
        linkBuilder.socialMetaTagParameters?.descriptionText = "ピックルボールイベントに参加しよう！"

        // Generate short link
        var generatedLink: URL?
        let semaphore = DispatchSemaphore(value: 0)

        linkBuilder.shorten { url, warnings, error in
            if let error = error {
                print("❌ Failed to shorten Dynamic Link: \(error.localizedDescription)")
            } else if let url = url {
                print("✅ Generated short Dynamic Link: \(url)")
                generatedLink = url
            }

            if let warnings = warnings {
                for warning in warnings {
                    print("⚠️ Dynamic Link warning: \(warning)")
                }
            }

            semaphore.signal()
        }

        // Wait for async operation to complete (with timeout)
        _ = semaphore.wait(timeout: .now() + 5.0)

        return generatedLink
    }

    /// Generate a Dynamic Link for a team event
    /// - Parameters:
    ///   - teamId: The ID of the team
    ///   - eventId: The ID of the event
    /// - Returns: The short Dynamic Link URL, or nil if generation fails
    func generateTeamEventLink(teamId: String, eventId: String) -> URL? {
        // Check if domain is configured
        guard Config.dynamicLinkDomain != "YOUR_DYNAMIC_LINK_DOMAIN" else {
            print("⚠️ Dynamic Link domain not configured in Config.swift")
            return nil
        }

        // Build the deep link URL
        guard let link = URL(string: "https://\(Config.dynamicLinkDomain)/teams/\(teamId)/events/\(eventId)") else {
            print("❌ Failed to create deep link URL")
            return nil
        }

        // Create Dynamic Link components
        guard let linkBuilder = DynamicLinkComponents(link: link, domainURIPrefix: "https://\(Config.dynamicLinkDomain)") else {
            print("❌ Failed to create DynamicLinkComponents")
            return nil
        }

        // iOS parameters
        linkBuilder.iOSParameters = DynamicLinkIOSParameters(bundleID: Bundle.main.bundleIdentifier ?? "com.picklehub.app")
        linkBuilder.iOSParameters?.appStoreID = Config.appStoreID

        // Social meta tags for sharing
        linkBuilder.socialMetaTagParameters = DynamicLinkSocialMetaTagParameters()
        linkBuilder.socialMetaTagParameters?.title = "PickleHub チームイベント"
        linkBuilder.socialMetaTagParameters?.descriptionText = "チームイベントに参加しよう！"

        // Generate short link
        var generatedLink: URL?
        let semaphore = DispatchSemaphore(value: 0)

        linkBuilder.shorten { url, warnings, error in
            if let error = error {
                print("❌ Failed to shorten Dynamic Link: \(error.localizedDescription)")
            } else if let url = url {
                print("✅ Generated short Dynamic Link: \(url)")
                generatedLink = url
            }

            if let warnings = warnings {
                for warning in warnings {
                    print("⚠️ Dynamic Link warning: \(warning)")
                }
            }

            semaphore.signal()
        }

        // Wait for async operation to complete (with timeout)
        _ = semaphore.wait(timeout: .now() + 5.0)

        return generatedLink
    }
}
