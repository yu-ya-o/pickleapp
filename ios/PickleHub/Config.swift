import Foundation

enum Config {
    // MARK: - API Configuration
    static let apiBaseURL = "http://localhost:3001"
    static let websocketURL = "ws://localhost:3002"

    // MARK: - Google Sign-In
    // Replace with your actual Google Client ID from Google Cloud Console
    static let googleClientID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"

    // MARK: - API Endpoints
    enum Endpoint {
        static let auth = "/api/auth/google"
        static let events = "/api/events"
        static let reservations = "/api/reservations"
        static let chatMessages = "/api/chat/messages"

        static func event(id: String) -> String {
            "/api/events/\(id)"
        }

        static func chatRoom(eventId: String) -> String {
            "/api/chat/rooms/\(eventId)"
        }

        static func reservation(id: String) -> String {
            "/api/reservations/\(id)"
        }
    }
}
