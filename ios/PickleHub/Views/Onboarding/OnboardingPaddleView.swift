import SwiftUI

struct OnboardingPaddleView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            // Icon
            Image(systemName: "tennis.racket")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .foregroundColor(.twitterBlue)
                .padding(.bottom, Spacing.md)

            // Title
            Text("使用パドルを\n教えてください")
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

            // Input
            VStack(alignment: .leading, spacing: Spacing.sm) {
                TextField("例: JOOLA Ben Johns Hyperion", text: $viewModel.myPaddle)
                    .font(.bodyMedium)
                    .textFieldStyle(.plain)
                    .focused($isFocused)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.medium)
                            .fill(Color.twitterGray)
                    )
                    .onChange(of: viewModel.myPaddle) { newValue in
                        if newValue.count > 100 {
                            viewModel.myPaddle = String(newValue.prefix(100))
                        }
                    }

                Text("\(viewModel.myPaddle.count)/100")
                    .font(.bodySmall)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, Spacing.sm)
            }
            .padding(.horizontal, Spacing.xl)

            Spacer()
        }
    }
}
