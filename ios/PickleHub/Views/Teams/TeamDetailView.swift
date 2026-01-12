import SwiftUI

struct TeamDetailView: View {
    @StateObject private var viewModel: TeamDetailViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @State private var showingEditTeam = false
    @State private var showingMembers = false
    @State private var showingJoinRequests = false
    @State private var showingInvites = false
    @State private var showingEvents = false
    @State private var showingChat = false
    @State private var showingLeaveAlert = false
    @State private var showingDeleteAlert = false
    @State private var showingJoinConfirmAlert = false
    @State private var showingJoinSuccessAlert = false
    @State private var showingJoinErrorAlert = false
    @State private var joinErrorMessage = ""

    let isSheet: Bool

    init(teamId: String, isSheet: Bool = false) {
        _viewModel = StateObject(wrappedValue: TeamDetailViewModel(teamId: teamId))
        self.isSheet = isSheet
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
                    Image(systemName: "person.3.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.white.opacity(0.9))
                }
            )
    }

    var body: some View {
        ScrollView {
            if let team = viewModel.team {
                VStack(alignment: .leading, spacing: 20) {
                    // Header Image
                    if let headerURL = team.headerImageURL {
                        CachedAsyncImagePhase(url: headerURL) { phase in
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

                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(alignment: .top, spacing: 16) {
                            // Team Icon
                            if let iconURL = team.iconImageURL {
                                CachedAsyncImagePhase(url: iconURL) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 80, height: 80)
                                            .clipShape(Circle())
                                    case .failure(_), .empty:
                                        Image(systemName: "person.3.fill")
                                            .resizable()
                                            .scaledToFit()
                                            .frame(width: 40, height: 40)
                                            .foregroundColor(.gray)
                                            .frame(width: 80, height: 80)
                                            .background(Color(.systemGray6))
                                            .clipShape(Circle())
                                    @unknown default:
                                        EmptyView()
                                    }
                                }
                            } else {
                                Image(systemName: "person.3.fill")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 40, height: 40)
                                    .foregroundColor(.gray)
                                    .frame(width: 80, height: 80)
                                    .background(Color(.systemGray6))
                                    .clipShape(Circle())
                            }

                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(team.name)
                                        .font(.title)
                                        .fontWeight(.bold)

                                    if team.isPrivate {
                                        Image(systemName: "lock.fill")
                                            .foregroundColor(.secondary)
                                    }

                                    Spacer()

                                    if let role = team.userRole {
                                        RoleBadge(role: role)
                                            .font(.title3)
                                    }
                                }

                                Text(team.description)
                                    .font(.body)
                                    .foregroundColor(.secondary)

                                HStack {
                                    Label("\(team.memberCount)人", systemImage: "person.2")
                                    Text("•")
                                    Text(team.isPrivate ? "非公開" : "公開")
                                }
                                .font(.caption)
                                .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding()

                    Divider()

                    // SNS Section
                    let hasSNS = (team.instagramUrl != nil && !team.instagramUrl!.isEmpty) ||
                                 (team.twitterUrl != nil && !team.twitterUrl!.isEmpty) ||
                                 (team.tiktokUrl != nil && !team.tiktokUrl!.isEmpty) ||
                                 (team.lineUrl != nil && !team.lineUrl!.isEmpty)

                    if hasSNS {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("SNS")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)

                            SNSLinksView(
                                instagramUrl: team.instagramUrl,
                                twitterUrl: team.twitterUrl,
                                tiktokUrl: team.tiktokUrl,
                                lineUrl: team.lineUrl
                            )
                        }
                        .padding(.horizontal)

                        Divider()
                    }

                    // Actions
                    VStack(spacing: 12) {
                        // Members
                        Button(action: { showingMembers = true }) {
                            HStack {
                                Image(systemName: "person.2")
                                Text("メンバーを見る")
                                Spacer()
                                Image(systemName: "chevron.right")
                            }
                            .foregroundColor(.primary)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }

                        // Request to Join (for non-members of public teams)
                        if !viewModel.isMember && !team.isPrivate {
                            if viewModel.hasPendingJoinRequest {
                                // Show pending status
                                HStack {
                                    Spacer()
                                    Image(systemName: "clock.fill")
                                    Text("リクエスト送信済み")
                                    Spacer()
                                }
                                .font(.headline)
                                .foregroundColor(.secondary)
                                .padding()
                                .background(Color(.systemGray5))
                                .cornerRadius(12)
                            } else {
                                // Show request button
                                Button(action: {
                                    showingJoinConfirmAlert = true
                                }) {
                                    HStack {
                                        Spacer()
                                        Image(systemName: "person.badge.plus")
                                        Text("参加リクエスト")
                                        Spacer()
                                    }
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .padding()
                                    .background(Color.twitterBlue)
                                    .cornerRadius(12)
                                }
                            }
                        }

                        // Events
                        if viewModel.isMember {
                            Button(action: { showingEvents = true }) {
                                HStack {
                                    Image(systemName: "calendar")
                                    Text("チームイベント")
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.primary)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                            }

                            // Chat
                            Button(action: { showingChat = true }) {
                                HStack {
                                    Image(systemName: "message")
                                    Text("チームチャット")
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.primary)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                            }
                        }

                        // Join Requests (admin/owner only)
                        if viewModel.canManageTeam {
                            Button(action: {
                                print("📋 Join Requests button pressed")
                                Task {
                                    await viewModel.loadJoinRequests()
                                    print("📋 Opening Join Requests sheet with \(viewModel.joinRequests.count) requests")
                                    showingJoinRequests = true
                                }
                            }) {
                                HStack {
                                    Image(systemName: "person.crop.circle.badge.plus")
                                    Text("参加リクエスト管理")
                                    Spacer()
                                    if viewModel.joinRequests.count > 0 {
                                        Text("\(viewModel.joinRequests.count)")
                                            .font(.caption)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(Color.red)
                                            .foregroundColor(.white)
                                            .cornerRadius(12)
                                    }
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.primary)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                            }

                            // Invites (private teams)
                            if team.isPrivate {
                                Button(action: {
                                    Task {
                                        await viewModel.loadInvites()
                                        showingInvites = true
                                    }
                                }) {
                                    HStack {
                                        Image(systemName: "link")
                                        Text("招待リンク")
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                    }
                                    .foregroundColor(.primary)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(12)
                                }
                            }

                            // Edit Team
                            Button(action: { showingEditTeam = true }) {
                                HStack {
                                    Image(systemName: "pencil")
                                    Text("チームを編集")
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.primary)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                            }
                        }

                        // Leave Team
                        if viewModel.isMember && !viewModel.isOwner {
                            Button(action: { showingLeaveAlert = true }) {
                                HStack {
                                    Spacer()
                                    Text("チームを退出")
                                        .foregroundColor(.red)
                                    Spacer()
                                }
                                .padding()
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(12)
                            }
                        }

                        // Delete Team (owner only)
                        if viewModel.canDeleteTeam {
                            Button(action: { showingDeleteAlert = true }) {
                                HStack {
                                    Spacer()
                                    Text("チームを削除")
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
                    .padding(.horizontal)

                    Spacer()
                }
            } else if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("チーム")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if isSheet {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
        }
        .refreshable {
            await viewModel.refresh()
        }
        .sheet(isPresented: $showingMembers) {
            TeamMembersView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingJoinRequests) {
            JoinRequestsView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingInvites) {
            InviteManagementView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingEvents) {
            TeamEventsListView(teamId: viewModel.teamId)
        }
        .sheet(isPresented: $showingChat) {
            TeamChatView(teamId: viewModel.teamId, teamName: viewModel.team?.name ?? "チーム")
        }
        .sheet(isPresented: $showingEditTeam) {
            EditTeamView(viewModel: viewModel)
        }
        .alert("チーム退出", isPresented: $showingLeaveAlert) {
            Button("キャンセル", role: .cancel) {}
            Button("退出", role: .destructive) {
                leaveTeam()
            }
        } message: {
            Text("このチームを退出してもよろしいですか？")
        }
        .alert("チーム削除", isPresented: $showingDeleteAlert) {
            Button("キャンセル", role: .cancel) {}
            Button("削除", role: .destructive) {
                deleteTeam()
            }
        } message: {
            Text("この操作は取り消せません。すべてのチームデータが完全に削除されます。")
        }
        .alert("チームに参加リクエストを送信", isPresented: $showingJoinConfirmAlert) {
            Button("キャンセル", role: .cancel) {}
            Button("送信") {
                print("🔘 Request to Join confirmed")
                Task {
                    do {
                        try await viewModel.requestToJoin()
                        print("✅ Join request successful, showing success alert")
                        showingJoinSuccessAlert = true
                    } catch {
                        print("❌ Join request failed: \(error)")
                        joinErrorMessage = viewModel.errorMessage ?? error.localizedDescription
                        showingJoinErrorAlert = true
                    }
                }
            }
        } message: {
            Text("このチームに参加リクエストを送信しますか?")
        }
        .alert("リクエスト送信完了", isPresented: $showingJoinSuccessAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("チームの管理者に参加リクエストが送信されました。")
        }
        .alert("リクエスト失敗", isPresented: $showingJoinErrorAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(joinErrorMessage)
        }
        .task {
            await viewModel.loadTeam()
            if viewModel.canManageTeam {
                await viewModel.loadJoinRequests()
            }
        }
    }

    private func leaveTeam() {
        guard let userId = authViewModel.currentUser?.id else { return }

        Task {
            do {
                try await viewModel.leaveTeam(userId: userId)
                print("✅ Left team successfully, navigating back")
                dismiss()
            } catch {
                print("❌ Error leaving team: \(error)")
                viewModel.errorMessage = error.localizedDescription
            }
        }
    }

    private func deleteTeam() {
        Task {
            do {
                try await APIClient.shared.deleteTeam(id: viewModel.teamId)
                print("✅ Deleted team successfully, navigating back")
                dismiss()
            } catch {
                print("❌ Error deleting team: \(error)")
                viewModel.errorMessage = error.localizedDescription
            }
        }
    }
}
