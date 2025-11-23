import Foundation

struct Event: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let location: String
    let startTime: String
    let endTime: String
    let maxParticipants: Int
    let skillLevel: String
    let status: String
    let createdAt: String
    let updatedAt: String
    let creator: User
    let reservations: [Reservation]
    let availableSpots: Int
    let isUserReserved: Bool?

    // Computed properties
    var startDate: Date? {
        ISO8601DateFormatter().date(from: startTime)
    }

    var endDate: Date? {
        ISO8601DateFormatter().date(from: endTime)
    }

    var formattedDate: String {
        guard let date = startDate else { return "" }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    var skillLevelEmoji: String {
        switch skillLevel.lowercased() {
        case "beginner": return "🟢"
        case "intermediate": return "🟡"
        case "advanced": return "🔴"
        default: return "⚪️"
        }
    }
}

// MARK: - Create/Update Requests
struct CreateEventRequest: Codable {
    let title: String
    let description: String
    let location: String
    let startTime: String
    let endTime: String
    let maxParticipants: Int
    let skillLevel: String
}

struct UpdateEventRequest: Codable {
    let title: String?
    let description: String?
    let location: String?
    let startTime: String?
    let endTime: String?
    let maxParticipants: Int?
    let skillLevel: String?
    let status: String?
}
