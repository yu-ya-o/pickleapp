import SwiftUI

/// Container view that fetches a team event by ID and displays TeamEventDetailView
struct TeamEventDetailContainerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel: TeamEventsViewModel

    let teamId: String
    let eventId: String

    init(teamId: String, eventId: String) {
        self.teamId = teamId
        self.eventId = eventId
        _viewModel = StateObject(wrappedValue: TeamEventsViewModel(teamId: teamId))
    }

    var body: some View {
        NavigationView {
            TeamEventDetailView(teamId: teamId, eventId: eventId)
                .environmentObject(authViewModel)
                .environmentObject(viewModel)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("閉じる") {
                            dismiss()
                        }
                    }
                }
        }
    }
}
