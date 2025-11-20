import SwiftUI

struct OnboardingExperienceView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    let experiences = ["6ヶ月未満", "6ヶ月〜1年", "1〜2年", "2〜3年", "3年以上"]

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            // Icon
            Image(systemName: "clock.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .foregroundColor(.twitterBlue)
                .padding(.bottom, Spacing.md)

            // Title
            Text("ピックルボール歴を\n教えてください")
                .font(.displayMedium)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            // Options
            VStack(spacing: Spacing.md) {
                ForEach(experiences, id: \.self) { experience in
                    SelectionCard(
                        title: experience,
                        isSelected: viewModel.selectedExperience == experience,
                        action: { viewModel.selectedExperience = experience }
                    )
                }
            }
            .padding(.horizontal, Spacing.xl)

            Spacer()
        }
    }
}
