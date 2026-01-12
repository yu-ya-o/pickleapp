import SwiftUI

struct UserProfileView: View {
    let user: User
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: UserProfileViewModel

    init(user: User) {
        self.user = user
        _viewModel = StateObject(wrappedValue: UserProfileViewModel(userId: user.id))
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // ヘッダー
                HStack(spacing: 12) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                            .frame(width: 44, height: 44)
                    }

                    Spacer()

                    Text("プロフィール")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))

                    Spacer()

                    // Spacer for balance
                    Color.clear
                        .frame(width: 44, height: 44)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white)

                ScrollView {
                    VStack(spacing: 20) {
                        // プロフィールカード
                        VStack(spacing: 16) {
                            // プロフィール画像（上にスペース）
                            ZStack {
                                Circle()
                                    .stroke(
                                        LinearGradient(
                                            colors: [
                                                Color(red: 99/255, green: 102/255, blue: 241/255),
                                                Color(red: 168/255, green: 85/255, blue: 247/255)
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 3
                                    )
                                    .frame(width: 106, height: 106)

                                ProfileImageView(url: user.profileImageURL, size: 100)
                            }
                            .padding(.top, 24)

                            // 名前
                            Text(user.displayName)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))

                            // 自己紹介
                            if let bio = user.bio, !bio.isEmpty {
                                Text(bio)
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                            }

                            // DUPR セクション
                            HStack(spacing: 12) {
                                DUPRBox(
                                    label: "DUPR SINGLES",
                                    value: user.duprSingles != nil ? String(format: "%.3f", user.duprSingles!) : "-"
                                )
                                DUPRBox(
                                    label: "DUPR DOUBLES",
                                    value: user.duprDoubles != nil ? String(format: "%.3f", user.duprDoubles!) : "-"
                                )
                            }
                            .padding(.horizontal, 16)

                            Divider()
                                .padding(.horizontal, 16)

                            // プロフィール詳細（2カラム）
                            VStack(spacing: 16) {
                                HStack(spacing: 0) {
                                    ProfileDetailItem(label: "REGION", value: user.region ?? "-")
                                    ProfileDetailItem(label: "EXPERIENCE", value: user.pickleballExperience ?? "-")
                                }
                                HStack(spacing: 0) {
                                    ProfileDetailItem(label: "LEVEL", value: user.skillLevel ?? "-")
                                    ProfileDetailItem(label: "GENDER", value: user.gender ?? "-")
                                }
                                HStack(spacing: 0) {
                                    ProfileDetailItem(label: "AGE", value: user.ageGroup ?? "-")
                                    ProfileDetailItem(label: "PADDLE", value: user.myPaddle ?? "-")
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 16)
                        }
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 2)
                        .padding(.horizontal, 16)
                        .padding(.top, 16)

                        // TEAMSセクション
                        VStack(alignment: .leading, spacing: 12) {
                            Text("TEAMS")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                                .tracking(1)
                                .padding(.horizontal, 16)

                            if viewModel.isLoading {
                                ProgressView()
                                    .padding(.horizontal, 16)
                            } else if viewModel.teams.isEmpty {
                                Text("ありません")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
                                    .padding(.horizontal, 16)
                            } else {
                                VStack(spacing: 8) {
                                    ForEach(viewModel.teams) { team in
                                        TeamRowButton(team: team)
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }

                        // 戦績セクション
                        VStack(alignment: .leading, spacing: 12) {
                            Text("BATTLE RECORD")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                                .tracking(1)
                                .padding(.horizontal, 16)

                            if let battleRecords = user.battleRecords, !battleRecords.isEmpty {
                                VStack(spacing: 0) {
                                    ForEach(battleRecords) { record in
                                        HStack {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(record.tournamentName)
                                                    .font(.system(size: 15, weight: .medium))
                                                    .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                                                Text(record.yearMonth)
                                                    .font(.system(size: 13))
                                                    .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                                            }
                                            Spacer()
                                            Text(record.result)
                                                .font(.system(size: 15, weight: .semibold))
                                                .foregroundColor(record.result == "優勝" ? Color(red: 220/255, green: 38/255, blue: 38/255) : Color(red: 26/255, green: 26/255, blue: 46/255))
                                        }
                                        .padding(.vertical, 14)
                                        .padding(.horizontal, 16)

                                        if record.id != battleRecords.last?.id {
                                            Divider()
                                                .padding(.leading, 16)
                                        }
                                    }
                                }
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(red: 229/255, green: 231/255, blue: 235/255), lineWidth: 1)
                                )
                                .padding(.horizontal, 16)
                            } else {
                                Text("ありません")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
                                    .padding(.horizontal, 16)
                            }
                        }

                        // SNSリンクセクション
                        VStack(alignment: .leading, spacing: 12) {
                            Text("SNS")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                                .tracking(1)
                                .padding(.horizontal, 16)

                            let hasSnsLinks = (user.instagramUrl != nil && !user.instagramUrl!.isEmpty) ||
                                             (user.twitterUrl != nil && !user.twitterUrl!.isEmpty) ||
                                             (user.tiktokUrl != nil && !user.tiktokUrl!.isEmpty) ||
                                             (user.lineUrl != nil && !user.lineUrl!.isEmpty)

                            if hasSnsLinks {
                                VStack(spacing: 8) {
                                    if let instagramUrl = user.instagramUrl, !instagramUrl.isEmpty {
                                        SNSLinkButton(platform: .instagram, url: instagramUrl)
                                    }
                                    if let twitterUrl = user.twitterUrl, !twitterUrl.isEmpty {
                                        SNSLinkButton(platform: .twitter, url: twitterUrl)
                                    }
                                    if let tiktokUrl = user.tiktokUrl, !tiktokUrl.isEmpty {
                                        SNSLinkButton(platform: .tiktok, url: tiktokUrl)
                                    }
                                    if let lineUrl = user.lineUrl, !lineUrl.isEmpty {
                                        SNSLinkButton(platform: .line, url: lineUrl)
                                    }
                                }
                                .padding(.horizontal, 16)
                            } else {
                                Text("ありません")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
                                    .padding(.horizontal, 16)
                            }
                        }
                        .padding(.bottom, 32)
                    }
                }
                .background(Color(red: 249/255, green: 250/255, blue: 251/255))
            }
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            Task {
                await viewModel.loadTeams()
            }
        }
    }
}

// チーム行ボタン
struct TeamRowButton: View {
    let team: Team
    @State private var showingTeamDetail = false

    var body: some View {
        Button(action: { showingTeamDetail = true }) {
            HStack(spacing: 12) {
                if let iconUrl = team.iconImage, let url = URL(string: iconUrl) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Circle()
                            .fill(Color(red: 229/255, green: 231/255, blue: 235/255))
                    }
                    .frame(width: 40, height: 40)
                    .clipShape(Circle())
                } else {
                    Circle()
                        .fill(Color(red: 229/255, green: 231/255, blue: 235/255))
                        .frame(width: 40, height: 40)
                }

                Text(team.name)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color(red: 229/255, green: 231/255, blue: 235/255), lineWidth: 1)
            )
        }
        .sheet(isPresented: $showingTeamDetail) {
            NavigationView {
                TeamDetailView(teamId: team.id)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("閉じる") {
                                showingTeamDetail = false
                            }
                        }
                    }
            }
        }
    }
}

@MainActor
class UserProfileViewModel: ObservableObject {
    @Published var teams: [Team] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let userId: String
    private let apiClient = APIClient.shared

    init(userId: String) {
        self.userId = userId
    }

    func loadTeams() async {
        isLoading = true
        errorMessage = nil

        do {
            teams = try await apiClient.getUserTeams(userId: userId)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Failed to load user teams: \(error)")
        }
    }
}

#Preview {
    UserProfileView(user: User(
        id: "1",
        email: "test@example.com",
        name: "Test User",
        profileImage: nil,
        nickname: "TestNick",
        bio: "ピックルボール歴1年です。楽しく練習できる仲間を募集しています！",
        region: "東京都",
        pickleballExperience: "1-2 years",
        gender: "男性",
        ageGroup: "30代",
        skillLevel: "intermediate",
        duprDoubles: 4.500,
        duprSingles: 4.250,
        myPaddle: "JOOLA Ben Johns Hyperion",
        isProfileComplete: true,
        instagramUrl: "https://instagram.com/test",
        twitterUrl: "https://twitter.com/test",
        tiktokUrl: nil,
        lineUrl: "https://line.me/ti/p/test",
        battleRecords: [
            BattleRecord(id: "1", tournamentName: "福岡オープン", yearMonth: "2025/12", result: "3位"),
            BattleRecord(id: "2", tournamentName: "初心者大会", yearMonth: "2025/11", result: "優勝")
        ]
    ))
}
