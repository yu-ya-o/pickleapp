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
    }
}
