import SwiftUI

/// Container view that fetches a team event by ID and displays TeamEventDetailView
struct TeamEventDetailContainerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel

    let teamId: String
    let eventId: String

    var body: some View {
        NavigationView {
            TeamEventDetailView(teamId: teamId, eventId: eventId)
                .environmentObject(authViewModel)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Done") {
                            dismiss()
                        }
                    }
                }
        }
    }
}
