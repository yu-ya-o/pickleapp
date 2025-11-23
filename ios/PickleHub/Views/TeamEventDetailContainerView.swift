import SwiftUI

/// Container view that fetches a team event by ID and displays TeamEventDetailView
struct TeamEventDetailContainerView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    let teamId: String
    let eventId: String

    var body: some View {
        NavigationView {
            TeamEventDetailView(teamId: teamId, eventId: eventId)
                .environmentObject(authViewModel)
        }
    }
}
