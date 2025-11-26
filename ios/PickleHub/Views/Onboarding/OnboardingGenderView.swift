import SwiftUI

struct OnboardingGenderView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    let genders = ["男性", "女性"]

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            // Icon
            Image(systemName: "person.2.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .foregroundColor(.twitterBlue)
                .padding(.bottom, Spacing.md)

            // Title
            Text("性別を\n選択してください")
                .font(.displayMedium)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            // Subtitle
            Text("スキップ可能です")
                .font(.bodyLarge)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            // Options
            VStack(spacing: Spacing.md) {
                ForEach(genders, id: \.self) { gender in
                    SelectionCard(
                        title: gender,
                        isSelected: viewModel.selectedGender == gender,
                        action: { viewModel.selectedGender = gender }
                    )
                }
            }
            .padding(.horizontal, Spacing.xl)

            Spacer()
        }
    }
}
