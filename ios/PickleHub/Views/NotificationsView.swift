import SwiftUI

struct NotificationsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var viewModel: NotificationsViewModel
    @Environment(\.openDrawer) var openDrawer
    @State private var showingMarkAllAlert = false
    @State private var selectedEventId: String?
    @State private var selectedTeamId: String?
    @State private var selectedTeamEventIds: (teamId: String, eventId: String)?
    @State private var showingEventDetail = false
    @State private var showingTeamDetail = false
    @State private var showingTeamEventDetail = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // ハンバーガーメニューヘッダー
                HamburgerHeaderView(title: "通知", onMenuTap: openDrawer) {
                    if viewModel.unreadCount > 0 {
                        Button("すべて既読") {
                            showingMarkAllAlert = true
                        }
                        .font(.system(size: 14))
                        .foregroundColor(.twitterBlue)
                    }
                }

                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.notifications.isEmpty {
                    // Empty State
                    ScrollView {
                        VStack(spacing: Spacing.lg) {
                            Image(systemName: "bell.slash")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            Text("通知はありません")
                                .font(.headlineMedium)
                                .foregroundColor(.secondary)
                            Text("新しい通知があるとここに表示されます")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding()
                    }
                } else {
                    // Notifications List
                    List {
                        ForEach(viewModel.notifications) { notification in
                            NotificationRow(
                                notification: notification,
                                onTap: {
                                    // Navigate to related content
                                    navigateToDetails(for: notification)

                                    // Delete notification after viewing
                                    Task {
                                        await viewModel.deleteNotification(notificationId: notification.id)
                                    }
                                }
                            )
                            .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                            .listRowSeparator(.visible)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    Task {
                                        await viewModel.deleteNotification(notificationId: notification.id)
                                    }
                                } label: {
                                    Label("削除", systemImage: "trash")
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await viewModel.refresh()
                    }
                }
            }
            .navigationBarHidden(true)
            .task {
                await viewModel.fetchNotifications()
            }
            .alert("すべて既読にする", isPresented: $showingMarkAllAlert) {
                Button("キャンセル", role: .cancel) {}
                Button("既読にする") {
                    Task {
                        await viewModel.markAllAsRead()
                    }
                }
            } message: {
                Text("すべての通知を既読にしますか？")
            }
            .sheet(isPresented: $showingEventDetail) {
                if let eventId = selectedEventId {
                    EventDetailContainerView(eventId: eventId)
                        .environmentObject(authViewModel)
                }
            }
            .sheet(isPresented: $showingTeamDetail) {
                if let teamId = selectedTeamId {
                    NavigationView {
                        TeamDetailView(teamId: teamId)
                            .environmentObject(authViewModel)
                            .navigationBarTitleDisplayMode(.inline)
                            .toolbar {
                                ToolbarItem(placement: .navigationBarTrailing) {
                                    Button("閉じる") {
                                        showingTeamDetail = false
                                    }
                                }
                            }
                    }
                }
            }
            .sheet(isPresented: $showingTeamEventDetail) {
                if let ids = selectedTeamEventIds {
                    TeamEventDetailContainerView(teamId: ids.teamId, eventId: ids.eventId)
                        .environmentObject(authViewModel)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }

    private func navigateToDetails(for notification: Notification) {
        guard let relatedId = notification.relatedId else { return }

        switch notification.type {
        case .eventJoined, .eventCancelled, .eventChatMessage, .eventUpdated, .eventCancelledByCreator, .eventReminder:
            selectedEventId = relatedId
            showingEventDetail = true

        case .teamEventCreated:
            // Team events use format "teamId:eventId"
            let parts = relatedId.split(separator: ":")
            if parts.count == 2 {
                selectedTeamEventIds = (teamId: String(parts[0]), eventId: String(parts[1]))
                showingTeamEventDetail = true
            }

        case .teamJoinRequest, .teamMemberLeft, .teamJoinApproved, .teamJoinRejected, .teamChatMessage, .teamRoleChanged:
            selectedTeamId = relatedId
            showingTeamDetail = true
        }
    }
}

struct NotificationRow: View {
    let notification: Notification
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Icon
                Image(systemName: notification.icon)
                    .font(.title2)
                    .foregroundColor(iconColor)
                    .frame(width: 40, height: 40)
                    .background(iconColor.opacity(0.1))
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(notification.title)
                            .font(.bodyMedium)
                            .fontWeight(notification.isRead ? .regular : .semibold)
                            .foregroundColor(.primary)

                        Spacer()

                        if !notification.isRead {
                            Circle()
                                .fill(Color.twitterBlue)
                                .frame(width: 8, height: 8)
                        }
                    }

                    Text(notification.message)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)

                    Text(notification.formattedDate)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }
            .padding()
            .background(notification.isRead ? Color.white : Color(.systemGray6))
        }
        .buttonStyle(PlainButtonStyle())
    }

    private var iconColor: Color {
        switch notification.iconColor {
        case "green":
            return .green
        case "red":
            return .red
        case "orange":
            return .orange
        case "blue":
            return .twitterBlue
        case "purple":
            return .purple
        default:
            return .gray
        }
    }
}

#Preview {
    NotificationsView()
        .environmentObject(AuthViewModel())
}
