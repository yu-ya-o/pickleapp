import SwiftUI

struct UserProfileView: View {
    let user: User
    @Environment(\.dismiss) var dismiss

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
                }
                .padding(Spacing.lg)
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
                .frame(width: 80, alignment: .leading)

            Text(value)
                .font(.bodyMedium)
                .fontWeight(.medium)

            Spacer()
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
        region: "東京都",
        pickleballExperience: "1-2 years",
        gender: "Male",
        skillLevel: "intermediate",
        isProfileComplete: true
    ))
}
