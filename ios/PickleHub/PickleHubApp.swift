import SwiftUI
import GoogleSignIn

@main
struct PickleHubApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authViewModel = AuthViewModel()
    @State private var showingSplash = true

    var body: some Scene {
        WindowGroup {
            if showingSplash {
                SplashView()
                    .onAppear {
                        // Hide splash screen after 2.5 seconds
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                            withAnimation {
                                showingSplash = false
                            }
                        }
                    }
                    .preferredColorScheme(.light)
            } else {
                if authViewModel.isAuthenticated {
                    if authViewModel.currentUser?.isProfileComplete == false {
                        OnboardingContainerView()
                            .environmentObject(authViewModel)
                            .preferredColorScheme(.light)
                    } else {
                        MainTabView()
                            .environmentObject(authViewModel)
                            .preferredColorScheme(.light)
                    }
                } else {
                    LoginView()
                        .environmentObject(authViewModel)
                        .preferredColorScheme(.light)
                }
            }
        }
        .onOpenURL { url in
            handleIncomingURL(url)
        }
    }

    private func handleIncomingURL(_ url: URL) {
        // Universal Link: https://pickleapp.onrender.com/events/123
        // Custom Scheme: picklehub://events/123

        print("📱 Received URL: \(url.absoluteString)")

        let pathComponents = url.pathComponents
        let host = url.host

        // イベントURLの処理
        if pathComponents.contains("events") {
            if let eventIndex = pathComponents.firstIndex(of: "events"),
               eventIndex + 1 < pathComponents.count {
                let eventId = pathComponents[eventIndex + 1]

                print("🎾 Opening event: \(eventId)")

                // イベント詳細画面を開く通知を送信
                NotificationCenter.default.post(
                    name: NSNotification.Name("OpenEventDetail"),
                    object: nil,
                    userInfo: ["eventId": eventId]
                )
            }
        }

        // チームイベントURLの処理
        if pathComponents.contains("teams") && pathComponents.contains("events") {
            if let teamsIndex = pathComponents.firstIndex(of: "teams"),
               teamsIndex + 1 < pathComponents.count,
               let eventsIndex = pathComponents.firstIndex(of: "events"),
               eventsIndex + 1 < pathComponents.count {
                let teamId = pathComponents[teamsIndex + 1]
                let eventId = pathComponents[eventsIndex + 1]

                print("🎾 Opening team event: \(eventId) in team: \(teamId)")

                // チームイベント詳細画面を開く通知を送信
                NotificationCenter.default.post(
                    name: NSNotification.Name("OpenTeamEventDetail"),
                    object: nil,
                    userInfo: ["teamId": teamId, "eventId": eventId]
                )
            }
        }
    }
}
