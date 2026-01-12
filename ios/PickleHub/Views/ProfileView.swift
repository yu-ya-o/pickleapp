import SwiftUI

// Light theme colors
private let lightBg = Color(red: 245/255, green: 245/255, blue: 247/255)
private let cardBg = Color.white
private let cardBorder = Color(red: 229/255, green: 231/255, blue: 235/255)
private let textPrimary = Color(red: 26/255, green: 26/255, blue: 46/255)
private let textSecondary = Color(red: 107/255, green: 114/255, blue: 128/255)
private let textMuted = Color(red: 156/255, green: 163/255, blue: 175/255)
private let accentPurple = Color(red: 139/255, green: 92/255, blue: 246/255)

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @Environment(\.openDrawer) var openDrawer
    @State private var showingSignOutAlert = false
    @State private var showingDeleteAccountAlert = false
    @State private var showingDeleteAccountError = false
    @State private var deleteAccountErrorMessage = ""
    @State private var showingEditProfile = false
    @State private var showingMyEvents = false
    @State private var userTeams: [Team] = []
    @State private var isLoadingTeams = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // ヘッダー
                HStack(spacing: 12) {
                    Button(action: openDrawer) {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(textPrimary)
                            .frame(width: 44, height: 44)
                    }

                    Spacer()

                    Text("PickleHub")
                        .font(.system(size: 24, weight: .black))
                        .italic()
                        .foregroundColor(textPrimary)

                    Spacer()

                    Button(action: {
                        // Share action
                    }) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(textPrimary)
                            .frame(width: 44, height: 44)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(cardBg)

                ScrollView {
                    if let user = authViewModel.currentUser {
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

                                if isLoadingTeams {
                                    ProgressView()
                                        .tint(accentPurple)
                                        .padding(.horizontal, 16)
                                } else if userTeams.isEmpty {
                                    Text("ありません")
                                        .font(.system(size: 14))
                                        .foregroundColor(textMuted)
                                        .padding(.horizontal, 16)
                                } else {
                                    VStack(spacing: 8) {
                                        ForEach(userTeams) { team in
                                            NavigationLink(destination: TeamDetailView(teamId: team.id).environmentObject(authViewModel)) {
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

                                let hasSnLinks = (user.instagramUrl != nil && !user.instagramUrl!.isEmpty) ||
                                                 (user.twitterUrl != nil && !user.twitterUrl!.isEmpty) ||
                                                 (user.tiktokUrl != nil && !user.tiktokUrl!.isEmpty) ||
                                                 (user.lineUrl != nil && !user.lineUrl!.isEmpty)

                                if hasSnLinks {
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

                            // アクションボタン
                            VStack(spacing: 12) {
                                // プロフィールを編集
                                Button(action: { showingEditProfile = true }) {
                                    HStack {
                                        Text("プロフィールを編集")
                                            .font(.system(size: 15))
                                            .foregroundColor(textPrimary)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(textMuted)
                                    }
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 16)
                                    .background(cardBg)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(cardBorder, lineWidth: 1)
                                    )
                                    .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 1)
                                }

                                // ログアウト
                                Button(action: { showingSignOutAlert = true }) {
                                    HStack {
                                        Spacer()
                                        Text("ログアウト")
                                            .font(.system(size: 15, weight: .medium))
                                            .foregroundColor(Color(red: 220/255, green: 38/255, blue: 38/255))
                                        Spacer()
                                    }
                                    .padding(.vertical, 16)
                                    .background(Color(red: 254/255, green: 242/255, blue: 242/255))
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color(red: 254/255, green: 202/255, blue: 202/255), lineWidth: 1)
                                    )
                                }

                                // アカウントを削除
                                Button(action: { showingDeleteAccountAlert = true }) {
                                    HStack {
                                        Spacer()
                                        Text("アカウントを削除")
                                            .font(.system(size: 15))
                                            .foregroundColor(textMuted)
                                        Spacer()
                                    }
                                    .padding(.vertical, 16)
                                    .background(cardBg)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(cardBorder, lineWidth: 1)
                                    )
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 32)
                        }
                    } else {
                        ProgressView()
                            .tint(accentPurple)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .background(lightBg)
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingEditProfile) {
                if let user = authViewModel.currentUser {
                    ProfileEditView(user: user)
                        .environmentObject(authViewModel)
                }
            }
            .sheet(isPresented: $showingMyEvents) {
                MyEventsView()
                    .environmentObject(authViewModel)
                    .environmentObject(eventsViewModel)
            }
            .alert("ログアウト", isPresented: $showingSignOutAlert) {
                Button("キャンセル", role: .cancel) {}
                Button("ログアウト", role: .destructive) {
                    authViewModel.signOut()
                }
            } message: {
                Text("ログアウトしてもよろしいですか？")
            }
            .alert("アカウントを削除", isPresented: $showingDeleteAccountAlert) {
                Button("キャンセル", role: .cancel) {}
                Button("削除", role: .destructive) {
                    Task {
                        do {
                            try await authViewModel.deleteAccount()
                        } catch {
                            deleteAccountErrorMessage = error.localizedDescription
                            showingDeleteAccountError = true
                        }
                    }
                }
            } message: {
                Text("アカウントを削除すると、以下のデータが削除されます：\n\n• 作成したすべてのイベント\n• 今後の予約\n• 通知\n\nチームは残りますが、メッセージは「削除済みユーザー」として残ります。\n\n※オーナーまたはアドミンが他にいないチームがある場合は削除できません。\n\nこの操作は取り消せません。")
            }
            .alert("削除できませんでした", isPresented: $showingDeleteAccountError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(deleteAccountErrorMessage)
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            loadUserTeams()
        }
    }

    private func loadUserTeams() {
        guard let userId = authViewModel.currentUser?.id else { return }
        isLoadingTeams = true
        Task {
            do {
                let teams = try await APIClient.shared.getUserTeams(userId: userId)
                await MainActor.run {
                    self.userTeams = teams
                    self.isLoadingTeams = false
                }
            } catch {
                print("Failed to load user teams: \(error)")
                await MainActor.run {
                    self.isLoadingTeams = false
                }
            }
        }
    }
}

// DUPR ボックスコンポーネント（ライト）
struct DUPRBoxLight: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 8) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(textMuted)
                .tracking(0.5)

            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(value == "-" ? accentPurple : textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color(red: 249/255, green: 250/255, blue: 251/255))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(cardBorder, lineWidth: 1)
        )
    }
}

// プロフィール詳細アイテムコンポーネント（ライト）
struct ProfileDetailItemLight: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(textMuted)
                .tracking(0.5)

            Text(value)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(textPrimary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 4)
    }
}

// Legacy components for compatibility (now use light theme)
struct DUPRBox: View {
    let label: String
    let value: String

    var body: some View {
        DUPRBoxLight(label: label, value: value)
    }
}

struct DUPRBoxDark: View {
    let label: String
    let value: String

    var body: some View {
        DUPRBoxLight(label: label, value: value)
    }
}

struct ProfileDetailItem: View {
    let label: String
    let value: String

    var body: some View {
        ProfileDetailItemLight(label: label, value: value)
    }
}

struct ProfileDetailItemDark: View {
    let label: String
    let value: String

    var body: some View {
        ProfileDetailItemLight(label: label, value: value)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
        .environmentObject(EventsViewModel())
}
