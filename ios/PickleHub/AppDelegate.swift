import UIKit
import FirebaseCore
import FirebaseMessaging
import FirebaseDynamicLinks
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

    // MARK: - Dynamic Links

    // Handle Universal Links
    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        guard isFirebaseConfigured else { return false }

        if let incomingURL = userActivity.webpageURL {
            let handled = DynamicLinks.dynamicLinks().handleUniversalLink(incomingURL) { dynamicLink, error in
                if let error = error {
                    print("Dynamic Link error: \(error.localizedDescription)")
                    return
                }

                if let dynamicLink = dynamicLink, let url = dynamicLink.url {
                    self.handleDynamicLink(url)
                }
            }
            return handled
        }
        return false
    }

    // Handle Custom URL Scheme
    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey : Any] = [:]
    ) -> Bool {
        guard isFirebaseConfigured else { return false }

        if let dynamicLink = DynamicLinks.dynamicLinks().dynamicLink(fromCustomSchemeURL: url) {
            if let url = dynamicLink.url {
                handleDynamicLink(url)
            }
            return true
        }
        return false
    }

    private func handleDynamicLink(_ url: URL) {
        print("📱 Dynamic Link received: \(url)")

        // Parse URL path
        let pathComponents = url.pathComponents

        // Handle /events/{eventId}
        if pathComponents.count >= 3 && pathComponents[1] == "events" {
            let eventId = pathComponents[2]
            print("🎯 Opening event: \(eventId)")

            NotificationCenter.default.post(
                name: .dynamicLinkReceived,
                object: nil,
                userInfo: ["type": "event", "eventId": eventId]
            )
        }
        // Handle /teams/{teamId}/events/{eventId}
        else if pathComponents.count >= 5 && pathComponents[1] == "teams" && pathComponents[3] == "events" {
            let teamId = pathComponents[2]
            let eventId = pathComponents[4]
            print("🎯 Opening team event: teamId=\(teamId), eventId=\(eventId)")

            NotificationCenter.default.post(
                name: .dynamicLinkReceived,
                object: nil,
                userInfo: ["type": "teamEvent", "teamId": teamId, "eventId": eventId]
            )
        }
    }
}

// MARK: - Notification Name Extension

extension Foundation.Notification.Name {
    static let pushNotificationReceived = Foundation.Notification.Name("pushNotificationReceived")
    static let dynamicLinkReceived = Foundation.Notification.Name("dynamicLinkReceived")
}
