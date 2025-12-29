import Foundation

/// Manager for generating shareable links
class DeepLinkManager {
    static let shared = DeepLinkManager()

    private init() {}

    // Web base URL for shareable links
    private var webBaseURL: String {
        #if DEBUG
        return "https://pickleapp-dev.onrender.com"
        #else
        return "https://pickleapp.onrender.com"
        #endif
    }

    // MARK: - Generate Shareable Links

    /// Generate a shareable link for an event
    /// - Parameter eventId: The ID of the event
    /// - Returns: The shareable URL (e.g., https://pickleapp.onrender.com/events/123)
    func generateEventLink(eventId: String) -> URL? {
        let urlString = "\(webBaseURL)/events/\(eventId)"
        guard let url = URL(string: urlString) else {
            print("❌ Failed to create shareable URL: \(urlString)")
            return nil
        }
        print("✅ Generated shareable link: \(url)")
        return url
    }

    /// Generate a shareable link for a team event
    /// - Parameters:
    ///   - teamId: The ID of the team
    ///   - eventId: The ID of the event
    /// - Returns: The shareable URL (e.g., https://pickleapp.onrender.com/teams/123/events/456)
    func generateTeamEventLink(teamId: String, eventId: String) -> URL? {
        let urlString = "\(webBaseURL)/teams/\(teamId)/events/\(eventId)"
        guard let url = URL(string: urlString) else {
            print("❌ Failed to create shareable URL: \(urlString)")
            return nil
        }
        print("✅ Generated shareable link: \(url)")
        return url
    }
}
