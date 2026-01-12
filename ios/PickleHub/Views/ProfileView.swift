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
                // ハンバーガーメニューヘッダー
                HamburgerHeaderView(title: "プロフィール", onMenuTap: openDrawer)

                ScrollView {
                    if let user = authViewModel.currentUser {
                        VStack(alignment: .leading, spacing: 20) {
                            // Header
                            VStack(alignment: .leading, spacing: 8) {
                                HStack(alignment: .top, spacing: 16) {
                                    // Profile Image
                                    ProfileImageView(url: user.profileImageURL, size: 80)

                                    VStack(alignment: .leading, spacing: 8) {
                                        Text(user.displayName)
                                            .font(.title)
                                            .fontWeight(.bold)

                                        if let bio = user.bio, !bio.isEmpty {
                                            ExpandableTextView(
                                                text: bio,
                                                lineLimit: 3,
                                                font: .body,
                                                foregroundColor: .secondary,
                                                alignment: .leading
                                            )
                                        }
                                    }
                                }
                            }
                            .padding()

                            Divider()

                            // Profile Details
                            VStack(alignment: .leading, spacing: 8) {
                                Text("プロフィール情報")
                                    .font(.headline)

                                VStack(spacing: Spacing.md) {
                                    if let nickname = user.nickname {
                                        ProfileInfoRow(
                                            icon: "person.fill",
                                            label: "ニックネーム",
                                            value: nickname
                                        )
                                    }

                                    if let region = user.region {
                                        ProfileInfoRow(
                                            icon: "mappin.circle.fill",
                                            label: "地域",
                                            value: region
                                        )
                                    }

                                    if let experience = user.pickleballExperience {
                                        ProfileInfoRow(
                                            icon: "clock.fill",
                                            label: "ピックルボール歴",
                                            value: experience
                                        )
                                    }

                                    if let skillLevel = user.skillLevel {
                                        ProfileInfoRow(
                                            icon: "star.fill",
                                            label: "レベル",
                                            value: skillLevel
                                        )
                                    }

                                    // DUPR Doubles
                                    ProfileInfoRow(
                                        icon: "chart.line.uptrend.xyaxis",
                                        label: "DUPR ダブルス",
                                        value: user.duprDoubles != nil ? String(format: "%.3f", user.duprDoubles!) : "-"
                                    )

                                    // DUPR Singles
                                    ProfileInfoRow(
                                        icon: "chart.line.uptrend.xyaxis",
                                        label: "DUPR シングルス",
                                        value: user.duprSingles != nil ? String(format: "%.3f", user.duprSingles!) : "-"
                                    )

                                    ProfileInfoRow(
                                        icon: "tennis.racket",
                                        label: "使用パドル",
                                        value: user.myPaddle ?? "-"
                                    )

                                    if let gender = user.gender {
                                        ProfileInfoRow(
                                            icon: "person.2.fill",
                                            label: "性別",
                                            value: gender
                                        )
                                    }

                                    if let ageGroup = user.ageGroup {
                                        ProfileInfoRow(
                                            icon: "number.circle.fill",
                                            label: "年代",
                                            value: ageGroup
                                        )
                                    }
                                }
                                .padding(Spacing.md)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.medium)
                                        .fill(Color(.systemGray6))
                                )
                            }
                            .padding(.horizontal)

                            // Battle Records Section
                            if let battleRecords = user.battleRecords, !battleRecords.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("戦歴")
                                        .font(.headline)
                                        .foregroundColor(.secondary)

                                    VStack(spacing: 0) {
                                        ForEach(battleRecords) { record in
                                            HStack {
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text(record.tournamentName)
                                                        .font(.subheadline)
                                                        .fontWeight(.medium)
                                                    Text(record.yearMonth)
                                                        .font(.caption)
                                                        .foregroundColor(.secondary)
                                                }
                                                Spacer()
                                                Text(record.result)
                                                    .font(.subheadline)
                                                    .fontWeight(.semibold)
                                                    .foregroundColor(record.result == "優勝" ? .red : .primary)
                                            }
                                            .padding(.vertical, 12)
                                            .padding(.horizontal, 16)

                                            if record.id != battleRecords.last?.id {
                                                Divider()
                                                    .padding(.leading, 16)
                                            }
                                        }
                                    }
                                    .background(
                                        RoundedRectangle(cornerRadius: CornerRadius.medium)
                                            .fill(Color(.systemGray6))
                                    )
                                }
                                .padding(.horizontal)
                            }

                            // SNS Links Section
                            if user.instagramUrl != nil || user.twitterUrl != nil || user.tiktokUrl != nil || user.lineUrl != nil {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("SNS")
                                        .font(.headline)
                                        .foregroundColor(.secondary)

                                    VStack(spacing: 8) {
                                        if let instagramUrl = user.instagramUrl, !instagramUrl.isEmpty {
                                            SNSLinkButton(
                                                platform: .instagram,
                                                url: instagramUrl
                                            )
                                        }
                                        if let twitterUrl = user.twitterUrl, !twitterUrl.isEmpty {
                                            SNSLinkButton(
                                                platform: .twitter,
                                                url: twitterUrl
                                            )
                                        }
                                        if let tiktokUrl = user.tiktokUrl, !tiktokUrl.isEmpty {
                                            SNSLinkButton(
                                                platform: .tiktok,
                                                url: tiktokUrl
                                            )
                                        }
                                        if let lineUrl = user.lineUrl, !lineUrl.isEmpty {
                                            SNSLinkButton(
                                                platform: .line,
                                                url: lineUrl
                                            )
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }

                            Divider()

                            // Actions
                            VStack(spacing: 12) {
                                // My Events
                                Button(action: { showingMyEvents = true }) {
                                    HStack {
                                        Image(systemName: "calendar")
                                        Text("マイイベント")
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                    }
                                    .foregroundColor(.primary)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(12)
                                }

                                // Edit Profile
                                Button(action: { showingEditProfile = true }) {
                                    HStack {
                                        Image(systemName: "pencil")
                                        Text("プロフィールを編集")
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                    }
                                    .foregroundColor(.primary)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(12)
                                }

                                // Contact / お問い合わせ
                                Button(action: {
                                    if let url = URL(string: "https://docs.google.com/forms/d/e/1FAIpQLScti-2AT0gb4oM7gpdvLuKSNYQ9ruulbHXPqcEJraR9BTIRkQ/viewform?usp=header") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    HStack {
                                        Image(systemName: "envelope")
                                        Text("お問い合わせ")
                                        Spacer()
                                        Image(systemName: "arrow.up.right.square")
                                            .font(.caption)
                                    }
                                    .foregroundColor(.primary)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(12)
                                }

                                // Sign Out
                                Button(action: { showingSignOutAlert = true }) {
                                    HStack {
                                        Spacer()
                                        Text("ログアウト")
                                            .foregroundColor(.red)
                                        Spacer()
                                    }
                                    .padding()
                                    .background(Color.red.opacity(0.1))
                                    .cornerRadius(12)
                                }

                                // Delete Account
                                Button(action: { showingDeleteAccountAlert = true }) {
                                    HStack {
                                        Spacer()
                                        Text("アカウントを削除")
                                            .foregroundColor(.secondary)
                                            .font(.headline)
                                        Spacer()
                                    }
                                    .padding()
                                    .background(Color.white)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                    )
                                }
                            }
                            .padding(.horizontal)

                            Spacer()
                        }
                    } else {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
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

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
        .environmentObject(EventsViewModel())
}
