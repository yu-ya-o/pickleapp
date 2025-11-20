import SwiftUI

struct OnboardingSkillLevelView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    let skillLevels = [
        ("初心者", "ルールを覚えたばかり", "tortoise.fill"),
        ("中級者", "基本的なラリーができる", "hare.fill"),
        ("上級者", "試合経験が豊富", "flame.fill")
    ]

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            // Icon
            Image(systemName: "star.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .foregroundColor(.twitterBlue)
                .padding(.bottom, Spacing.md)

            // Title
            Text("レベルを\n選択してください")
                .font(.displayMedium)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            // Options
            VStack(spacing: Spacing.md) {
                ForEach(skillLevels, id: \.0) { level in
                    SkillLevelCard(
                        title: level.0,
                        subtitle: level.1,
                        icon: level.2,
                        isSelected: viewModel.selectedSkillLevel == level.0,
                        action: { viewModel.selectedSkillLevel = level.0 }
                    )
                }
            }
            .padding(.horizontal, Spacing.xl)

            Spacer()
        }
    }
}

// MARK: - Skill Level Card
struct SkillLevelCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.md) {
                Image(systemName: icon)
                    .font(.title)
                    .foregroundColor(isSelected ? .twitterBlue : .gray)
                    .frame(width: 40)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headlineMedium)
                        .foregroundColor(.primary)
                    Text(subtitle)
                        .font(.bodySmall)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.twitterBlue)
                        .font(.title2)
                }
            }
            .padding(Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.medium)
                    .fill(isSelected ? Color.twitterBlue.opacity(0.1) : Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.medium)
                            .stroke(isSelected ? Color.twitterBlue : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}
