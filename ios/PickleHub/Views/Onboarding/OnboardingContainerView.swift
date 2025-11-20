import SwiftUI
import PhotosUI

struct OnboardingContainerView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = OnboardingViewModel()

    @State private var currentPage = 0
    @State private var dragOffset: CGFloat = 0

    private let totalPages = 6

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.twitterBlue.opacity(0.1), Color.white],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress Indicator
                ProgressBar(currentPage: currentPage, totalPages: totalPages)
                    .padding(.top, Spacing.lg)
                    .padding(.horizontal, Spacing.xl)

                // Content
                TabView(selection: $currentPage) {
                    OnboardingNicknameView(viewModel: viewModel)
                        .tag(0)

                    OnboardingGenderView(viewModel: viewModel)
                        .tag(1)

                    OnboardingRegionView(viewModel: viewModel)
                        .tag(2)

                    OnboardingExperienceView(viewModel: viewModel)
                        .tag(3)

                    OnboardingSkillLevelView(viewModel: viewModel)
                        .tag(4)

                    OnboardingProfileImageView(viewModel: viewModel)
                        .tag(5)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.spring(response: 0.3, dampingFraction: 0.8), value: currentPage)

                // Navigation Buttons
                HStack(spacing: Spacing.md) {
                    if currentPage > 0 {
                        Button(action: { withAnimation { currentPage -= 1 } }) {
                            Text("戻る")
                                .font(.headlineMedium)
                                .foregroundColor(.twitterBlue)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Spacing.md)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.large)
                                        .stroke(Color.twitterBlue, lineWidth: 1.5)
                                )
                        }
                    }

                    Button(action: {
                        if currentPage < totalPages - 1 {
                            if canProceedToNext() {
                                withAnimation { currentPage += 1 }
                            }
                        } else {
                            // Complete onboarding
                            Task {
                                await viewModel.completeOnboarding()
                                if viewModel.isCompleted, let updatedUser = viewModel.updatedUser {
                                    authViewModel.currentUser = updatedUser
                                    if let userData = try? JSONEncoder().encode(updatedUser) {
                                        UserDefaults.standard.set(userData, forKey: "currentUser")
                                    }
                                }
                            }
                        }
                    }) {
                        Text(currentPage == totalPages - 1 ? "完了" : "次へ")
                            .font(.headlineMedium)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Spacing.md)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.large)
                                    .fill(canProceedToNext() ? Color.twitterBlue : Color.gray.opacity(0.3))
                            )
                            .opacity(viewModel.isLoading ? 0.6 : 1.0)
                            .overlay {
                                if viewModel.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                }
                            }
                    }
                    .disabled(!canProceedToNext() || viewModel.isLoading)
                }
                .padding(.horizontal, Spacing.xl)
                .padding(.bottom, Spacing.xl)
            }

            if let errorMessage = viewModel.errorMessage {
                VStack {
                    Spacer()
                    Text(errorMessage)
                        .font(.bodySmall)
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.red.opacity(0.9))
                        .cornerRadius(CornerRadius.medium)
                        .padding()
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }

    private func canProceedToNext() -> Bool {
        switch currentPage {
        case 0: return !viewModel.nickname.isEmpty
        case 1: return !viewModel.selectedGender.isEmpty
        case 2: return !viewModel.selectedRegion.isEmpty
        case 3: return !viewModel.selectedExperience.isEmpty
        case 4: return !viewModel.selectedSkillLevel.isEmpty
        case 5: return viewModel.profileImageURL != nil
        default: return false
        }
    }
}

// MARK: - Progress Bar
struct ProgressBar: View {
    let currentPage: Int
    let totalPages: Int

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<totalPages, id: \.self) { index in
                Capsule()
                    .fill(index <= currentPage ? Color.twitterBlue : Color.gray.opacity(0.3))
                    .frame(height: 4)
                    .animation(.spring(response: 0.3), value: currentPage)
            }
        }
    }
}
