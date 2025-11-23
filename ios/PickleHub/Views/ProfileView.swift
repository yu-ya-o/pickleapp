import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @State private var showingSignOutAlert = false
    @State private var showingEditProfile = false
    @State private var showingMyEvents = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("PickleHub")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                ScrollView {
                    if let user = authViewModel.currentUser {
                        VStack(alignment: .leading, spacing: 20) {
                            // Header
                            VStack(alignment: .leading, spacing: 8) {
                                HStack(alignment: .top, spacing: 16) {
                                    // Profile Image
                                    if let profileImageURL = user.profileImageURL {
                                        AsyncImage(url: profileImageURL) { phase in
                                            switch phase {
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 80, height: 80)
                                                    .clipShape(Circle())
                                            case .failure(_), .empty:
                                                Image(systemName: "person.circle.fill")
                                                    .resizable()
                                                    .scaledToFit()
                                                    .frame(width: 80, height: 80)
                                                    .foregroundColor(.gray)
                                                    .background(Color(.systemGray6))
                                                    .clipShape(Circle())
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
                                    }

                                    VStack(alignment: .leading, spacing: 8) {
                                        Text(user.displayName)
                                            .font(.title)
                                            .fontWeight(.bold)

                                        Text(user.email)
                                            .font(.body)
                                            .foregroundColor(.secondary)

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

                            Divider()

                            // Profile Details
                            VStack(alignment: .leading, spacing: 8) {
                                Text("プロフィール情報")
                                    .font(.headline)
                                    .padding(.horizontal)

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

                                    if let gender = user.gender {
                                        ProfileInfoRow(
                                            icon: "person.2.fill",
                                            label: "性別",
                                            value: gender
                                        )
                                    }
                                }
                                .padding(Spacing.md)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.medium)
                                        .fill(Color(.systemGray6))
                                )
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
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
        .environmentObject(EventsViewModel())
}
