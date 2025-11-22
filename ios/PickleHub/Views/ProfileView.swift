import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingSignOutAlert = false
    @State private var showingEditProfile = false

    var body: some View {
        NavigationView {
            List {
                // Profile Header
                Section {
                    HStack(spacing: 16) {
                        // Profile Image
                        if let profileImageURL = authViewModel.currentUser?.profileImageURL {
                            AsyncImage(url: profileImageURL) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 80, height: 80)
                                        .clipShape(Circle())
                                case .failure(let error):
                                    VStack {
                                        Image(systemName: "person.circle.fill")
                                            .resizable()
                                            .frame(width: 80, height: 80)
                                            .foregroundColor(.gray)
                                    }
                                    .onAppear {
                                        print("❌ Failed to load profile image from: \(profileImageURL)")
                                        print("   Error: \(error)")
                                    }
                                case .empty:
                                    ProgressView()
                                        .frame(width: 80, height: 80)
                                @unknown default:
                                    EmptyView()
                                }
                            }
                            .onAppear {
                                print("📷 Loading profile image from: \(profileImageURL)")
                                print("   User profileImage string: \(authViewModel.currentUser?.profileImage ?? "nil")")
                            }
                        } else {
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .frame(width: 80, height: 80)
                                .foregroundColor(.gray)
                                .onAppear {
                                    print("⚠️ No profile image URL")
                                    print("   User profileImage string: \(authViewModel.currentUser?.profileImage ?? "nil")")
                                }
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authViewModel.currentUser?.displayName ?? "")
                                .font(.title2)
                                .bold()
                            Text(authViewModel.currentUser?.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                // Profile Details
                if let user = authViewModel.currentUser {
                    Section(header: Text("プロフィール")) {
                        if let nickname = user.nickname {
                            HStack {
                                Label("ニックネーム", systemImage: "person.fill")
                                Spacer()
                                Text(nickname)
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let region = user.region {
                            HStack {
                                Label("地域", systemImage: "mappin.circle.fill")
                                Spacer()
                                Text(region)
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let experience = user.pickleballExperience {
                            HStack {
                                Label("ピックルボール歴", systemImage: "clock.fill")
                                Spacer()
                                Text(experience)
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let skillLevel = user.skillLevel {
                            HStack {
                                Label("レベル", systemImage: "star.fill")
                                Spacer()
                                Text(skillLevel)
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let gender = user.gender {
                            HStack {
                                Label("性別", systemImage: "person.2.fill")
                                Spacer()
                                Text(gender)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }

                    Section {
                        Button(action: {
                            showingEditProfile = true
                        }) {
                            HStack {
                                Spacer()
                                Text("プロフィールを編集")
                                Spacer()
                            }
                        }
                    }
                }

                Section {
                    Button(action: {
                        showingSignOutAlert = true
                    }) {
                        HStack {
                            Spacer()
                            Text("ログアウト")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("プロフィール")
            .sheet(isPresented: $showingEditProfile) {
                if let user = authViewModel.currentUser {
                    ProfileEditView(user: user)
                        .environmentObject(authViewModel)
                }
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
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
