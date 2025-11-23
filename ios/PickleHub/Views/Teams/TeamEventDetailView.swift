import SwiftUI

struct TeamEventDetailView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel: TeamEventsViewModel
    @State private var event: TeamEvent?
    @State private var isLoading = true
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var showingChat = false
    @State private var selectedUser: User?
    @State private var showingUserProfile = false

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
        .sheet(isPresented: $showingChat) {
            if let event = event {
                ChatView(eventId: event.id, eventTitle: event.title)
            }
        }
        .sheet(isPresented: $showingUserProfile) {
            if let user = selectedUser {
                UserProfileView(user: user)
            }
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
            HStack(spacing: 12) {
                // Team icon
                if let iconImageURL = event.team.iconImageURL {
                    AsyncImage(url: iconImageURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(width: 40, height: 40)
                                .clipShape(Circle())
                        case .failure(_), .empty:
                            Image(systemName: "person.3.fill")
                                .resizable()
                                .frame(width: 40, height: 40)
                                .foregroundColor(.twitterBlue)
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    Image(systemName: "person.3.fill")
                        .resizable()
                        .frame(width: 40, height: 40)
                        .foregroundColor(.twitterBlue)
                }
                Text(event.team.name)
                    .font(.body)
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
                    HStack(spacing: 12) {
                        // Participant profile image (tappable)
                        Button(action: {
                            selectedUser = participant.user.toUser()
                            showingUserProfile = true
                        }) {
                            if let profileImageURL = participant.user.profileImageURL {
                                AsyncImage(url: profileImageURL) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 32, height: 32)
                                            .clipShape(Circle())
                                    case .failure(_), .empty:
                                        Image(systemName: "person.circle")
                                            .resizable()
                                            .frame(width: 32, height: 32)
                                            .foregroundColor(.gray)
                                    @unknown default:
                                        EmptyView()
                                    }
                                }
                            } else {
                                Image(systemName: "person.circle")
                                    .resizable()
                                    .frame(width: 32, height: 32)
                                    .foregroundColor(.gray)
                            }
                        }
                        .buttonStyle(.plain)
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
            // Chat button (for participants and creator)
            if let event = event, (event.isUserParticipating == true || isCreator) {
                Button(action: { showingChat = true }) {
                    HStack {
                        Image(systemName: "message.fill")
                        Text("Open Chat")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
            }

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
