import SwiftUI

struct TeamsListView: View {
    @StateObject private var viewModel = TeamsViewModel()
    @State private var showingCreateTeam = false

    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading && viewModel.myTeams.isEmpty && viewModel.publicTeams.isEmpty {
                    ProgressView()
                } else {
                    List {
                        // My Teams Section
                        if !viewModel.myTeams.isEmpty {
                            Section(header: Text("My Teams")) {
                                ForEach(viewModel.myTeams) { team in
                                    NavigationLink(destination: TeamDetailView(teamId: team.id)) {
                                        TeamRowView(team: team)
                                    }
                                }
                            }
                        }

                        // Public Teams Section
                        Section(header: Text("Discover Teams")) {
                            if viewModel.publicTeams.isEmpty && !viewModel.searchText.isEmpty {
                                Text("No teams found")
                                    .foregroundColor(.secondary)
                                    .font(.subheadline)
                            } else {
                                ForEach(viewModel.publicTeams) { team in
                                    NavigationLink(destination: TeamDetailView(teamId: team.id)) {
                                        TeamRowView(team: team)
                                    }
                                }
                            }
                        }
                    }
                    .searchable(text: $viewModel.searchText, prompt: "Search teams")
                    .onChange(of: viewModel.searchText) { _, newValue in
                        viewModel.searchTeams(query: newValue)
                    }
                }

                if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Spacer()
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .padding()
                            .background(Color(.systemBackground))
                            .cornerRadius(8)
                        Spacer()
                    }
                }
            }
            .navigationTitle("Teams")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingCreateTeam = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .sheet(isPresented: $showingCreateTeam) {
                CreateTeamView()
                    .environmentObject(viewModel)
            }
            .task {
                await viewModel.fetchMyTeams()
                await viewModel.fetchPublicTeams()
            }
        }
    }
}

struct TeamRowView: View {
    let team: Team

    var body: some View {
        HStack(spacing: 12) {
            // Team Icon
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.2))
                    .frame(width: 50, height: 50)

                if team.isPrivate {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.blue)
                } else {
                    Image(systemName: "person.3.fill")
                        .foregroundColor(.blue)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(team.name)
                        .font(.headline)

                    if team.isPrivate {
                        Image(systemName: "lock.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    if let role = team.userRole {
                        RoleBadge(role: role)
                    }
                }

                Text(team.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)

                HStack(spacing: 12) {
                    Label("\(team.memberCount) members", systemImage: "person.2")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if team.isUserMember == true {
                        Text("Member")
                            .font(.caption)
                            .foregroundColor(.green)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(4)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct RoleBadge: View {
    let role: String

    var body: some View {
        Group {
            if role == "owner" {
                Image(systemName: "crown.fill")
                    .foregroundColor(.yellow)
            } else if role == "admin" {
                Image(systemName: "shield.fill")
                    .foregroundColor(.orange)
            }
        }
        .font(.caption)
    }
}

#Preview {
    TeamsListView()
}
