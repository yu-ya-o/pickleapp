import SwiftUI

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

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // ヘッダー
                HStack(spacing: 12) {
                    Button(action: openDrawer) {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                            .frame(width: 44, height: 44)
                    }

                    Spacer()

                    Text("PickleHub")
                        .font(.system(size: 24, weight: .black))
                        .italic()
                        .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))

                    Spacer()

                    Button(action: {
                        // Share action
                    }) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                            .frame(width: 44, height: 44)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white)

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

                                // TODO: チーム一覧の取得と表示
                                Text("ありません")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
                                    .padding(.horizontal, 16)
                            }

                            // 戦績セクション
                            VStack(alignment: .leading, spacing: 12) {
                                Text("戦績")
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
                                Text("SNSリンク")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
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
                                        .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
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
                                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
                                    }
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 16)
                                    .background(Color.white)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color(red: 229/255, green: 231/255, blue: 235/255), lineWidth: 1)
                                    )
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
                                    .background(Color(red: 254/255, green: 226/255, blue: 226/255))
                                    .cornerRadius(12)
                                }

                                // アカウントを削除
                                Button(action: { showingDeleteAccountAlert = true }) {
                                    HStack {
                                        Spacer()
                                        Text("アカウントを削除")
                                            .font(.system(size: 15))
                                            .foregroundColor(Color(red: 156/255, green: 163/255, blue: 175/255))
                                        Spacer()
                                    }
                                    .padding(.vertical, 16)
                                    .background(Color(red: 249/255, green: 250/255, blue: 251/255))
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color(red: 229/255, green: 231/255, blue: 235/255), lineWidth: 1)
                                    )
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 32)
                        }
                    } else {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .background(Color(red: 249/255, green: 250/255, blue: 251/255))
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
    }
}

// DUPR ボックスコンポーネント
struct DUPRBox: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 8) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                .tracking(0.5)

            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(value == "-" ? Color(red: 99/255, green: 102/255, blue: 241/255) : Color(red: 26/255, green: 26/255, blue: 46/255))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color(red: 249/255, green: 250/255, blue: 251/255))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(red: 229/255, green: 231/255, blue: 235/255), lineWidth: 1)
        )
    }
}

// プロフィール詳細アイテムコンポーネント
struct ProfileDetailItem: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(Color(red: 107/255, green: 114/255, blue: 128/255))
                .tracking(0.5)

            Text(value)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 4)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
        .environmentObject(EventsViewModel())
}
