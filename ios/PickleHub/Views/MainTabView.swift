import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()

    var body: some View {
        TabView {
            EventsListView()
                .environmentObject(eventsViewModel)
                .tabItem {
                    Label("イベント", systemImage: "calendar")
                }

            TeamsListView()
                .tabItem {
                    Label("チーム", systemImage: "person.3.fill")
                }

            MyEventsView()
                .environmentObject(eventsViewModel)
                .tabItem {
                    Label("マイイベント", systemImage: "star.fill")
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
