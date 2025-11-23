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
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: startTime)
    }

    var endDate: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: endTime)
    }

    var formattedDate: String {
        guard let date = startDate else {
            print("⚠️ Event formattedDate: startDate is nil for event '\(title)'")
            print("   startTime string: '\(startTime)'")
            return ""
        }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        let formatted = formatter.string(from: date)
        print("✅ Event formattedDate: '\(formatted)' for event '\(title)'")
        return formatted
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
