import SwiftUI

struct CourtsListView: View {
    @StateObject private var viewModel = CourtsViewModel()
    @State private var searchText = ""
    @State private var selectedRegion = "全国"

    // 都道府県リスト
    private let regions = [
        "全国", "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
        "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
        "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
        "岐阜県", "静岡県", "愛知県", "三重県",
        "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
        "鳥取県", "島根県", "岡山県", "広島県", "山口県",
        "徳島県", "香川県", "愛媛県", "高知県",
        "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
    ]

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("コート検索")
                    .font(.system(size: 28, weight: .black, design: .default))
                    .italic()
                    .kerning(-0.5)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                // 検索バー
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField("コート名、住所で検索", text: $searchText)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .onChange(of: searchText) { newValue in
                            viewModel.searchText = newValue
                            Task {
                                await viewModel.fetchCourts()
                            }
                        }
                    if !searchText.isEmpty {
                        Button(action: {
                            searchText = ""
                            viewModel.searchText = ""
                            Task {
                                await viewModel.fetchCourts()
                            }
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding(10)
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding(.horizontal)
                .padding(.vertical, 8)

                // 都道府県フィルター
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(regions.prefix(11), id: \.self) { region in
                            Button(action: {
                                selectedRegion = region
                                viewModel.selectedRegion = region
                                Task {
                                    await viewModel.fetchCourts()
                                }
                            }) {
                                Text(region)
                                    .font(.system(size: 14, weight: .medium))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(selectedRegion == region ? Color.blue : Color(.systemGray6))
                                    .foregroundColor(selectedRegion == region ? .white : .primary)
                                    .cornerRadius(20)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 8)

                Divider()

                // コート一覧
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if let errorMessage = viewModel.errorMessage {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        Text(errorMessage)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                        Button("再試行") {
                            Task {
                                await viewModel.fetchCourts()
                            }
                        }
                        .buttonStyle(.bordered)
                    }
                    .padding()
                    Spacer()
                } else if viewModel.courts.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "mappin.slash")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        Text("コートが見つかりませんでした")
                            .foregroundColor(.gray)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.courts) { court in
                                NavigationLink(destination: CourtDetailView(courtId: court.id)) {
                                    CourtRowView(court: court)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding()
                    }
                    .refreshable {
                        await viewModel.refreshCourts()
                    }
                }
            }
            .navigationBarHidden(true)
        }
        .task {
            await viewModel.fetchCourts()
        }
    }
}

// MARK: - Court Row View

struct CourtRowView: View {
    let court: Court

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 画像
            CachedAsyncImage(url: URL(string: court.imageUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(height: 200)
                    .clipped()
                    .cornerRadius(12)
            } placeholder: {
                Rectangle()
                    .fill(Color(.systemGray5))
                    .frame(height: 200)
                    .cornerRadius(12)
                    .overlay(
                        ProgressView()
                    )
            }

            // 情報
            VStack(alignment: .leading, spacing: 8) {
                Text(court.name)
                    .font(.headline)
                    .foregroundColor(.primary)

                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                    Text(court.region)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }

                if let indoorOutdoor = court.indoorOutdoor, let courtsCount = court.courtsCount {
                    HStack(spacing: 12) {
                        Label(court.indoorOutdoorDisplayText, systemImage: "building.2.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Label("\(courtsCount)面", systemImage: "sportscourt.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                if !court.amenities.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            ForEach(court.amenitiesDisplayText.prefix(3), id: \.self) { amenity in
                                Text(amenity)
                                    .font(.caption2)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 4)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 2)
    }
}

#Preview {
    CourtsListView()
}
