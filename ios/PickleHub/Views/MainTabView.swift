import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()
    @StateObject private var notificationsViewModel = NotificationsViewModel()

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
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
