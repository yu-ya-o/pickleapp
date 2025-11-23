import Foundation
import SwiftUI

@MainActor
class NotificationsViewModel: ObservableObject {
    @Published var notifications: [Notification] = []
    @Published var unreadCount: Int = 0
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared

    // MARK: - Fetch Notifications

    func fetchNotifications() async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await apiClient.getNotifications()
            notifications = response.notifications
            unreadCount = response.unreadCount
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Fetch notifications error: \(error)")
        }
    }

    // MARK: - Mark as Read

    func markAsRead(notificationId: String) async {
        do {
            try await apiClient.markNotificationAsRead(notificationId: notificationId)

            // Update local state
            if let index = notifications.firstIndex(where: { $0.id == notificationId }) {
                var updatedNotification = notifications[index]
                // Since Notification is a struct, we need to replace it
                // We'll refetch to get the updated state
                await fetchNotifications()
            }
        } catch {
            errorMessage = error.localizedDescription
            print("Mark notification as read error: \(error)")
        }
    }

    // MARK: - Mark All as Read

    func markAllAsRead() async {
        do {
            try await apiClient.markAllNotificationsAsRead()
            await fetchNotifications()
        } catch {
            errorMessage = error.localizedDescription
            print("Mark all notifications as read error: \(error)")
        }
    }

    // MARK: - Delete Notification

    func deleteNotification(notificationId: String) async {
        do {
            try await apiClient.deleteNotification(notificationId: notificationId)
            notifications.removeAll { $0.id == notificationId }
            // Update unread count if the deleted notification was unread
            await fetchNotifications()
        } catch {
            errorMessage = error.localizedDescription
            print("Delete notification error: \(error)")
        }
    }

    // MARK: - Refresh

    func refresh() async {
        await fetchNotifications()
    }
}
