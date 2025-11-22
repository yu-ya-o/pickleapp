import SwiftUI

struct TeamDetailView: View {
    @StateObject private var viewModel: TeamDetailViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingEditTeam = false
    @State private var showingMembers = false
    @State private var showingJoinRequests = false
    @State private var showingInvites = false
    @State private var showingEvents = false
    @State private var showingChat = false
    @State private var showingLeaveAlert = false
    @State private var showingDeleteAlert = false
    @State private var showingJoinSuccessAlert = false
    @State private var showingJoinErrorAlert = false
    @State private var joinErrorMessage = ""

    init(teamId: String) {
        _viewModel = StateObject(wrappedValue: TeamDetailViewModel(teamId: teamId))
    }

    var body: some View {
        ScrollView {
            if let team = viewModel.team {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
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
                            Label("\(team.memberCount) members", systemImage: "person.2")
                            Text("•")
                            Text(team.visibility.capitalized)
                            Text("•")
                            Text("Created \(team.formattedCreatedDate)")
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }
                    .padding()

                    Divider()

                    // Owner Info
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Owner")
                            .font(.headline)
                            .padding(.horizontal)

                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.title2)
                                .foregroundColor(.yellow)
                            Text(team.owner.name)
                            Spacer()
                        }
                        .padding(.horizontal)
                    }

                    Divider()

                    // Actions
                    VStack(spacing: 12) {
                        // Members
                        Button(action: { showingMembers = true }) {
                            HStack {
                                Image(systemName: "person.2")
                                Text("View Members")
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
                                    print("🔘 Request to Join button pressed")
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
                                }) {
                                    HStack {
                                        Spacer()
                                        Image(systemName: "person.badge.plus")
                                        Text("Request to Join")
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
                                    Text("Team Events")
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
                                    Text("Team Chat")
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
                                    Text("Join Requests")
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
                                        Text("Invite Links")
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
                                    Text("Edit Team")
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
                                    Text("Leave Team")
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
                                    Text("Delete Team")
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
        .navigationTitle("Team")
        .navigationBarTitleDisplayMode(.inline)
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
            TeamChatView(teamId: viewModel.teamId, teamName: viewModel.team?.name ?? "Team")
        }
        .alert("Leave Team", isPresented: $showingLeaveAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Leave", role: .destructive) {
                leaveTeam()
            }
        } message: {
            Text("Are you sure you want to leave this team?")
        }
        .alert("Delete Team", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteTeam()
            }
        } message: {
            Text("This action cannot be undone. All team data will be permanently deleted.")
        }
        .alert("Request Sent", isPresented: $showingJoinSuccessAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your request to join this team has been sent to the team administrators.")
        }
        .alert("Request Failed", isPresented: $showingJoinErrorAlert) {
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
                // Navigate back
            } catch {
                // Show error
            }
        }
    }

    private func deleteTeam() {
        Task {
            do {
                try await APIClient.shared.deleteTeam(id: viewModel.teamId)
                // Navigate back
            } catch {
                // Show error
            }
        }
    }
}
