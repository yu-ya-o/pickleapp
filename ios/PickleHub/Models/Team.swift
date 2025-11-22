import Foundation

// MARK: - Team

struct Team: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String
    let iconImage: String?
    let visibility: String // "public" or "private"
    let createdAt: String
    let updatedAt: String
    let owner: TeamOwner
    let memberCount: Int
    let isUserMember: Bool?
    let userRole: String? // "owner", "admin", "member"
    let hasPendingJoinRequest: Bool?
    let members: [TeamMember]?

    var iconImageURL: URL? {
        guard let urlString = iconImage else { return nil }
        return URL(string: urlString)
    }

    var isPublic: Bool {
        visibility == "public"
    }

    var isPrivate: Bool {
        visibility == "private"
    }

    var formattedCreatedDate: String {
        guard let date = ISO8601DateFormatter().date(from: createdAt) else {
            return ""
        }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

struct TeamOwner: Codable, Hashable {
    let id: String
    let name: String
    let profileImage: String?
    let nickname: String?

    var displayName: String {
        nickname ?? name
    }
}

// MARK: - Team Member

struct TeamMember: Codable, Identifiable, Hashable {
    let id: String
    let role: String
    let joinedAt: String
    let user: User

    var roleDisplay: String {
        role.capitalized
    }

    var joinedDate: Date? {
        ISO8601DateFormatter().date(from: joinedAt)
    }
}

// MARK: - Create/Update Team

struct CreateTeamRequest: Codable {
    let name: String
    let description: String
    let iconImage: String?
    let visibility: String // "public" or "private"
}

struct UpdateTeamRequest: Codable {
    let name: String?
    let description: String?
    let iconImage: String?
    let visibility: String?
}

struct UpdateMemberRoleRequest: Codable {
    let role: String // "admin" or "member"
}

// MARK: - Team Join Request

struct TeamJoinRequest: Codable, Identifiable, Hashable {
    let id: String
    let status: String // "pending", "approved", "rejected"
    let createdAt: String
    let updatedAt: String
    let team: TeamJoinRequestTeam
    let user: User

    var isPending: Bool {
        status == "pending"
    }

    var formattedDate: String {
        guard let date = ISO8601DateFormatter().date(from: createdAt) else {
            return ""
        }
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct TeamJoinRequestTeam: Codable, Hashable {
    let id: String
    let name: String
    let iconImage: String?
}

struct ApproveJoinRequestRequest: Codable {
    let action: String // "approve" or "reject"
}

// MARK: - Team Invite URL

struct TeamInviteUrl: Codable, Identifiable, Hashable {
    let id: String
    let token: String
    let inviteUrl: String
    let expiresAt: String
    let usedAt: String?
    let createdAt: String
    let createdBy: InviteCreator
    let usedBy: InviteUser?

    var isExpired: Bool {
        guard let date = ISO8601DateFormatter().date(from: expiresAt) else {
            return true
        }
        return Date() > date
    }

    var isUsed: Bool {
        usedAt != nil
    }

    var isValid: Bool {
        !isExpired && !isUsed
    }

    var expiresDate: Date? {
        ISO8601DateFormatter().date(from: expiresAt)
    }
}

struct InviteCreator: Codable, Hashable {
    let id: String
    let name: String
}

struct InviteUser: Codable, Hashable {
    let id: String
    let name: String
}

struct ValidateInviteResponse: Codable {
    let valid: Bool
    let team: ValidateInviteTeam?
    let error: String?
}

struct ValidateInviteTeam: Codable {
    let id: String
    let name: String
    let description: String
    let iconImage: String?
    let memberCount: Int
}

// MARK: - Team Event

struct TeamEvent: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let location: String
    let startTime: String
    let endTime: String
    let maxParticipants: Int?
    let createdAt: String
    let updatedAt: String
    let team: TeamEventTeam
    let creator: TeamEventCreator
    let participants: [TeamEventParticipant]
    let participantCount: Int
    let availableSpots: Int?
    let isUserParticipating: Bool?

    var startDate: Date? {
        ISO8601DateFormatter().date(from: startTime)
    }

    var endDate: Date? {
        ISO8601DateFormatter().date(from: endTime)
    }

    var formattedDate: String {
        guard let date = startDate else { return "" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    var hasCapacity: Bool {
        if let max = maxParticipants {
            return participantCount < max
        }
        return true // Unlimited
    }

    var capacityText: String {
        if let max = maxParticipants, let available = availableSpots {
            return "\(available)/\(max) spots available"
        }
        return "\(participantCount) participants"
    }
}

struct TeamEventTeam: Codable, Hashable {
    let id: String
    let name: String
}

struct TeamEventCreator: Codable, Hashable {
    let id: String
    let name: String
    let profileImage: String?
    let nickname: String?

    var profileImageURL: URL? {
        guard let urlString = profileImage else { return nil }
        return URL(string: urlString)
    }

    var displayName: String {
        nickname ?? name
    }
}

struct TeamEventParticipant: Codable, Identifiable, Hashable {
    let id: String
    let status: String
    let joinedAt: String
    let user: TeamEventParticipantUser
}

struct TeamEventParticipantUser: Codable, Hashable {
    let id: String
    let name: String
    let profileImage: String?
    let nickname: String?

    var profileImageURL: URL? {
        guard let urlString = profileImage else { return nil }
        return URL(string: urlString)
    }

    var displayName: String {
        nickname ?? name
    }
}

// MARK: - Create/Update Team Event

struct CreateTeamEventRequest: Codable {
    let title: String
    let description: String
    let location: String
    let startTime: String
    let endTime: String
    let maxParticipants: Int?
}

struct UpdateTeamEventRequest: Codable {
    let title: String?
    let description: String?
    let location: String?
    let startTime: String?
    let endTime: String?
    let maxParticipants: Int?
}

// MARK: - Team Chat

struct TeamChatRoom: Codable, Identifiable, Hashable {
    let id: String
    let teamId: String
    let createdAt: String
    let messages: [TeamMessage]
}

struct TeamMessage: Codable, Identifiable, Hashable {
    let id: String
    let content: String
    let createdAt: String
    let user: TeamMessageUser

    var timestamp: Date? {
        ISO8601DateFormatter().date(from: createdAt)
    }

    var formattedTime: String {
        guard let date = timestamp else { return "" }
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct TeamMessageUser: Codable, Hashable {
    let id: String
    let name: String
    let profileImage: String?
    let nickname: String?

    var displayName: String {
        nickname ?? name
    }
}

struct SendTeamMessageRequest: Codable {
    let content: String
}
