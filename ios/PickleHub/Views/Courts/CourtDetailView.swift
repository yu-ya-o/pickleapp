import SwiftUI
import MapKit

struct CourtDetailView: View {
    let courtId: String
    @StateObject private var viewModel: CourtDetailViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var selectedImageIndex = 0

    init(courtId: String) {
        self.courtId = courtId
        _viewModel = StateObject(wrappedValue: CourtDetailViewModel(courtId: courtId))
    }

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                VStack {
                    Spacer()
                    ProgressView()
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.top, 100)
            } else if let errorMessage = viewModel.errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    Text(errorMessage)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                    Button("再試行") {
                        Task {
                            await viewModel.fetchCourtDetails()
                        }
                    }
                    .buttonStyle(.bordered)
                }
                .padding()
                .frame(maxWidth: .infinity)
                .padding(.top, 100)
            } else if let court = viewModel.court {
                VStack(alignment: .leading, spacing: 0) {
                    // 画像ギャラリー
                    TabView(selection: $selectedImageIndex) {
                        CachedAsyncImage(url: URL(string: court.imageUrl)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 300)
                                .clipped()
                        } placeholder: {
                            Rectangle()
                                .fill(Color(.systemGray5))
                                .frame(height: 300)
                                .overlay(ProgressView())
                        }
                        .tag(0)

                        ForEach(Array(court.imageUrls.enumerated()), id: \.offset) { index, imageUrl in
                            CachedAsyncImage(url: URL(string: imageUrl)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 300)
                                    .clipped()
                            } placeholder: {
                                Rectangle()
                                    .fill(Color(.systemGray5))
                                    .frame(height: 300)
                                    .overlay(ProgressView())
                            }
                            .tag(index + 1)
                        }
                    }
                    .frame(height: 300)
                    .tabViewStyle(PageTabViewStyle())

                    VStack(alignment: .leading, spacing: 20) {
                        // コート名
                        Text(court.name)
                            .font(.title)
                            .fontWeight(.bold)

                        // 説明文
                        Text(court.description)
                            .font(.body)
                            .foregroundColor(.secondary)

                        Divider()

                        // 基本情報
                        VStack(alignment: .leading, spacing: 12) {
                            Text("基本情報")
                                .font(.headline)

                            InfoRow(icon: "mappin.circle.fill", label: "住所", value: court.address)

                            if let phoneNumber = court.phoneNumber {
                                Button(action: {
                                    if let url = URL(string: "tel://\(phoneNumber.replacingOccurrences(of: "-", with: ""))") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    InfoRow(icon: "phone.fill", label: "電話", value: phoneNumber)
                                }
                            }

                            if let websiteUrl = court.websiteUrl {
                                Button(action: {
                                    if let url = URL(string: websiteUrl) {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    HStack {
                                        Image(systemName: "safari.fill")
                                            .foregroundColor(.blue)
                                            .frame(width: 24)
                                        Text("公式サイトで詳細を見る")
                                            .foregroundColor(.blue)
                                        Spacer()
                                        Image(systemName: "arrow.up.right")
                                            .font(.caption)
                                            .foregroundColor(.blue)
                                    }
                                    .padding()
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(10)
                                }
                            }

                            if let courtsCount = court.courtsCount {
                                InfoRow(icon: "sportscourt.fill", label: "コート数", value: "\(courtsCount)面")
                            }

                            if let indoorOutdoor = court.indoorOutdoor {
                                InfoRow(icon: "building.2.fill", label: "種別", value: court.indoorOutdoorDisplayText)
                            }

                            if let surface = court.surface {
                                InfoRow(icon: "rectangle.fill", label: "床材", value: surface)
                            }

                            if !court.amenities.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                            .frame(width: 24)
                                        Text("設備")
                                            .font(.subheadline)
                                            .foregroundColor(.secondary)
                                    }
                                    FlowLayout(spacing: 8) {
                                        ForEach(court.amenitiesDisplayText, id: \.self) { amenity in
                                            Text(amenity)
                                                .font(.caption)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 6)
                                                .background(Color.green.opacity(0.1))
                                                .foregroundColor(.green)
                                                .cornerRadius(12)
                                        }
                                    }
                                }
                            }

                            if let operatingHours = court.operatingHours {
                                InfoRow(icon: "clock.fill", label: "営業時間", value: operatingHours)
                            }

                            if let priceInfo = court.priceInfo {
                                InfoRow(icon: "yensign.circle.fill", label: "料金", value: priceInfo)
                            }
                        }

                        Divider()

                        // 地図
                        if let latitude = court.latitude, let longitude = court.longitude {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("アクセス")
                                    .font(.headline)

                                GoogleMapView(
                                    latitude: latitude,
                                    longitude: longitude,
                                    markerTitle: court.name
                                )
                                .frame(height: 200)
                                .cornerRadius(12)
                            }

                            Divider()
                        }

                        // このコートで開催されるイベント
                        if !viewModel.events.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("このコートで開催されるイベント")
                                    .font(.headline)

                                ForEach(viewModel.events.prefix(5)) { event in
                                    NavigationLink(destination: EventDetailContainerView(eventId: event.id)) {
                                        ModernEventRowView(event: event)
                                    }
                                }

                                if viewModel.events.count > 5 {
                                    Text("他 \(viewModel.events.count - 5)件のイベント")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .padding(.top, 8)
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.fetchCourtDetails()
        }
        .refreshable {
            await viewModel.refresh()
        }
    }
}

// MARK: - Info Row

struct InfoRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.body)
            }
            Spacer()
        }
    }
}

// MARK: - Flow Layout (for amenities tags)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }

    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)

                if x + size.width > maxWidth && x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }

                positions.append(CGPoint(x: x, y: y))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }

            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}

#Preview {
    NavigationView {
        CourtDetailView(courtId: "test-id")
    }
}
