import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @State private var showingSignOutAlert = false
    @State private var showingDeleteAccountAlert = false
    @State private var showingDeleteAccountError = false
    @State private var deleteAccountErrorMessage = ""
    @State private var showingEditProfile = false
    @State private var showingMyEvents = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("PickleHub")
                    .font(.system(size: 28, weight: .black, design: .default))
                    .italic()
                    .kerning(-0.5)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                ScrollView {
                    if let user = authViewModel.currentUser {
                        VStack(alignment: .leading, spacing: 16) {
                            // Header Card
                            VStack(alignment: .leading, spacing: 8) {
                                HStack(alignment: .top, spacing: 16) {
                                    // Profile Image with blue border
                                    if let profileImageURL = user.profileImageURL {
                                        CachedAsyncImagePhase(url: profileImageURL) { phase in
                                            switch phase {
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 80, height: 80)
                                                    .clipShape(Circle())
                                                    .overlay(
                                                        Circle()
                                                            .stroke(Color.twitterBlue.opacity(0.3), lineWidth: 3)
                                                    )
                                            case .failure(_), .empty:
                                                Image(systemName: "person.circle.fill")
                                                    .resizable()
                                                    .scaledToFit()
                                                    .frame(width: 80, height: 80)
                                                    .foregroundColor(.gray)
                                                    .background(Color(.systemGray6))
                                                    .clipShape(Circle())
                                                    .overlay(
                                                        Circle()
                                                            .stroke(Color.twitterBlue.opacity(0.3), lineWidth: 3)
                                                    )
                                            @unknown default:
                                                EmptyView()
                                            }
                                        }
                                    } else {
                                        Image(systemName: "person.circle.fill")
                                            .resizable()
                                            .scaledToFit()
                                            .frame(width: 80, height: 80)
                                            .foregroundColor(.gray)
                                            .background(Color(.systemGray6))
                                            .clipShape(Circle())
                                            .overlay(
                                                Circle()
                                                    .stroke(Color.twitterBlue.opacity(0.3), lineWidth: 3)
                                            )
                                    }

                                    VStack(alignment: .leading, spacing: 8) {
                                        Text(user.displayName)
                                            .font(.title)
                                            .fontWeight(.bold)

                                        if let bio = user.bio, !bio.isEmpty {
                                            Text(bio)
                                                .font(.body)
                                                .foregroundColor(.secondary)
                                                .lineLimit(3)
                                        }

                                        if let region = user.region {
                                            HStack {
                                                Label(region, systemImage: "mappin.circle")
                                                    .font(.caption)
                                                    .foregroundColor(.secondary)
                                            }
                                        }
                                    }
                                }
                            }
                            .padding()
                            .background(Color.white)
                            .cornerRadius(CornerRadius.medium)
                            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
                            .padding(.horizontal)

                            // Profile Details Card
                            VStack(alignment: .leading, spacing: 12) {
                                Text("プロフィール情報")
                                    .font(.headline)
                                    .foregroundColor(.twitterBlue)

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

                                    if let myPaddle = user.myPaddle, !myPaddle.isEmpty {
                                        ProfileInfoRow(
                                            icon: "sportscourt.fill",
                                            label: "使用パドル",
                                            value: myPaddle
                                        )
                                    }

                                    if let gender = user.gender {
                                        ProfileInfoRow(
                                            icon: "person.2.fill",
                                            label: "性別",
                                            value: gender
                                        )
                                    }
                                }
                            }
                            .padding()
                            .background(Color.white)
                            .cornerRadius(CornerRadius.medium)
                            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
                            .padding(.horizontal)

                            // Actions
                            VStack(spacing: 12) {
                                // My Events - Blue primary button
                                Button(action: { showingMyEvents = true }) {
                                    HStack {
                                        Image(systemName: "calendar")
                                            .foregroundColor(.white)
                                        Text("マイイベント")
                                            .foregroundColor(.white)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(.white)
                                    }
                                    .padding()
                                    .background(Color.twitterBlue)
                                    .cornerRadius(12)
                                }

                                // Edit Profile - White card
                                Button(action: { showingEditProfile = true }) {
                                    HStack {
                                        Image(systemName: "pencil")
                                            .foregroundColor(.twitterBlue)
                                        Text("プロフィールを編集")
                                            .foregroundColor(.primary)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(.secondary)
                                    }
                                    .padding()
                                    .background(Color.white)
                                    .cornerRadius(12)
                                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
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

                            Spacer(minLength: 20)
                        }
                        .padding(.vertical)
                    } else {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .background(Color(.systemGroupedBackground))
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
