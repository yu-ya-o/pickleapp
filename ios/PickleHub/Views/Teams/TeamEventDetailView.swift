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
    @State private var showingTeamDetail = false

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
        .navigationTitle("イベント")
        .navigationBarTitleDisplayMode(.inline)
        .alert("通知", isPresented: $showingAlert) {
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
        .sheet(isPresented: $showingTeamDetail) {
            TeamDetailView(teamId: teamId)
        }
        .alert("イベント削除", isPresented: $showingDeleteAlert) {
            Button("キャンセル", role: .cancel) {}
            Button("削除", role: .destructive) {
                deleteEvent()
            }
        } message: {
            Text("このイベントを削除してもよろしいですか？この操作は取り消せません。")
        }
        .alert("イベント参加", isPresented: $showingJoinConfirm) {
            Button("キャンセル", role: .cancel) {}
            Button("参加する") {
                joinEvent()
            }
        } message: {
            Text("このイベントに参加しますか？")
        }
        .alert("参加キャンセル", isPresented: $showingLeaveConfirm) {
            Button("キャンセルしない", role: .cancel) {}
            Button("参加をキャンセル", role: .destructive) {
                leaveEvent()
            }
        } message: {
            Text("参加をキャンセルしてもよろしいですか？")
        }
        .alert("イベント締め切り", isPresented: $showingCloseEventAlert) {
            Button("キャンセル", role: .cancel) {}
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
                VStack(alignment: .leading, spacing: 4) {
                    Text(event.formattedDate)
                    if let endDate = event.endDate {
                        let formatter = DateFormatter()
                        formatter.locale = Locale(identifier: "ja_JP")
                        formatter.timeStyle = .short
                        Text("〜 \(formatter.string(from: endDate))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
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
                if let maxParticipants = event.maxParticipants, let availableSpots = event.availableSpots {
                    Text("\(maxParticipants)人中\(availableSpots)人空き")
                        .foregroundColor(availableSpots > 0 ? .green : .red)
                } else {
                    Text("\(event.participantCount)人参加")
                        .foregroundColor(.green)
                }
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
            Text("主催")
                .font(.headline)
            Button(action: {
                showingTeamDetail = true
            }) {
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
                        .foregroundColor(.primary)
                    Spacer()
                }
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(.horizontal)
    }

    @ViewBuilder
    private func participantsSection(for event: TeamEvent) -> some View {
        if !event.participants.isEmpty {
            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("参加者 (\(event.participantCount))")
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

                // Chat button (available for everyone)
                Button(action: { showingChat = true }) {
                    HStack {
                        Image(systemName: "message.fill")
                        Text("チャットを開く")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }

                // Join/Leave buttons
                if event.isUserParticipating == true {
                    Button(action: {
                        showingLeaveConfirm = true
                    }) {
                        Text("参加をキャンセル")
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
                        Text("参加する")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                } else {
                    Text("満席です")
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
                            Text("イベントを削除")
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
                alertMessage = "イベントの締め切りに失敗しました: \(error.localizedDescription)"
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
                alertMessage = "イベントに参加しました！"
                showingAlert = true
            } catch {
                alertMessage = "イベント参加に失敗しました: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }

    private func leaveEvent() {
        Task {
            do {
                try await viewModel.leaveEvent(eventId: eventId)
                await loadEvent()
                alertMessage = "イベントから退出しました"
                showingAlert = true
            } catch {
                alertMessage = "イベント退出に失敗しました: \(error.localizedDescription)"
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
                alertMessage = "イベントの削除に失敗しました: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }
}
