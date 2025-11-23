import Foundation

struct ChatRoom: Codable, Identifiable, Hashable {
    let id: String
    let eventId: String
    let createdAt: String
    let messages: [Message]
}

struct Message: Codable, Identifiable, Hashable {
    let id: String
    let content: String
    let createdAt: String
    let user: MessageUser

    var timestamp: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAt) {
            return date
        }
        // Fallback without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: createdAt)
    }

    var formattedTime: String {
        guard let date = timestamp else { return "" }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ja_JP")

        let calendar = Calendar.current
        let now = Date()

        if calendar.isDateInToday(date) {
            // 今日の場合は時刻のみ
            formatter.timeStyle = .short
            return formatter.string(from: date)
        } else if calendar.isDateInYesterday(date) {
            // 昨日の場合
            formatter.timeStyle = .short
            return "昨日 " + formatter.string(from: date)
        } else if let daysAgo = calendar.dateComponents([.day], from: date, to: now).day, daysAgo < 7 {
            // 1週間以内の場合は曜日+時刻
            formatter.dateFormat = "E HH:mm"
            return formatter.string(from: date)
        } else {
            // それ以外は日付+時刻
            formatter.dateFormat = "M/d HH:mm"
            return formatter.string(from: date)
        }
    }
}

struct MessageUser: Codable, Hashable {
    let id: String
    let name: String
    let profileImage: String?
    let nickname: String?

    var displayName: String {
        nickname ?? name
    }
}

// MARK: - Send Message Request
struct SendMessageRequest: Codable {
    let chatRoomId: String
    let content: String
}

// MARK: - WebSocket Messages
struct WSMessage: Codable {
    let type: String
    let data: WSMessageData?
    let error: String?
}

struct WSMessageData: Codable {
    let chatRoomId: String?
    let userId: String?
    let message: Message?
    let user: MessageUser?
}

// WebSocket outgoing messages
struct WSJoinMessage: Codable {
    let type: String = "join"
    let chatRoomId: String
    let token: String
}

struct WSChatMessage: Codable {
    let type: String = "message"
    let content: String
}

struct WSLeaveMessage: Codable {
    let type: String = "leave"
}
