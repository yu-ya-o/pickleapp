import SwiftUI

struct OnboardingRegionView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var searchText = ""

    let prefectures = [
        "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
        "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
        "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
        "岐阜県", "静岡県", "愛知県", "三重県",
        "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
        "鳥取県", "島根県", "岡山県", "広島県", "山口県",
        "徳島県", "香川県", "愛媛県", "高知県",
        "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
    ]

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
