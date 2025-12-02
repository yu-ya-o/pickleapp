import Foundation

class PushNotificationManager {
    static let shared = PushNotificationManager()

    private let fcmTokenKey = "fcmToken"
    private let apiClient = APIClient.shared

    private init() {}

    /// Current FCM token stored locally
    var currentToken: String? {
        UserDefaults.standard.string(forKey: fcmTokenKey)
    }

    /// Update FCM token and register with backend if authenticated
    func updateFCMToken(_ token: String) {
        let previousToken = currentToken
        UserDefaults.standard.set(token, forKey: fcmTokenKey)

        // Only register if token changed
        if token != previousToken {
            registerTokenWithBackend(token)
        }
    }

    /// Register current token with backend
    func registerTokenWithBackend(_ token: String? = nil) {
        let tokenToRegister = token ?? currentToken

        guard let fcmToken = tokenToRegister else {
            return
        }

        Task {
            do {
                try await apiClient.registerDeviceToken(fcmToken: fcmToken)
                print("FCM token registered with backend")
            } catch {
                print("Failed to register FCM token: \(error.localizedDescription)")
            }
        }
    }

    /// Remove token from backend (called on logout)
    func unregisterToken() {
        Task {
            do {
                try await apiClient.unregisterDeviceToken()
                print("FCM token unregistered from backend")
            } catch {
                print("Failed to unregister FCM token: \(error.localizedDescription)")
            }
        }
    }

    /// Clear local token
    func clearLocalToken() {
        UserDefaults.standard.removeObject(forKey: fcmTokenKey)
    }
}
