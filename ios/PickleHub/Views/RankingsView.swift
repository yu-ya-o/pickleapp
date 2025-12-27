import SwiftUI

struct RankingsView: View {
    @StateObject private var viewModel = RankingsViewModel()

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Ranking Type Picker
                Picker("ランキング種別", selection: $viewModel.selectedType) {
                    ForEach(RankingsViewModel.RankingType.allCases, id: \.self) { type in
                        Text(type.displayName).tag(type)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(Color.white)
                .onChange(of: viewModel.selectedType) { oldValue, newValue in
                    // 値が実際に変わった時のみリクエストを送信
                    if oldValue != newValue {
                        viewModel.changeRankingType(newValue)
                    }
                }

                Divider()

                // Rankings List
                ZStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if let errorMessage = viewModel.errorMessage {
                        VStack(spacing: Spacing.lg) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 60))
                                .foregroundColor(.red)
                            Text("エラーが発生しました")
                                .font(.headlineMedium)
                                .foregroundColor(.secondary)
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, Spacing.lg)
                            Button("再試行") {
                                Task {
                                    await viewModel.fetchRankings()
                                }
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if viewModel.rankings.isEmpty {
                        VStack(spacing: Spacing.lg) {
                            Image(systemName: "trophy")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            Text("ランキングデータがありません")
                                .font(.headlineMedium)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        List {
                            ForEach(viewModel.rankings) { ranking in
                                ZStack {
                                    NavigationLink(destination: TeamDetailView(teamId: ranking.id)) {
                                        EmptyView()
                                    }
                                    .opacity(0)

                                    RankingRowView(ranking: ranking, type: viewModel.selectedType)
                                }
                                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                .listRowSeparator(.visible)
                                .listRowBackground(
                                    ranking.isTopThree ?
                                    LinearGradient(
                                        colors: [ranking.rankColor.start.opacity(0.3), ranking.rankColor.end.opacity(0.1)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    ) : nil
                                )
                            }
                        }
                        .listStyle(.plain)
                        .refreshable {
                            await viewModel.refresh()
                        }
                    }
                }
            }
            .navigationTitle("ランキング")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                Task {
                    await viewModel.initialLoad()
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct RankingRowView: View {
    let ranking: TeamRanking
    let type: RankingsViewModel.RankingType

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Rank Display
            if ranking.isTopThree {
                Text(ranking.rankEmoji)
                    .font(.system(size: 40))
                    .frame(width: 60)
            } else {
                Text("\(ranking.rank)")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.secondary)
                    .frame(width: 60)
            }

            // Team Icon
            if ranking.iconImageURL != nil {
                TeamIconView(url: ranking.iconImageURL, size: 50)
            } else {
                Circle()
                    .fill(Color(.systemGray5))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "person.2.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 25, height: 25)
                            .foregroundColor(Color(.systemGray3))
                    )
            }

            // Team Info
            VStack(alignment: .leading, spacing: 4) {
                Text(ranking.name)
                    .font(ranking.isTopThree ? .system(size: 18, weight: .bold) : .headline)

                Text(ranking.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                HStack(spacing: 4) {
                    Image(systemName: type == .members ? "person.2.fill" : "calendar.badge.clock")
                        .font(.caption)
                        .foregroundColor(.twitterBlue)
                    Text(type == .members ? "\(ranking.memberCount)人" : "\(ranking.publicEventCount)回")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            // Top 3 Trophy Icon
            if ranking.isTopThree {
                Image(systemName: "trophy.fill")
                    .font(.system(size: 24))
                    .foregroundColor(ranking.rankColor.start)
            }
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, ranking.isTopThree ? Spacing.md : Spacing.sm)
        .background(Color.white)
    }
}

#Preview {
    RankingsView()
}
