import SwiftUI

struct CourtsListView: View {
    @StateObject private var viewModel = CourtsViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var searchText = ""
    @State private var selectedRegion = ""
    @State private var showingCourtForm = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 検索バー
                HStack(spacing: Spacing.sm) {
                    // 都道府県フィルター（左）
                    HStack {
                        Image(systemName: "mappin.circle")
                            .foregroundColor(.gray)
                            .font(.system(size: 14))
                        Picker("地域", selection: $selectedRegion) {
                            Text("全て").tag("")
                            ForEach(Prefectures.all, id: \.self) { prefecture in
                                Text(prefecture).tag(prefecture)
                            }
                        }
                        .pickerStyle(.menu)
                        .font(.bodyMedium)
                    }
                    .frame(height: 36)
                    .padding(.horizontal, Spacing.sm)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)

                    // フリーテキスト検索（右）
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                            .font(.system(size: 14))
                        TextField("コートを検索", text: $searchText)
                            .font(.bodyMedium)
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                                    .font(.system(size: 14))
                            }
                        }
                    }
                    .frame(height: 36)
                    .padding(.horizontal, Spacing.sm)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)
                }
                .padding(.horizontal, Spacing.md)
                .padding(.bottom, Spacing.sm)
                .background(Color.white)
                .onChange(of: searchText) { newValue in
                    viewModel.searchText = newValue
                    Task {
                        await viewModel.fetchCourts()
                    }
                }
                .onChange(of: selectedRegion) { newValue in
                    viewModel.selectedRegion = newValue == "" ? "全国" : newValue
                    Task {
                        await viewModel.fetchCourts()
                    }
                }

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
            .navigationTitle("コート")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if authViewModel.isAdmin {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: { showingCourtForm = true }) {
                            Image(systemName: "plus")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingCourtForm, onDismiss: {
                // Refresh courts list after form is dismissed
                Task {
                    await viewModel.fetchCourts()
                }
            }) {
                CourtFormView()
                    .environmentObject(authViewModel)
            }
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
