import Foundation

struct User: Codable, Identifiable, Hashable {
    let id: String
    let email: String
    let name: String
    let profileImage: String?
    let nickname: String?
    let bio: String?
    let region: String?
    let pickleballExperience: String?
    let gender: String?
    let ageGroup: String?
    let skillLevel: String?
    let duprDoubles: Double?
    let duprSingles: Double?
    let myPaddle: String?
    let isProfileComplete: Bool

    // SNS Links
    let instagramUrl: String?
    let twitterUrl: String?
    let tiktokUrl: String?
    let lineUrl: String?

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

struct AppleSignInRequest: Codable {
    let identityToken: String
    let userIdentifier: String
    let email: String?
    let fullName: String?
}

struct AppleSignInResponse: Codable {
    let user: User
    let token: String
}

// MARK: - Profile
struct UpdateProfileRequest: Codable {
    let nickname: String?
    let bio: String?
    let region: String?
    let pickleballExperience: String?
    let gender: String?
    let ageGroup: String?
    let skillLevel: String?
    let duprDoubles: Double?
    let duprSingles: Double?
    let myPaddle: String?
    let profileImage: String?
    let instagramUrl: String?
    let twitterUrl: String?
    let tiktokUrl: String?
    let lineUrl: String?

    init(nickname: String? = nil,
         bio: String? = nil,
         region: String? = nil,
         pickleballExperience: String? = nil,
         gender: String? = nil,
         ageGroup: String? = nil,
         skillLevel: String? = nil,
         duprDoubles: Double? = nil,
         duprSingles: Double? = nil,
         myPaddle: String? = nil,
         profileImage: String? = nil,
         instagramUrl: String? = nil,
         twitterUrl: String? = nil,
         tiktokUrl: String? = nil,
         lineUrl: String? = nil) {
        self.nickname = nickname
        self.bio = bio
        self.region = region
        self.pickleballExperience = pickleballExperience
        self.gender = gender
        self.ageGroup = ageGroup
        self.skillLevel = skillLevel
        self.duprDoubles = duprDoubles
        self.duprSingles = duprSingles
        self.myPaddle = myPaddle
        self.profileImage = profileImage
        self.instagramUrl = instagramUrl
        self.twitterUrl = twitterUrl
        self.tiktokUrl = tiktokUrl
        self.lineUrl = lineUrl
    }
}
