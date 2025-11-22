import SwiftUI

struct TeamEventDetailView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel: TeamEventsViewModel
    @State private var event: TeamEvent?
    @State private var isLoading = true
    @State private var showingAlert = false
    @State private var alertMessage = ""

    let teamId: String
    let eventId: String

    init(teamId: String, eventId: String) {
        self.teamId = teamId
        self.eventId = eventId
        _viewModel = StateObject(wrappedValue: TeamEventsViewModel(teamId: teamId))
    }

    private var isCreator: Bool {
        event?.creator.id == authViewModel.currentUser?.id
    }

    var body: some View {
        ScrollView {
            if let event = event {
                VStack(alignment: .leading, spacing: 20) {
                    headerSection(for: event)
                    Divider()
                    detailsSection(for: event)
                    Divider()
                    creatorSection(for: event)
                    participantsSection(for: event)
                    Divider()
                    actionButtons
                        .padding(.horizontal)
                    Spacer()
                }
            } else if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("Event")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Notification", isPresented: $showingAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alertMessage)
        }
        .task {
            await loadEvent()
        }
    }

    @ViewBuilder
    private func headerSection(for event: TeamEvent) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(event.title)
                .font(.title)
                .fontWeight(.bold)

            Text(event.description)
                .font(.body)
                .foregroundColor(.secondary)
        }
        .padding()
    }

    @ViewBuilder
    private func detailsSection(for event: TeamEvent) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "calendar")
                Text(event.formattedDate)
            }

            HStack {
                Image(systemName: "mappin.circle")
                Text(event.location)
            }

            HStack {
                Image(systemName: "person.2")
                Text(event.capacityText)
                    .foregroundColor(event.hasCapacity ? .green : .red)
            }
        }
        .font(.body)
        .padding(.horizontal)
    }

    @ViewBuilder
    private func creatorSection(for event: TeamEvent) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Organized by")
                .font(.headline)
            HStack {
                Image(systemName: "person.circle.fill")
                    .font(.title2)
                Text(event.creator.displayName)
            }
        }
        .padding(.horizontal)
    }

    @ViewBuilder
    private func participantsSection(for event: TeamEvent) -> some View {
        if !event.participants.isEmpty {
            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("Participants (\(event.participantCount))")
                    .font(.headline)
                    .padding(.horizontal)

                ForEach(event.participants) { participant in
                    HStack {
                        Image(systemName: "person.circle")
                        Text(participant.user.displayName)
                        Spacer()
                        if participant.user.id == authViewModel.currentUser?.id {
                            Text("You")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 4)
                }
            }
        }
    }

    @ViewBuilder
    private var actionButtons: some View {
        VStack(spacing: 12) {
            if let event = event, !isCreator {
                if event.isUserParticipating == true {
                    Button(action: leaveEvent) {
                        Text("Leave Event")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(12)
                    }
                } else if event.hasCapacity {
                    Button(action: joinEvent) {
                        Text("Join Event")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                } else {
                    Text("Event is full")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray)
                        .cornerRadius(12)
                }
            }
        }
    }

    private func loadEvent() async {
        isLoading = true

        do {
            event = try await APIClient.shared.getTeamEvent(teamId: teamId, eventId: eventId)
            isLoading = false
        } catch {
            isLoading = false
            alertMessage = error.localizedDescription
            showingAlert = true
        }
    }

    private func joinEvent() {
        Task {
            do {
                try await viewModel.joinEvent(eventId: eventId)
                await loadEvent()
                alertMessage = "Successfully joined event!"
                showingAlert = true
            } catch {
                alertMessage = "Failed to join event: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }

    private func leaveEvent() {
        Task {
            do {
                try await viewModel.leaveEvent(eventId: eventId)
                await loadEvent()
                alertMessage = "Left event successfully"
                showingAlert = true
            } catch {
                alertMessage = "Failed to leave event: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }
}
