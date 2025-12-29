import SwiftUI

struct OnboardingBioView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                // Icon
                Image(systemName: "text.bubble.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(.twitterBlue)
                    .padding(.bottom, Spacing.md)
                    .padding(.top, Spacing.xl * 2)

                // Title
                Text("自己紹介を\n書いてください")
                    .font(.displayMedium)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                // Subtitle
                Text("プロフィールに表示されます（任意）")
                    .font(.bodyLarge)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Spacer()
                    .frame(height: Spacing.xl)

                // Input
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    ZStack(alignment: .topLeading) {
                        if viewModel.bio.isEmpty {
                            Text("例: ピックルボール歴1年です。楽しく練習できる仲間を募集しています！")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 8)
                        }

                        TextEditor(text: $viewModel.bio)
                            .font(.bodyMedium)
                            .frame(height: 120)
                            .scrollContentBackground(.hidden)
                            .focused($isFocused)
                            .onChange(of: viewModel.bio) { newValue in
                                if newValue.count > 200 {
                                    viewModel.bio = String(newValue.prefix(200))
                                }
                            }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.medium)
                            .fill(Color.twitterGray)
                    )

                    Text("\(viewModel.bio.count)/200")
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
    }
}
