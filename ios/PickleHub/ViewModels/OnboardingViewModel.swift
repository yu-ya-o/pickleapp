import Foundation
import SwiftUI

@MainActor
class OnboardingViewModel: ObservableObject {
    @Published var nickname = ""
    @Published var bio = ""
    @Published var selectedGender = ""
    @Published var selectedAgeGroup = ""
    @Published var selectedRegion = ""
    @Published var selectedExperience = ""
    @Published var selectedSkillLevel = ""
    @Published var duprDoublesText = ""
    @Published var duprSinglesText = ""
    @Published var myPaddle = ""
    @Published var selectedImageData: Data?
    @Published var profileImageURL: String?

    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isCompleted = false
    @Published var updatedUser: User?

    private let apiClient = APIClient.shared

    func completeOnboarding() async {
        isLoading = true
        errorMessage = nil

        do {
            // 1. Upload profile image if selected
            var finalProfileImageURL: String? = nil
            if let imageData = selectedImageData {
                print("📤 Uploading profile image...")
                finalProfileImageURL = try await uploadImage(imageData: imageData)
                print("✅ Image uploaded: \(finalProfileImageURL ?? "nil")")
            } else {
                // If user skipped profile image, explicitly set to empty string to remove Google profile image
                print("⚠️ No profile image selected, clearing Google profile image")
                finalProfileImageURL = ""
            }

            // 2. Update profile
            print("📝 Updating profile...")

            // Convert DUPR text to Double if valid
            let duprDoubles = duprDoublesText.isEmpty ? nil : Double(duprDoublesText)
            let duprSingles = duprSinglesText.isEmpty ? nil : Double(duprSinglesText)

            let request = UpdateProfileRequest(
                nickname: nickname,
                bio: bio.isEmpty ? nil : bio,
                region: selectedRegion,
                pickleballExperience: selectedExperience,
                gender: selectedGender,
                ageGroup: selectedAgeGroup,
                skillLevel: selectedSkillLevel,
                duprDoubles: duprDoubles,
                duprSingles: duprSingles,
                myPaddle: myPaddle.isEmpty ? nil : myPaddle,
                profileImage: finalProfileImageURL
            )

            // Debug: print what we're sending
            print("📝 selectedAgeGroup: \(selectedAgeGroup)")
            if let jsonData = try? JSONEncoder().encode(request),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                print("📝 Request JSON: \(jsonString)")
            }

            let user = try await apiClient.updateProfile(request: request)
            print("✅ Profile updated successfully")
            updatedUser = user
            isCompleted = true
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Onboarding completion error: \(error)")
            if let apiError = error as? APIError {
                print("❌ API Error details: \(apiError.errorDescription ?? "unknown")")
            }
        }
    }

    private func uploadImage(imageData: Data) async throws -> String {
        guard let url = URL(string: "\(Config.apiBaseURL)/api/upload/image") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        // Get auth token
        guard let token = UserDefaults.standard.string(forKey: "authToken") else {
            throw APIError.unauthorized
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add image data
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"profile.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ Invalid HTTP response")
            throw APIError.invalidResponse
        }

        print("📊 Upload response status: \(httpResponse.statusCode)")

        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            print("❌ Upload failed with status \(httpResponse.statusCode): \(errorMessage)")
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
        }

        struct UploadResponse: Codable {
            let url: String
            let publicId: String
        }

        do {
            let uploadResponse = try JSONDecoder().decode(UploadResponse.self, from: data)
            return uploadResponse.url
        } catch {
            let responseString = String(data: data, encoding: .utf8) ?? "Unable to decode"
            print("❌ Failed to decode upload response: \(responseString)")
            throw APIError.decodingError(error)
        }
    }
}
