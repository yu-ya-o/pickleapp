import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()

    var body: some View {
        TabView {
            EventsListView()
                .environmentObject(eventsViewModel)
                .tabItem {
                    Label("Events", systemImage: "calendar")
                }

            TeamsListView()
                .tabItem {
                    Label("Teams", systemImage: "person.3.fill")
                }

            MyEventsView()
                .environmentObject(eventsViewModel)
                .tabItem {
                    Label("My Events", systemImage: "star.fill")
                }

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle")
                }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
