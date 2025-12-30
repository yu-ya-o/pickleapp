import Foundation

enum Config {
    // MARK: - API Configuration
    #if DEBUG
    // 開発環境（一時的に本番環境を使用）
    static let apiBaseURL = "https://pickleapp.onrender.com"
    static let websocketURL = "wss://pickleapp-websocket.onrender.com"
    #else
    // 本番環境
    static let apiBaseURL = "https://pickleapp.onrender.com"
    static let websocketURL = "wss://pickleapp-websocket.onrender.com"
    #endif

    // MARK: - Google Sign-In
    static let googleClientID = "738453907848-foqdf7208fdh9odmttp2i377o0qnf09j.apps.googleusercontent.com"

    // MARK: - Google Maps
    // TODO: Replace with your actual Google Maps API key
    // You can get an API key from: https://console.cloud.google.com/
    // Required APIs: Maps SDK for iOS, Places API
    static let googleMapsAPIKey = "AIzaSyDvDEIGImbCrkgYIvuccyo6WiyEsxKUhtY"

    // MARK: - Deep Links (Custom URL Scheme)
    // This is the URL scheme for sharing events (e.g., picklehub://events/123)
    static let urlScheme = "picklehub"

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
