import SwiftUI

struct OnboardingGenderView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    let genders = ["男性", "女性", "回答しない"]

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                // Icon
                Image(systemName: "person.2.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(.twitterBlue)
                    .padding(.bottom, Spacing.md)
                    .padding(.top, Spacing.xl * 2)

                // Title
                Text("性別を\n選択してください")
                    .font(.displayMedium)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                // Subtitle
                Text("どれか選択してください")
                    .font(.bodyLarge)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Spacer()
                    .frame(height: Spacing.xl)

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
                    .frame(height: Spacing.xl * 3)
            }
        }
    }
}
