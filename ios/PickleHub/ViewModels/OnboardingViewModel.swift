import Foundation
import SwiftUI

@MainActor
class OnboardingViewModel: ObservableObject {
    @Published var nickname = ""
    @Published var selectedGender = ""
    @Published var selectedRegion = ""
    @Published var selectedExperience = ""
    @Published var selectedSkillLevel = ""
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
            if let imageData = selectedImageData {
                profileImageURL = try await uploadImage(imageData: imageData)
            }

            // 2. Update profile
            let request = UpdateProfileRequest(
                nickname: nickname,
                region: selectedRegion,
                pickleballExperience: selectedExperience,
                gender: selectedGender,
                skillLevel: selectedSkillLevel,
                profileImage: profileImageURL
            )

            let user = try await apiClient.updateProfile(request: request)
            updatedUser = user
            isCompleted = true
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Onboarding completion error: \(error)")
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

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }

        struct UploadResponse: Codable {
            let url: String
            let publicId: String
        }

        let uploadResponse = try JSONDecoder().decode(UploadResponse.self, from: data)
        return uploadResponse.url
    }
}
