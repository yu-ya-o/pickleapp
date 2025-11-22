import SwiftUI

struct OnboardingRegionView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var searchText = ""

    let prefectures = Prefectures.all

    var filteredPrefectures: [String] {
        if searchText.isEmpty {
            return prefectures
        } else {
            return prefectures.filter { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }

    var body: some View {
        VStack(spacing: Spacing.lg) {
            // Header
            VStack(spacing: Spacing.md) {
                Image(systemName: "mappin.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .foregroundColor(.twitterBlue)

                Text("地域を選択してください")
                    .font(.displaySmall)
                    .fontWeight(.bold)

                Text("お住まいの都道府県")
                    .font(.bodyLarge)
                    .foregroundColor(.secondary)
            }
            .padding(.top, Spacing.xl)

            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                TextField("検索", text: $searchText)
                    .font(.bodyMedium)
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.medium)
                    .fill(Color.twitterGray)
            )
            .padding(.horizontal, Spacing.xl)

            // List
            ScrollView {
                LazyVStack(spacing: Spacing.sm) {
                    ForEach(filteredPrefectures, id: \.self) { prefecture in
                        Button(action: {
                            viewModel.selectedRegion = prefecture
                        }) {
                            HStack {
                                Text(prefecture)
                                    .font(.bodyLarge)
                                    .foregroundColor(.primary)
                                Spacer()
                                if viewModel.selectedRegion == prefecture {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.twitterBlue)
                                }
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.medium)
                                    .fill(viewModel.selectedRegion == prefecture ? Color.twitterBlue.opacity(0.1) : Color.white)
                            )
                        }
                    }
                }
                .padding(.horizontal, Spacing.xl)
            }
        }
    }
}
