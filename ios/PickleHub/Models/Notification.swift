import Foundation

struct Notification: Codable, Identifiable {
    let id: String
    let userId: String
    let type: NotificationType
    let title: String
    let message: String
    let relatedId: String? // eventId, teamId, etc.
    let isRead: Bool
    let createdAt: String

    var createdDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: createdAt)
    }

    var formattedDate: String {
        guard let date = createdDate else { return "" }
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    var icon: String {
        switch type {
        case .eventJoined:
            return "person.badge.plus.fill"
        case .eventCancelled:
            return "person.badge.minus.fill"
        case .teamJoinRequest:
            return "person.crop.circle.badge.plus"
        case .teamMemberLeft:
            return "person.crop.circle.badge.minus"
        case .teamJoinApproved:
            return "checkmark.circle.fill"
        case .teamJoinRejected:
            return "xmark.circle.fill"
        case .eventChatMessage:
            return "message.fill"
        case .teamChatMessage:
            return "bubble.left.and.bubble.right.fill"
        case .eventUpdated:
            return "calendar.badge.exclamationmark"
        case .eventCancelledByCreator:
            return "calendar.badge.minus"
        case .eventReminder:
            return "bell.fill"
        case .teamRoleChanged:
            return "crown.fill"
        case .teamEventCreated:
            return "calendar.badge.plus"
        }
    }

    var iconColor: String {
        switch type {
        case .eventJoined, .teamJoinApproved, .teamEventCreated:
            return "green"
        case .eventCancelled, .teamMemberLeft, .teamJoinRejected, .eventCancelledByCreator:
            return "red"
        case .teamJoinRequest, .eventReminder:
            return "orange"
        case .eventChatMessage, .teamChatMessage:
            return "blue"
        case .eventUpdated, .teamRoleChanged:
            return "purple"
        }
    }
}

enum NotificationType: String, Codable {
    case eventJoined = "event_joined"                    // 1. イベント参加
    case eventCancelled = "event_cancelled"              // 2. イベント参加キャンセル
    case teamJoinRequest = "team_join_request"           // 3. チーム参加申請
    case teamMemberLeft = "team_member_left"             // 4. チーム離脱
    case teamJoinApproved = "team_join_approved"         // 5. 申請許可
    case teamJoinRejected = "team_join_rejected"         // 5. 申請拒否
    case eventChatMessage = "event_chat_message"         // 6,7. イベントチャット
    case teamChatMessage = "team_chat_message"           // 8. チームチャット
    case eventUpdated = "event_updated"                  // 9. イベント情報変更
    case eventCancelledByCreator = "event_cancelled_by_creator" // 10. イベントキャンセル
    case eventReminder = "event_reminder"                // 11. イベントリマインダー
    case teamRoleChanged = "team_role_changed"           // 12. 役割変更
    case teamEventCreated = "team_event_created"         // 13. チームイベント作成
}

struct NotificationsResponse: Codable {
    let notifications: [Notification]
    let unreadCount: Int
}

struct MarkNotificationReadRequest: Codable {
    let notificationId: String
}
