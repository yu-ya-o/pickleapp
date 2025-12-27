import Foundation

/// Manager for generating deep links using custom URL scheme
class DeepLinkManager {
    static let shared = DeepLinkManager()

    private init() {}

    // MARK: - Generate Deep Links

    /// Generate a deep link for an event
    /// - Parameter eventId: The ID of the event
    /// - Returns: The deep link URL (e.g., picklehub://events/123)
    func generateEventLink(eventId: String) -> URL? {
        let urlString = "\(Config.urlScheme)://events/\(eventId)"
        guard let url = URL(string: urlString) else {
            print("❌ Failed to create deep link URL: \(urlString)")
            return nil
        }
        print("✅ Generated deep link: \(url)")
        return url
    }

    /// Generate a deep link for a team event
    /// - Parameters:
    ///   - teamId: The ID of the team
    ///   - eventId: The ID of the event
    /// - Returns: The deep link URL (e.g., picklehub://teams/123/events/456)
    func generateTeamEventLink(teamId: String, eventId: String) -> URL? {
        let urlString = "\(Config.urlScheme)://teams/\(teamId)/events/\(eventId)"
        guard let url = URL(string: urlString) else {
            print("❌ Failed to create deep link URL: \(urlString)")
            return nil
        }
        print("✅ Generated deep link: \(url)")
        return url
    }
}
