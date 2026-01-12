import SwiftUI

// Environment key for drawer action
struct DrawerActionKey: EnvironmentKey {
    static let defaultValue: () -> Void = {}
}

extension EnvironmentValues {
    var openDrawer: () -> Void {
        get { self[DrawerActionKey.self] }
        set { self[DrawerActionKey.self] = newValue }
    }
}

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()
    @StateObject private var notificationsViewModel = NotificationsViewModel()

    // Drawer state
    @State private var isDrawerOpen = false
    @State private var selectedTab = 0

    // Deep Link handling (Custom URL Scheme)
    @State private var showingEventDetail = false
    @State private var selectedEventId: String?
    @State private var showingTeamEventDetail = false
    @State private var selectedTeamId: String?
    @State private var selectedTeamEventId: String?

    var body: some View {
        ZStack {
            // Main content
            Group {
                switch selectedTab {
                case 0:
                    EventsListView()
                        .environmentObject(eventsViewModel)
                        .environmentObject(authViewModel)
                case 1:
                    TeamsListView()
                case 2:
                    RankingsView()
                case 3:
                    NotificationsView()
                        .environmentObject(authViewModel)
                        .environmentObject(notificationsViewModel)
                case 4:
                    ProfileView()
                        .environmentObject(eventsViewModel)
                default:
                    EventsListView()
                        .environmentObject(eventsViewModel)
                        .environmentObject(authViewModel)
                }
            }
            .environment(\.openDrawer, openDrawer)

            // Drawer overlay
            DrawerMenuView(
                isOpen: $isDrawerOpen,
                selectedTab: $selectedTab,
                onLogout: {
                    authViewModel.signOut()
                }
            )
            .environmentObject(authViewModel)
        }
        .task {
            // Fetch notifications on tab view load
            await notificationsViewModel.fetchNotifications()
        }
        .onAppear {
            print("MainTabView appeared")
            // Check if there's a pending deep link
            checkPendingDeepLink()
        }
        .onReceive(NotificationCenter.default.publisher(for: .deepLinkReceived)) { output in
            handleDeepLink(output)
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

    private func openDrawer() {
        withAnimation(.easeOut(duration: 0.3)) {
            isDrawerOpen = true
        }
    }

    private func checkPendingDeepLink() {
        print("Checking for pending deep link...")

        // Check UserDefaults for pending deep link
        if let eventId = UserDefaults.standard.string(forKey: "pendingEventId") {
            print("Found pending event deep link: \(eventId)")
            UserDefaults.standard.removeObject(forKey: "pendingEventId")

            // Open event with a slight delay to ensure view is fully loaded
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                print("Opening event detail for: \(eventId)")
                self.selectedEventId = eventId
                self.showingEventDetail = true
                print("showingEventDetail = \(self.showingEventDetail), selectedEventId = \(String(describing: self.selectedEventId))")
            }
        } else if let teamId = UserDefaults.standard.string(forKey: "pendingTeamId"),
                  let eventId = UserDefaults.standard.string(forKey: "pendingTeamEventId") {
            print("Found pending team event deep link: teamId=\(teamId), eventId=\(eventId)")
            UserDefaults.standard.removeObject(forKey: "pendingTeamId")
            UserDefaults.standard.removeObject(forKey: "pendingTeamEventId")

            // Open team event with a slight delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                print("Opening team event detail for: teamId=\(teamId), eventId=\(eventId)")
                self.selectedTeamId = teamId
                self.selectedTeamEventId = eventId
                self.showingTeamEventDetail = true
                print("showingTeamEventDetail = \(self.showingTeamEventDetail)")
            }
        } else {
            print("No pending deep link found")
        }
    }

    private func handleDeepLink(_ output: NotificationCenter.Publisher.Output) {
        print("Received deep link notification")
        guard let userInfo = output.userInfo,
              let type = userInfo["type"] as? String else {
            print("No userInfo or type in notification")
            return
        }

        print("Notification type: \(type)")

        if type == "event", let eventId = userInfo["eventId"] as? String {
            print("Opening event from deep link notification: \(eventId)")
            selectedEventId = eventId
            showingEventDetail = true
            print("showingEventDetail = \(showingEventDetail), selectedEventId = \(String(describing: selectedEventId))")
        } else if type == "teamEvent",
                  let teamId = userInfo["teamId"] as? String,
                  let eventId = userInfo["eventId"] as? String {
            print("Opening team event from deep link notification: teamId=\(teamId), eventId=\(eventId)")
            selectedTeamId = teamId
            selectedTeamEventId = eventId
            showingTeamEventDetail = true
            print("showingTeamEventDetail = \(showingTeamEventDetail)")
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
