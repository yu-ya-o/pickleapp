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
        ISO8601DateFormatter().date(from: createdAt)
    }

    var formattedTime: String {
        guard let date = timestamp else { return "" }
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct MessageUser: Codable, Hashable {
    let id: String
    let name: String
    let profileImage: String?
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
