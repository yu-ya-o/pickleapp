import Foundation
import SwiftUI
import GoogleSignIn
import AuthenticationServices

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var authToken: String?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared

    init() {
        // Check if user is already signed in
        checkAuthStatus()
    }

    // MARK: - Authentication

    func checkAuthStatus() {
        print("🔍 Checking auth status...")
        // Check if we have saved auth token
        if let token = UserDefaults.standard.string(forKey: "authToken"),
           let userData = UserDefaults.standard.data(forKey: "currentUser"),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            print("✅ Found saved auth data")
            print("   User ID: \(user.id)")
            print("   User email: \(user.email)")
            print("   User nickname: \(user.nickname ?? "nil")")
            print("   User profileImage: \(user.profileImage ?? "nil")")
            print("   User profileImageURL: \(user.profileImageURL?.absoluteString ?? "nil")")
            self.authToken = token
            self.currentUser = user
            self.isAuthenticated = true
            apiClient.setAuthToken(token)
        } else {
            print("⚠️ No saved auth data found")
        }
    }

    func handleAppleSignIn(result: Result<ASAuthorization, Error>) async {
        isLoading = true
        errorMessage = nil

        do {
            switch result {
            case .success(let authorization):
                guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
                    throw NSError(domain: "AuthViewModel", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid Apple ID credential"])
                }

                guard let identityToken = appleIDCredential.identityToken,
                      let identityTokenString = String(data: identityToken, encoding: .utf8) else {
                    throw NSError(domain: "AuthViewModel", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get identity token"])
                }

                // Get user info (only available on first sign-in)
                let fullName: String? = {
                    if let givenName = appleIDCredential.fullName?.givenName,
                       let familyName = appleIDCredential.fullName?.familyName {
                        return "\(givenName) \(familyName)"
                    }
                    return appleIDCredential.fullName?.givenName
                }()

                // Send to backend
                let response = try await apiClient.signInWithApple(
                    identityToken: identityTokenString,
                    userIdentifier: appleIDCredential.user,
                    email: appleIDCredential.email,
                    fullName: fullName
                )

                print("📥 Received Apple sign-in response")
                print("   User ID: \(response.user.id)")
                print("   User email: \(response.user.email)")
                print("   User nickname: \(response.user.nickname ?? "nil")")

                // Save auth state
                self.currentUser = response.user
                self.authToken = response.token
                self.isAuthenticated = true

                // Persist to UserDefaults
                UserDefaults.standard.set(response.token, forKey: "authToken")
                if let userData = try? JSONEncoder().encode(response.user) {
                    UserDefaults.standard.set(userData, forKey: "currentUser")
                    print("💾 Saved user data to UserDefaults")
                }

                isLoading = false

            case .failure(let error):
                throw error
            }
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Apple Sign-In error: \(error)")
        }
    }

    func signInWithGoogle() async {
        isLoading = true
        errorMessage = nil

        do {
            // Get the root view controller
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                throw NSError(domain: "AuthViewModel", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to get root view controller"])
            }

            // Configure Google Sign-In
            let config = GIDConfiguration(clientID: Config.googleClientID)
            GIDSignIn.sharedInstance.configuration = config

            // Sign in
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)

            // Get ID token
            guard let idToken = result.user.idToken?.tokenString else {
                throw NSError(domain: "AuthViewModel", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get ID token"])
            }

            // Send to backend
            let response = try await apiClient.signInWithGoogle(idToken: idToken)

            print("📥 Received sign-in response")
            print("   User ID: \(response.user.id)")
            print("   User email: \(response.user.email)")
            print("   User nickname: \(response.user.nickname ?? "nil")")
            print("   User profileImage: \(response.user.profileImage ?? "nil")")
            print("   User profileImageURL: \(response.user.profileImageURL?.absoluteString ?? "nil")")

            // Save auth state
            self.currentUser = response.user
            self.authToken = response.token
            self.isAuthenticated = true

            // Persist to UserDefaults
            UserDefaults.standard.set(response.token, forKey: "authToken")
            if let userData = try? JSONEncoder().encode(response.user) {
                UserDefaults.standard.set(userData, forKey: "currentUser")
                print("💾 Saved user data to UserDefaults")
            } else {
                print("❌ Failed to encode user data")
            }

            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Google Sign-In error: \(error)")
        }
    }

    func signOut() {
        GIDSignIn.sharedInstance.signOut()

        isAuthenticated = false
        currentUser = nil
        authToken = nil

        // Clear UserDefaults
        UserDefaults.standard.removeObject(forKey: "authToken")
        UserDefaults.standard.removeObject(forKey: "currentUser")

        // Clear API client token
        apiClient.setAuthToken(nil)
    }

    func deleteAccount() async throws {
        isLoading = true
        errorMessage = nil

        do {
            // Call the delete account API
            try await apiClient.deleteAccount()

            // Sign out after successful deletion
            signOut()

            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            throw error
        }
    }
}
