import SwiftUI

struct TeamEventDetailView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel: TeamEventsViewModel
    @State private var event: TeamEvent?
    @State private var isLoading = true
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var showingChat = false
    @State private var selectedUser: User?
    @State private var showingUserProfile = false
    @State private var showingDeleteAlert = false
    @State private var showingJoinConfirm = false
    @State private var showingLeaveConfirm = false
    @State private var showingCloseEventAlert = false

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

    private var canDelete: Bool {
        if isCreator {
            return true
        }
        // Admin or owner can delete
        if let role = viewModel.team?.userRole {
            return ["owner", "admin"].contains(role)
        }
        return false
    }

    private var isClosed: Bool {
        event?.status == "completed"
    }

    @ViewBuilder
    private var defaultHeaderImage: some View {
        Rectangle()
            .fill(LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.6), Color.purple.opacity(0.6)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ))
            .frame(height: 200)
            .frame(maxWidth: .infinity)
            .overlay(
                VStack {
                    Image(systemName: "figure.pickleball")
                        .font(.system(size: 60))
                        .foregroundColor(.white.opacity(0.9))
                }
            )
    }

    var body: some View {
        ScrollView {
            if let event = event {
                VStack(alignment: .leading, spacing: 20) {
                    // Team Header Image
                    if let headerURL = event.team.headerImageURL {
                        AsyncImage(url: headerURL) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                                    .frame(height: 200)
                                    .frame(maxWidth: .infinity)
                                    .clipped()
                            case .failure(_), .empty:
                                defaultHeaderImage
                            @unknown default:
                                EmptyView()
                            }
                        }
                    } else {
                        defaultHeaderImage
                    }

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
        .alert("Delete Event", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteEvent()
            }
        } message: {
            Text("Are you sure you want to delete this event? This action cannot be undone.")
        }
        .alert("Join Event", isPresented: $showingJoinConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Join") {
                joinEvent()
            }
        } message: {
            Text("このイベントに参加しますか？")
        }
        .alert("Leave Event", isPresented: $showingLeaveConfirm) {
            Button("キャンセルしない", role: .cancel) {}
            Button("参加をキャンセル", role: .destructive) {
                leaveEvent()
            }
        } message: {
            Text("参加をキャンセルしてもよろしいですか？")
        }
        .alert("Close Event", isPresented: $showingCloseEventAlert) {
            Button("Cancel", role: .cancel) {}
            Button("締め切る", role: .destructive) {
                closeEvent()
            }
        } message: {
            Text("イベントを締め切りますか？これ以上新しい参加を受け付けなくなります。")
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
                .padding(.top, 4)
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

            if let region = event.region {
                HStack {
                    Image(systemName: "map")
                    Text(region)
                }
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

            HStack {
                Image(systemName: "yensign.circle")
                if let price = event.price {
                    Text("¥\(price)")
                } else {
                    Text("無料")
                        .foregroundColor(.green)
                }
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
            if let event = event {
                // Closed event banner
                if isClosed {
                    Text("締め切り済み")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange)
                        .cornerRadius(12)
                }

                // Chat button (for participants and creator)
                if event.isUserParticipating == true || isCreator {
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

                // Join/Leave buttons
                if event.isUserParticipating == true {
                    Button(action: {
                        showingLeaveConfirm = true
                    }) {
                        Text("Leave Event")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(12)
                    }
                } else if isClosed {
                    Text("参加受付終了")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray)
                        .cornerRadius(12)
                } else if event.hasCapacity {
                    Button(action: {
                        showingJoinConfirm = true
                    }) {
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

                // Close event button (for creator only, if event is active)
                if !isClosed && canDelete {
                    Button(action: {
                        showingCloseEventAlert = true
                    }) {
                        HStack {
                            Spacer()
                            Image(systemName: "lock.fill")
                            Text("イベントを締め切る")
                                .fontWeight(.semibold)
                            Spacer()
                        }
                        .foregroundColor(.orange)
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(12)
                    }
                }

                // Delete button (for creator and admin+)
                if canDelete {
                    Button(action: {
                        showingDeleteAlert = true
                    }) {
                        HStack {
                            Spacer()
                            Text("Delete Event")
                                .foregroundColor(.red)
                                .fontWeight(.semibold)
                            Spacer()
                        }
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(12)
                    }
                }
            }
        }
    }

    private func closeEvent() {
        Task {
            guard let event = event else { return }
            do {
                try await viewModel.updateEvent(eventId: event.id, status: "completed")
                await loadEvent() // Refresh
                alertMessage = "イベントを締め切りました"
                showingAlert = true
            } catch {
                alertMessage = "Failed to close event: \(error.localizedDescription)"
                showingAlert = true
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

    private func deleteEvent() {
        Task {
            do {
                try await viewModel.deleteEvent(eventId: eventId)
                dismiss()
            } catch {
                alertMessage = "Failed to delete event: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }
}
