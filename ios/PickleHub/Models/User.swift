import Foundation

struct User: Codable, Identifiable, Hashable {
    let id: String
    let email: String
    let name: String
    let profileImage: String?

    var profileImageURL: URL? {
        guard let urlString = profileImage else { return nil }
        return URL(string: urlString)
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
