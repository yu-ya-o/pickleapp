import SwiftUI

struct OnboardingNicknameView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                // Icon
                Image(systemName: "person.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(.twitterBlue)
                    .padding(.bottom, Spacing.md)
                    .padding(.top, Spacing.xl * 2)

                // Title
                Text("ニックネームを\n教えてください")
                    .font(.displayMedium)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                // Subtitle
                Text("他のユーザーに表示される名前です")
                    .font(.bodyLarge)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Spacer()
                    .frame(height: Spacing.xl)

                // Input
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    TextField("ニックネーム", text: $viewModel.nickname)
                        .font(.headlineLarge)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.medium)
                                .fill(Color.twitterGray)
                        )
                        .focused($isFocused)
                        .submitLabel(.next)

                    Text("\(viewModel.nickname.count)/20")
                        .font(.bodySmall)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, Spacing.sm)
                }
                .padding(.horizontal, Spacing.xl)

                Spacer()
                    .frame(height: Spacing.xl * 3)
            }
        }
        .disabled(false) // ScrollViewのインタラクションを有効化
        .scrollDismissesKeyboard(.interactively)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isFocused = true
            }
        }
    }
}
