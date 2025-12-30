import UIKit
import FirebaseCore
import FirebaseMessaging
import UserNotifications
import GoogleMaps
import GooglePlaces

class AppDelegate: NSObject, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {

    private var isFirebaseConfigured = false

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        print("🚀 App launched with options: \(String(describing: launchOptions))")

        // Configure Google Maps
        GMSServices.provideAPIKey(Config.googleMapsAPIKey)
        GMSPlacesClient.provideAPIKey(Config.googleMapsAPIKey)

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

    // MARK: - Custom URL Scheme and Universal Links

    // Handle Custom URL Scheme (e.g., picklehub://events/123)
    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey : Any] = [:]
    ) -> Bool {
        // Show alert for debugging
        DispatchQueue.main.async {
            let alert = UIAlertController(
                title: "URL Received!",
                message: "URL: \(url.absoluteString)",
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "OK", style: .default))

            if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = scene.windows.first,
               let rootVC = window.rootViewController {
                var topVC = rootVC
                while let presented = topVC.presentedViewController {
                    topVC = presented
                }
                topVC.present(alert, animated: true)
            }
        }

        handleDeepLink(url)
        return true
    }

    // Handle Universal Links (e.g., https://pickleapp.onrender.com/events/123)
    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL else {
            return false
        }

        print("📱 Universal Link received: \(url)")
        handleDeepLink(url)
        return true
    }

    private func handleDeepLink(_ url: URL) {
        print("📱 Deep Link received: \(url)")
        print("   Scheme: \(url.scheme ?? "nil")")
        print("   Host: \(url.host ?? "nil")")
        print("   Path: \(url.path)")

        // Parse URL path
        let pathComponents = url.pathComponents

        // Handle picklehub://teams/{teamId}/events/{eventId} or https://pickleapp.onrender.com/teams/{teamId}/events/{eventId}
        // Check for team events FIRST (before regular events)
        if pathComponents.contains("teams") && pathComponents.contains("events") {
            if let teamsIndex = pathComponents.firstIndex(of: "teams"),
               teamsIndex + 1 < pathComponents.count,
               let eventsIndex = pathComponents.firstIndex(of: "events"),
               eventsIndex + 1 < pathComponents.count {
                let teamId = pathComponents[teamsIndex + 1]
                let eventId = pathComponents[eventsIndex + 1]
                print("🎯 Opening team event: teamId=\(teamId), eventId=\(eventId)")

                // Save to UserDefaults for later
                UserDefaults.standard.set(teamId, forKey: "pendingTeamId")
                UserDefaults.standard.set(eventId, forKey: "pendingTeamEventId")

                // Also send notification for immediate handling
                NotificationCenter.default.post(
                    name: .deepLinkReceived,
                    object: nil,
                    userInfo: ["type": "teamEvent", "teamId": teamId, "eventId": eventId]
                )
            }
        }
        // Handle picklehub://events/{eventId} or https://pickleapp.onrender.com/events/{eventId}
        else if pathComponents.contains("events") {
            if let eventIndex = pathComponents.firstIndex(of: "events"),
               eventIndex + 1 < pathComponents.count {
                let eventId = pathComponents[eventIndex + 1]
                print("🎯 Opening event: \(eventId)")

                // Save to UserDefaults for later (in case MainTabView is not loaded yet)
                UserDefaults.standard.set(eventId, forKey: "pendingEventId")

                // Also send notification for immediate handling
                NotificationCenter.default.post(
                    name: .deepLinkReceived,
                    object: nil,
                    userInfo: ["type": "event", "eventId": eventId]
                )
            }
        }
    }
}

// MARK: - Notification Name Extension

extension Foundation.Notification.Name {
    static let pushNotificationReceived = Foundation.Notification.Name("pushNotificationReceived")
    static let deepLinkReceived = Foundation.Notification.Name("deepLinkReceived")
}
