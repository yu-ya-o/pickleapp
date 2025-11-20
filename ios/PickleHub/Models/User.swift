import Foundation

struct User: Codable, Identifiable, Hashable {
    let id: String
    let email: String
    let name: String
    let profileImage: String?
    let nickname: String?
    let region: String?
    let pickleballExperience: String?
    let gender: String?
    let skillLevel: String?
    let isProfileComplete: Bool

    var profileImageURL: URL? {
        guard let urlString = profileImage else { return nil }
        return URL(string: urlString)
    }

    var displayName: String {
        nickname ?? name
    }
}

// MARK: - Auth Response
struct GoogleSignInRequest: Codable {
    let idToken: String
}

struct GoogleSignInResponse: Codable {
    let user: User
    let token: String
}

// MARK: - Profile
struct UpdateProfileRequest: Codable {
    let nickname: String?
    let region: String?
    let pickleballExperience: String?
    let gender: String?
    let skillLevel: String?
    let profileImage: String?

    init(nickname: String? = nil,
         region: String? = nil,
         pickleballExperience: String? = nil,
         gender: String? = nil,
         skillLevel: String? = nil,
         profileImage: String? = nil) {
        self.nickname = nickname
        self.region = region
        self.pickleballExperience = pickleballExperience
        self.gender = gender
        self.skillLevel = skillLevel
        self.profileImage = profileImage
    }
}
