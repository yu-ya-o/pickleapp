import SwiftUI

struct OnboardingAgeGroupView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    let ageGroups = ["10代", "20代", "30代", "40代", "50代", "60代", "70代", "80代", "90代"]

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                // Icon
                Image(systemName: "number.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(.twitterBlue)
                    .padding(.bottom, Spacing.md)
                    .padding(.top, Spacing.xl * 2)

                // Title
                Text("年代を\n選択してください")
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
                    .frame(height: Spacing.md)

                // Options - 3 columns grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: Spacing.md) {
                    ForEach(ageGroups, id: \.self) { ageGroup in
                        AgeGroupCard(
                            title: ageGroup,
                            isSelected: viewModel.selectedAgeGroup == ageGroup,
                            action: { viewModel.selectedAgeGroup = ageGroup }
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

struct AgeGroupCard: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headlineMedium)
                .fontWeight(.semibold)
                .foregroundColor(isSelected ? .white : .primary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Spacing.md)
                .background(
                    RoundedRectangle(cornerRadius: CornerRadius.medium)
                        .fill(isSelected ? Color.twitterBlue : Color.twitterGray)
                )
        }
        .buttonStyle(.plain)
    }
}
