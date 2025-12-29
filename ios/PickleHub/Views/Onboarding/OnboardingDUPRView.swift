import SwiftUI

struct OnboardingDUPRView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var focusedField: Field?

    enum Field {
        case doubles, singles
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                // Icon
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(.twitterBlue)
                    .padding(.bottom, Spacing.md)
                    .padding(.top, Spacing.xl * 2)

                // Title
                Text("DUPRレーティングを\n入力してください")
                    .font(.displayMedium)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                // Subtitle
                Text("スキップも可能です")
                    .font(.bodyLarge)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Spacer()
                    .frame(height: Spacing.xl)

                // Input Fields
                VStack(spacing: Spacing.md) {
                    // Doubles DUPR
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        Text("ダブルス")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        TextField("例: 4.500", text: $viewModel.duprDoublesText)
                            .font(.headlineLarge)
                            .keyboardType(.decimalPad)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.medium)
                                    .fill(Color.twitterGray)
                            )
                            .focused($focusedField, equals: .doubles)
                            .onChange(of: viewModel.duprDoublesText) { _, newValue in
                                viewModel.duprDoublesText = formatDUPRInput(newValue)
                            }

                        Text("小数点以下3桁まで入力可能")
                            .font(.bodySmall)
                            .foregroundColor(.secondary)
                            .padding(.horizontal, Spacing.sm)
                    }

                    // Singles DUPR
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        Text("シングルス")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        TextField("例: 4.500", text: $viewModel.duprSinglesText)
                            .font(.headlineLarge)
                            .keyboardType(.decimalPad)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.medium)
                                    .fill(Color.twitterGray)
                            )
                            .focused($focusedField, equals: .singles)
                            .onChange(of: viewModel.duprSinglesText) { _, newValue in
                                viewModel.duprSinglesText = formatDUPRInput(newValue)
                            }

                        Text("小数点以下3桁まで入力可能")
                            .font(.bodySmall)
                            .foregroundColor(.secondary)
                            .padding(.horizontal, Spacing.sm)
                    }
                }
                .padding(.horizontal, Spacing.xl)

                Spacer()
                    .frame(height: Spacing.xl * 3)
            }
        }
        .disabled(false) // ScrollViewのインタラクションを有効化
        .scrollDismissesKeyboard(.interactively)
    }

    private func formatDUPRInput(_ input: String) -> String {
        // Allow empty string
        if input.isEmpty {
            return input
        }

        // Remove any non-numeric characters except decimal point
        let filtered = input.filter { $0.isNumber || $0 == "." }

        // Split by decimal point
        let parts = filtered.split(separator: ".", maxSplits: 1, omittingEmptySubsequences: false)

        if parts.count == 1 {
            // No decimal point
            return String(parts[0])
        } else if parts.count == 2 {
            // Has decimal point
            let integerPart = String(parts[0])
            let decimalPart = String(parts[1].prefix(3)) // Limit to 3 decimal places
            return "\(integerPart).\(decimalPart)"
        }

        return filtered
    }
}
