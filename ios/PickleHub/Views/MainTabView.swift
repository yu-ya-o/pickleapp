import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()
    @StateObject private var notificationsViewModel = NotificationsViewModel()

    // Deep Link handling (Custom URL Scheme)
    @State private var showingEventDetail = false
    @State private var selectedEventId: String?
    @State private var showingTeamEventDetail = false
    @State private var selectedTeamId: String?
    @State private var selectedTeamEventId: String?

    var body: some View {
        TabView {
            EventsListView()
                .environmentObject(eventsViewModel)
                .environmentObject(authViewModel)
                .tabItem {
                    Label("イベント", systemImage: "calendar")
                }

            TeamsListView()
                .tabItem {
                    Label("チーム", systemImage: "person.3.fill")
                }

            RankingsView()
                .tabItem {
                    Label("ランキング", systemImage: "trophy.fill")
                }

            NotificationsView()
                .environmentObject(authViewModel)
                .environmentObject(notificationsViewModel)
                .tabItem {
                    Label("通知", systemImage: "bell.fill")
                }
                .badge(notificationsViewModel.unreadCount > 0 ? notificationsViewModel.unreadCount : 0)

            ProfileView()
                .environmentObject(eventsViewModel)
                .tabItem {
                    Label("プロフィール", systemImage: "person.circle")
                }
        }
        .task {
            // Fetch notifications on tab view load
            await notificationsViewModel.fetchNotifications()
        }
        .onReceive(NotificationCenter.default.publisher(for: .deepLinkReceived)) { notification in
            guard let userInfo = notification.userInfo,
                  let type = userInfo["type"] as? String else { return }

            if type == "event", let eventId = userInfo["eventId"] as? String {
                print("📱 Opening event from deep link: \(eventId)")
                selectedEventId = eventId
                showingEventDetail = true
            } else if type == "teamEvent",
                      let teamId = userInfo["teamId"] as? String,
                      let eventId = userInfo["eventId"] as? String {
                print("📱 Opening team event from deep link: teamId=\(teamId), eventId=\(eventId)")
                selectedTeamId = teamId
                selectedTeamEventId = eventId
                showingTeamEventDetail = true
            }
        }
        .sheet(isPresented: $showingEventDetail) {
            if let eventId = selectedEventId {
                EventDetailContainerView(eventId: eventId)
                    .environmentObject(authViewModel)
                    .environmentObject(eventsViewModel)
            }
        }
        .sheet(isPresented: $showingTeamEventDetail) {
            if let teamId = selectedTeamId, let eventId = selectedTeamEventId {
                TeamEventDetailContainerView(teamId: teamId, eventId: eventId)
                    .environmentObject(authViewModel)
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
