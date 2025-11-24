import SwiftUI
import GoogleSignIn

@main
struct PickleHubApp: App {
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
            } else {
                if authViewModel.isAuthenticated {
                    if authViewModel.currentUser?.isProfileComplete == false {
                        OnboardingContainerView()
                            .environmentObject(authViewModel)
                    } else {
                        MainTabView()
                            .environmentObject(authViewModel)
                    }
                } else {
                    LoginView()
                        .environmentObject(authViewModel)
                }
            }
        }
    }
}
