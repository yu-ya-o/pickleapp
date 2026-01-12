import SwiftUI

// Light theme colors (same as ProfileView)
private let lightBg = Color(red: 245/255, green: 245/255, blue: 247/255)
private let cardBg = Color.white
private let cardBorder = Color(red: 229/255, green: 231/255, blue: 235/255)
private let textPrimary = Color(red: 26/255, green: 26/255, blue: 46/255)
private let textSecondary = Color(red: 107/255, green: 114/255, blue: 128/255)
private let textMuted = Color(red: 156/255, green: 163/255, blue: 175/255)
private let accentPurple = Color(red: 139/255, green: 92/255, blue: 246/255)

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
                            .foregroundColor(textPrimary)
                            .frame(width: 44, height: 44)
                    }

                    Spacer()

                    Text("プロフィール")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(textPrimary)

                    Spacer()

                    // Spacer for balance
                    Color.clear
                        .frame(width: 44, height: 44)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(cardBg)

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
                                .foregroundColor(textPrimary)

                            // 自己紹介
                            if let bio = user.bio, !bio.isEmpty {
                                Text(bio)
                                    .font(.system(size: 14))
                                    .foregroundColor(textSecondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                            }

                            // DUPR セクション
                            HStack(spacing: 12) {
                                DUPRBoxLight(
                                    label: "DUPR SINGLES",
                                    value: user.duprSingles != nil ? String(format: "%.3f", user.duprSingles!) : "-"
                                )
                                DUPRBoxLight(
                                    label: "DUPR DOUBLES",
                                    value: user.duprDoubles != nil ? String(format: "%.3f", user.duprDoubles!) : "-"
                                )
                            }
                            .padding(.horizontal, 16)

                            Divider()
                                .background(cardBorder)
                                .padding(.horizontal, 16)

                            // プロフィール詳細（2カラム）
                            VStack(spacing: 16) {
                                HStack(spacing: 0) {
                                    ProfileDetailItemLight(label: "REGION", value: user.region ?? "-")
                                    ProfileDetailItemLight(label: "EXPERIENCE", value: user.pickleballExperience ?? "-")
                                }
                                HStack(spacing: 0) {
                                    ProfileDetailItemLight(label: "LEVEL", value: user.skillLevel ?? "-")
                                    ProfileDetailItemLight(label: "GENDER", value: user.gender ?? "-")
                                }
                                HStack(spacing: 0) {
                                    ProfileDetailItemLight(label: "AGE", value: user.ageGroup ?? "-")
                                    ProfileDetailItemLight(label: "PADDLE", value: user.myPaddle ?? "-")
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 16)
                        }
                        .background(cardBg)
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(cardBorder, lineWidth: 1)
                        )
                        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
                        .padding(.horizontal, 16)
                        .padding(.top, 16)

                        // TEAMSセクション
                        VStack(alignment: .leading, spacing: 12) {
                            Text("TEAMS")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(textMuted)
                                .tracking(1)
                                .padding(.horizontal, 16)

                            if viewModel.isLoading {
                                ProgressView()
                                    .tint(accentPurple)
                                    .padding(.horizontal, 16)
                            } else if viewModel.teams.isEmpty {
                                Text("ありません")
                                    .font(.system(size: 14))
                                    .foregroundColor(textMuted)
                                    .padding(.horizontal, 16)
                            } else {
                                VStack(spacing: 8) {
                                    ForEach(viewModel.teams) { team in
                                        TeamRowButtonLight(team: team)
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }

                        // 戦績セクション
                        VStack(alignment: .leading, spacing: 12) {
                            Text("BATTLE RECORD")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(textMuted)
                                .tracking(1)
                                .padding(.horizontal, 16)

                            if let battleRecords = user.battleRecords, !battleRecords.isEmpty {
                                VStack(spacing: 0) {
                                    ForEach(battleRecords) { record in
                                        HStack {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(record.tournamentName)
                                                    .font(.system(size: 15, weight: .medium))
                                                    .foregroundColor(textPrimary)
                                                Text(record.yearMonth)
                                                    .font(.system(size: 13))
                                                    .foregroundColor(textSecondary)
                                            }
                                            Spacer()
                                            Text(record.result)
                                                .font(.system(size: 15, weight: .semibold))
                                                .foregroundColor(record.result == "優勝" ? Color(red: 234/255, green: 179/255, blue: 8/255) : textPrimary)
                                        }
                                        .padding(.vertical, 14)
                                        .padding(.horizontal, 16)

                                        if record.id != battleRecords.last?.id {
                                            Divider()
                                                .background(cardBorder)
                                                .padding(.leading, 16)
                                        }
                                    }
                                }
                                .background(cardBg)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(cardBorder, lineWidth: 1)
                                )
                                .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 1)
                                .padding(.horizontal, 16)
                            } else {
                                Text("ありません")
                                    .font(.system(size: 14))
                                    .foregroundColor(textMuted)
                                    .padding(.horizontal, 16)
                            }
                        }

                        // SNSリンクセクション
                        VStack(alignment: .leading, spacing: 12) {
                            Text("SNS")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(textMuted)
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
                                    .foregroundColor(textMuted)
                                    .padding(.horizontal, 16)
                            }
                        }
                        .padding(.bottom, 32)
                    }
                }
                .background(lightBg)
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

// チーム行ボタン（ライト）
struct TeamRowButtonLight: View {
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
                            .fill(cardBorder)
                    }
                    .frame(width: 40, height: 40)
                    .clipShape(Circle())
                } else {
                    Circle()
                        .fill(cardBorder)
                        .frame(width: 40, height: 40)
                }

                Text(team.name)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(textPrimary)

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(cardBg)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(cardBorder, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 1)
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

// Legacy component for compatibility (now uses light theme)
struct TeamRowButtonDark: View {
    let team: Team

    var body: some View {
        TeamRowButtonLight(team: team)
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
