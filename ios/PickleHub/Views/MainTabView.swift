import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()

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

            NotificationsView()
                .environmentObject(authViewModel)
                .tabItem {
                    Label("通知", systemImage: "bell.fill")
                }

            ProfileView()
                .tabItem {
                    Label("プロフィール", systemImage: "person.circle")
                }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
