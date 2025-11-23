import SwiftUI

struct TeamsListView: View {
    @StateObject private var viewModel = TeamsViewModel()
    @State private var showingCreateTeam = false
    @State private var selectedRegion = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("PickleHub")
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                // Region Filter
                HStack {
                    Image(systemName: "mappin.circle")
                        .foregroundColor(.gray)
                        .font(.system(size: 14))
                    Picker("地域", selection: $selectedRegion) {
                        ForEach(Prefectures.all, id: \.self) { prefecture in
                            Text(prefecture).tag(prefecture)
                        }
                    }
                    .pickerStyle(.menu)
                    .font(.bodyMedium)
                    Spacer()
                }
                .padding(.horizontal, Spacing.sm)
                .padding(.vertical, Spacing.xs)
                .background(Color(.systemGray6))
                .cornerRadius(CornerRadius.medium)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(Color.white)

                Divider()

                ZStack {
                    if viewModel.isLoading && viewModel.myTeams.isEmpty && viewModel.publicTeams.isEmpty {
                        ProgressView()
                    } else {
                        List {
                            // My Teams Section
                            if !viewModel.myTeams.isEmpty {
                                Section(header: Text("My Teams")) {
                                    ForEach(viewModel.myTeams) { team in
                                        ZStack {
                                            NavigationLink(destination: TeamDetailView(teamId: team.id)) {
                                                EmptyView()
                                            }
                                            .opacity(0)

                                            TeamRowView(team: team)
                                        }
                                        .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                        .listRowSeparator(.visible)
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
                                        ZStack {
                                            NavigationLink(destination: TeamDetailView(teamId: team.id)) {
                                                EmptyView()
                                            }
                                            .opacity(0)

                                            TeamRowView(team: team)
                                        }
                                        .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                        .listRowSeparator(.visible)
                                    }
                                }
                            }
                        }
                        .listStyle(.plain)
                        .searchable(text: $viewModel.searchText, prompt: "Search teams")
                        .onChange(of: viewModel.searchText) { _, newValue in
                            viewModel.searchTeams(query: newValue)
                        }
                        .onChange(of: selectedRegion) { _, newValue in
                            Task {
                                await viewModel.fetchPublicTeams(region: newValue)
                            }
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
            }
            .navigationBarHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingCreateTeam = true
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(.twitterBlue)
                            .font(.title2)
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
                if selectedRegion.isEmpty {
                    selectedRegion = Prefectures.all.first ?? ""
                }
                await viewModel.fetchMyTeams()
                await viewModel.fetchPublicTeams()
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct TeamRowView: View {
    let team: Team

    var body: some View {
        HStack(spacing: 12) {
            // Team Icon
            if let iconURL = team.iconImageURL {
                AsyncImage(url: iconURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 50, height: 50)
                            .clipShape(Circle())
                    case .failure(_), .empty:
                        ZStack {
                            Circle()
                                .fill(Color.twitterBlue.opacity(0.2))
                                .frame(width: 50, height: 50)
                            Image(systemName: "person.3.fill")
                                .foregroundColor(.twitterBlue)
                        }
                    @unknown default:
                        EmptyView()
                    }
                }
            } else {
                ZStack {
                    Circle()
                        .fill(Color.twitterBlue.opacity(0.2))
                        .frame(width: 50, height: 50)

                    if team.isPrivate {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.twitterBlue)
                    } else {
                        Image(systemName: "person.3.fill")
                            .foregroundColor(.twitterBlue)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
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
                    HStack(spacing: 4) {
                        Image(systemName: "person.2.fill")
                            .font(.caption)
                            .foregroundColor(.twitterBlue)
                        Text("\(team.memberCount) members")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
        .background(Color.white)
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
