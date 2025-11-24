import SwiftUI

struct TeamsListView: View {
    @StateObject private var viewModel = TeamsViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingCreateTeam = false
    @State private var selectedRegion = ""
    @State private var searchText = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("チーム")
                    .font(.system(size: 20, weight: .bold, design: .default))
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                // 検索バー
                HStack(spacing: Spacing.sm) {
                    // 都道府県フィルター（左）
                    HStack {
                        Image(systemName: "mappin.circle")
                            .foregroundColor(.gray)
                            .font(.system(size: 14))
                        Picker("地域", selection: $selectedRegion) {
                            Text("全て").tag("")
                            ForEach(Prefectures.all, id: \.self) { prefecture in
                                Text(prefecture).tag(prefecture)
                            }
                        }
                        .pickerStyle(.menu)
                        .font(.bodyMedium)
                    }
                    .frame(height: 36)
                    .padding(.horizontal, Spacing.sm)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)

                    // フリーテキスト検索（右）
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                            .font(.system(size: 14))
                        TextField("チームを検索", text: $searchText)
                            .font(.bodyMedium)
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                                    .font(.system(size: 14))
                            }
                        }
                    }
                    .frame(height: 36)
                    .padding(.horizontal, Spacing.sm)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)
                }
                .padding(.horizontal, Spacing.md)
                .padding(.bottom, Spacing.sm)
                .background(Color.white)

                Divider()

                ZStack {
                    if viewModel.isLoading && viewModel.myTeams.isEmpty && viewModel.publicTeams.isEmpty {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        List {
                            // My Teams Section
                            if !viewModel.myTeams.isEmpty {
                                Section(header: Text("マイチーム")) {
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
                            Section(header: Text("チームを探す")) {
                                if viewModel.publicTeams.isEmpty && !viewModel.searchText.isEmpty {
                                    Text("チームが見つかりません")
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
                        .onChange(of: searchText) { _, newValue in
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
            .overlay(alignment: .bottomTrailing) {
                Button(action: {
                    showingCreateTeam = true
                }) {
                    Image(systemName: "plus")
                        .font(.title2)
                        .foregroundColor(.white)
                        .frame(width: 56, height: 56)
                        .background(Color.twitterBlue)
                        .clipShape(Circle())
                        .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                }
                .padding(.trailing, 16)
                .padding(.bottom, 16)
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
                        Text("\(team.memberCount)人")
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
