import UIKit
import FirebaseCore
import FirebaseMessaging
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {

    private var isFirebaseConfigured = false

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Configure Firebase
        if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
           let plist = NSDictionary(contentsOfFile: path),
           let apiKey = plist["API_KEY"] as? String,
           !apiKey.hasPrefix("YOUR_") {
            FirebaseApp.configure()
            isFirebaseConfigured = true

            // Set messaging delegate only if Firebase is configured
            Messaging.messaging().delegate = self
        } else {
            print("Warning: GoogleService-Info.plist is missing or contains placeholder values. Firebase not configured.")
            print("Download GoogleService-Info.plist from Firebase Console: https://console.firebase.google.com/")
        }

        // Set notification center delegate
        UNUserNotificationCenter.current().delegate = self

        // Request notification permission
        requestNotificationPermission()

        return true
    }

    // MARK: - Notification Permission

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if let error = error {
                print("Notification permission error: \(error.localizedDescription)")
                return
            }

            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }

    // MARK: - Remote Notifications

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        // Pass device token to Firebase (only if configured)
        if isFirebaseConfigured {
            Messaging.messaging().apnsToken = deviceToken
        }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("Failed to register for remote notifications: \(error.localizedDescription)")
    }

    // MARK: - MessagingDelegate

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken = fcmToken else { return }

        print("FCM Token: \(fcmToken)")

        // Save token to UserDefaults and register with backend
        PushNotificationManager.shared.updateFCMToken(fcmToken)
    }

    // MARK: - UNUserNotificationCenterDelegate

    // Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .badge, .sound])
    }

    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        // Handle notification data
        if let type = userInfo["type"] as? String,
           let relatedId = userInfo["relatedId"] as? String {
            NotificationCenter.default.post(
                name: .pushNotificationReceived,
                object: nil,
                userInfo: ["type": type, "relatedId": relatedId]
            )
        }

        completionHandler()
    }

    // MARK: - Custom URL Scheme

    // Handle Custom URL Scheme (e.g., picklehub://events/123)
    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey : Any] = [:]
    ) -> Bool {
        handleDeepLink(url)
        return true
    }

    private func handleDeepLink(_ url: URL) {
        print("📱 Deep Link received: \(url)")

        // Parse URL path
        let pathComponents = url.pathComponents

        // Handle picklehub://events/{eventId}
        if url.scheme == Config.urlScheme && pathComponents.count >= 2 && pathComponents[0] == "/" && url.host == "events" {
            let eventId = pathComponents[1]
            print("🎯 Opening event: \(eventId)")

            NotificationCenter.default.post(
                name: .deepLinkReceived,
                object: nil,
                userInfo: ["type": "event", "eventId": eventId]
            )
        }
        // Handle picklehub://teams/{teamId}/events/{eventId}
        else if url.scheme == Config.urlScheme && url.host == "teams" && pathComponents.count >= 4 && pathComponents[2] == "events" {
            let teamId = pathComponents[1]
            let eventId = pathComponents[3]
            print("🎯 Opening team event: teamId=\(teamId), eventId=\(eventId)")

            NotificationCenter.default.post(
                name: .deepLinkReceived,
                object: nil,
                userInfo: ["type": "teamEvent", "teamId": teamId, "eventId": eventId]
            )
        }
    }
}

// MARK: - Notification Name Extension

extension Foundation.Notification.Name {
    static let pushNotificationReceived = Foundation.Notification.Name("pushNotificationReceived")
    static let deepLinkReceived = Foundation.Notification.Name("deepLinkReceived")
}
