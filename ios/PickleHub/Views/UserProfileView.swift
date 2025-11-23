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
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    // Profile Image
                    if let profileImageURL = user.profileImageURL {
                        AsyncImage(url: profileImageURL) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 120, height: 120)
                                    .clipShape(Circle())
                            case .failure(_), .empty:
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .frame(width: 120, height: 120)
                                    .foregroundColor(.gray)
                            @unknown default:
                                EmptyView()
                            }
                        }
                    } else {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .frame(width: 120, height: 120)
                            .foregroundColor(.gray)
                    }

                    // Display Name
                    Text(user.displayName)
                        .font(.title)
                        .fontWeight(.bold)

                    // Bio
                    if let bio = user.bio, !bio.isEmpty {
                        Text(bio)
                            .font(.bodyMedium)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, Spacing.md)
                    }

                    // Profile Details
                    VStack(spacing: Spacing.md) {
                        if let region = user.region {
                            ProfileInfoRow(
                                icon: "mappin.circle.fill",
                                label: "地域",
                                value: region
                            )
                        }

                        if let skillLevel = user.skillLevel {
                            ProfileInfoRow(
                                icon: "star.fill",
                                label: "スキルレベル",
                                value: skillLevel.capitalized
                            )
                        }

                        if let experience = user.pickleballExperience {
                            ProfileInfoRow(
                                icon: "clock.fill",
                                label: "経験",
                                value: experience
                            )
                        }

                        if let gender = user.gender {
                            ProfileInfoRow(
                                icon: "person.fill",
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

                    // Teams Section
                    if viewModel.isLoading {
                        ProgressView()
                            .padding()
                    } else if !viewModel.teams.isEmpty {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            Text("所属チーム")
                                .font(.headlineMedium)
                                .fontWeight(.bold)
                                .padding(.horizontal, Spacing.md)

                            ForEach(viewModel.teams) { team in
                                TeamCardRow(team: team)
                            }
                        }
                    }
                }
                .padding(Spacing.lg)
            }
            .onAppear {
                Task {
                    await viewModel.loadTeams()
                }
            }
            .navigationTitle("プロフィール")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct ProfileInfoRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: icon)
                .foregroundColor(.twitterBlue)
                .frame(width: 24)

            Text(label)
                .font(.bodyMedium)
                .foregroundColor(.secondary)
                .frame(width: 120, alignment: .leading)

            Text(value)
                .font(.bodyMedium)
                .fontWeight(.medium)

            Spacer()
        }
    }
}

struct TeamCardRow: View {
    let team: Team

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Team Icon
            if let iconImageURL = team.iconImageURL {
                AsyncImage(url: iconImageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Image(systemName: "person.3.fill")
                        .foregroundColor(.gray)
                }
                .frame(width: 40, height: 40)
                .clipShape(RoundedRectangle(cornerRadius: CornerRadius.small))
            } else {
                Image(systemName: "person.3.fill")
                    .resizable()
                    .foregroundColor(.gray)
                    .frame(width: 40, height: 40)
                    .padding(8)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: CornerRadius.small))
            }

            // Team Info
            VStack(alignment: .leading, spacing: 4) {
                Text(team.name)
                    .font(.bodyMedium)
                    .fontWeight(.semibold)

                HStack(spacing: 8) {
                    if let region = team.region {
                        Label(region, systemImage: "mappin.circle.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Label("\(team.memberCount)人", systemImage: "person.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()
        }
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.medium)
                .fill(Color(.systemGray6))
        )
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
        gender: "Male",
        skillLevel: "intermediate",
        isProfileComplete: true,
        instagramUrl: nil,
        twitterUrl: nil,
        tiktokUrl: nil,
        lineUrl: nil
    ))
}
