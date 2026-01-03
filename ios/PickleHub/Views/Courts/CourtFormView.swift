import SwiftUI
import PhotosUI

struct CourtFormView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = CourtFormViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.lg) {
                    // Image Selection
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        Text("コート画像（必須）")
                            .font(.headlineSmall)
                            .foregroundColor(.primary)

                        if let imageData = viewModel.selectedImageData,
                           let uiImage = UIImage(data: imageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 200)
                                .clipped()
                                .cornerRadius(CornerRadius.medium)
                        } else {
                            Rectangle()
                                .fill(Color(.systemGray6))
                                .frame(height: 200)
                                .cornerRadius(CornerRadius.medium)
                                .overlay(
                                    VStack(spacing: Spacing.sm) {
                                        Image(systemName: "photo")
                                            .font(.system(size: 40))
                                            .foregroundColor(.gray)
                                        Text("画像を選択")
                                            .font(.bodyMedium)
                                            .foregroundColor(.gray)
                                    }
                                )
                        }

                        Button(action: { viewModel.showingImagePicker = true }) {
                            Text(viewModel.selectedImageData == nil ? "画像を選択" : "画像を変更")
                                .font(.bodyMedium)
                                .foregroundColor(.twitterBlue)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Spacing.sm)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.medium)
                                        .stroke(Color.twitterBlue, lineWidth: 1)
                                )
                        }
                    }
                    .padding(.horizontal)

                    Divider()

                    // Basic Information
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text("基本情報")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        FormField(title: "コート名（必須）", text: $viewModel.name)

                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("説明（必須）")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                            TextEditor(text: $viewModel.description)
                                .frame(height: 100)
                                .padding(Spacing.sm)
                                .background(Color(.systemGray6))
                                .cornerRadius(CornerRadius.small)
                        }

                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("都道府県（必須）")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                            Picker("都道府県", selection: $viewModel.region) {
                                Text("選択してください").tag("")
                                ForEach(Prefectures.all, id: \.self) { prefecture in
                                    Text(prefecture).tag(prefecture)
                                }
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Spacing.sm)
                            .padding(.horizontal, Spacing.sm)
                            .background(Color(.systemGray6))
                            .cornerRadius(CornerRadius.small)
                        }

                        FormField(title: "住所（必須）", text: $viewModel.address)
                    }
                    .padding(.horizontal)

                    Divider()

                    // Location
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text("位置情報")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        FormField(title: "緯度", text: $viewModel.latitude, keyboardType: .decimalPad)
                        FormField(title: "経度", text: $viewModel.longitude, keyboardType: .decimalPad)
                    }
                    .padding(.horizontal)

                    Divider()

                    // Contact Information
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text("連絡先")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        FormField(title: "電話番号", text: $viewModel.phoneNumber, keyboardType: .phonePad)
                        FormField(title: "メールアドレス", text: $viewModel.email, keyboardType: .emailAddress)
                        FormField(title: "ウェブサイトURL", text: $viewModel.websiteUrl, keyboardType: .URL)
                    }
                    .padding(.horizontal)

                    Divider()

                    // Court Details
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text("コート詳細")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        FormField(title: "コート数", text: $viewModel.courtsCount, keyboardType: .numberPad)

                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("屋内/屋外")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                            Picker("屋内/屋外", selection: $viewModel.indoorOutdoor) {
                                Text("選択してください").tag("")
                                Text("屋内").tag("indoor")
                                Text("屋外").tag("outdoor")
                                Text("両方").tag("both")
                            }
                            .pickerStyle(.segmented)
                        }

                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("サーフェス")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                            Picker("サーフェス", selection: $viewModel.surface) {
                                Text("選択してください").tag("")
                                Text("ハードコート").tag("hard")
                                Text("クレイコート").tag("clay")
                                Text("人工芝").tag("artificial_turf")
                                Text("その他").tag("other")
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Spacing.sm)
                            .padding(.horizontal, Spacing.sm)
                            .background(Color(.systemGray6))
                            .cornerRadius(CornerRadius.small)
                        }

                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            Text("設備")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)

                            ForEach(["parking", "restroom", "shower", "locker", "vending_machine", "pro_shop", "lighting"], id: \.self) { amenity in
                                Toggle(amenityDisplayName(amenity), isOn: Binding(
                                    get: { viewModel.selectedAmenities.contains(amenity) },
                                    set: { isOn in
                                        if isOn {
                                            viewModel.selectedAmenities.insert(amenity)
                                        } else {
                                            viewModel.selectedAmenities.remove(amenity)
                                        }
                                    }
                                ))
                            }
                        }
                    }
                    .padding(.horizontal)

                    Divider()

                    // Additional Information
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text("追加情報")
                            .font(.headlineMedium)
                            .foregroundColor(.primary)

                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("営業時間")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                            TextEditor(text: $viewModel.operatingHours)
                                .frame(height: 80)
                                .padding(Spacing.sm)
                                .background(Color(.systemGray6))
                                .cornerRadius(CornerRadius.small)
                        }

                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("料金情報")
                                .font(.bodyMedium)
                                .foregroundColor(.secondary)
                            TextEditor(text: $viewModel.priceInfo)
                                .frame(height: 80)
                                .padding(Spacing.sm)
                                .background(Color(.systemGray6))
                                .cornerRadius(CornerRadius.small)
                        }
                    }
                    .padding(.horizontal)

                    // Submit Button
                    Button(action: {
                        Task {
                            await viewModel.submitCourt()
                        }
                    }) {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("コートを登録")
                                .font(.headlineMedium)
                        }
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(viewModel.isLoading || !viewModel.isFormValid)
                    .padding(.horizontal)
                    .padding(.vertical, Spacing.md)
                }
            }
            .navigationTitle("コート登録")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
            }
            .alert("エラー", isPresented: Binding(
                get: { viewModel.errorMessage != nil },
                set: { if !$0 { viewModel.errorMessage = nil } }
            )) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                }
            }
            .alert("成功", isPresented: $viewModel.showSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("コートが登録されました")
            }
            .sheet(isPresented: $viewModel.showingImagePicker) {
                ImagePicker(selectedImageData: $viewModel.selectedImageData)
            }
        }
    }

    private func amenityDisplayName(_ amenity: String) -> String {
        switch amenity {
        case "parking": return "駐車場"
        case "restroom": return "トイレ"
        case "shower": return "シャワー"
        case "locker": return "ロッカー"
        case "vending_machine": return "自動販売機"
        case "pro_shop": return "プロショップ"
        case "lighting": return "照明"
        default: return amenity
        }
    }
}

// MARK: - Form Field Component
struct FormField: View {
    let title: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(title)
                .font(.bodyMedium)
                .foregroundColor(.secondary)
            TextField(title, text: $text)
                .keyboardType(keyboardType)
                .padding(Spacing.sm)
                .background(Color(.systemGray6))
                .cornerRadius(CornerRadius.small)
        }
    }
}

// MARK: - ViewModel
@MainActor
class CourtFormViewModel: ObservableObject {
    @Published var selectedImageData: Data?
    @Published var showingImagePicker = false
    @Published var name = ""
    @Published var description = ""
    @Published var region = ""
    @Published var address = ""
    @Published var latitude = ""
    @Published var longitude = ""
    @Published var phoneNumber = ""
    @Published var email = ""
    @Published var websiteUrl = ""
    @Published var courtsCount = ""
    @Published var indoorOutdoor = ""
    @Published var surface = ""
    @Published var selectedAmenities: Set<String> = []
    @Published var operatingHours = ""
    @Published var priceInfo = ""

    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showSuccessAlert = false

    private let apiClient = APIClient.shared

    var isFormValid: Bool {
        !name.isEmpty &&
        !description.isEmpty &&
        !region.isEmpty &&
        !address.isEmpty &&
        selectedImageData != nil
    }

    func submitCourt() async {
        isLoading = true
        errorMessage = nil

        do {
            // 1. Upload image
            guard let imageData = selectedImageData else {
                throw NSError(domain: "CourtFormViewModel", code: -1, userInfo: [NSLocalizedDescriptionKey: "画像を選択してください"])
            }

            print("📤 Uploading court image...")
            let imageUrl = try await uploadImage(imageData: imageData)
            print("✅ Image uploaded: \(imageUrl)")

            // 2. Create court
            let request = CreateCourtRequest(
                name: name,
                description: description,
                imageUrl: imageUrl,
                region: region,
                address: address,
                latitude: latitude.isEmpty ? nil : Double(latitude),
                longitude: longitude.isEmpty ? nil : Double(longitude),
                phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
                websiteUrl: websiteUrl.isEmpty ? nil : websiteUrl,
                email: email.isEmpty ? nil : email,
                courtsCount: courtsCount.isEmpty ? nil : Int(courtsCount),
                indoorOutdoor: indoorOutdoor.isEmpty ? nil : indoorOutdoor,
                surface: surface.isEmpty ? nil : surface,
                amenities: Array(selectedAmenities),
                operatingHours: operatingHours.isEmpty ? nil : operatingHours,
                priceInfo: priceInfo.isEmpty ? nil : priceInfo
            )

            print("📝 Creating court...")
            _ = try await apiClient.createCourt(request: request)
            print("✅ Court created successfully")

            isLoading = false
            showSuccessAlert = true
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Court creation error: \(error)")
        }
    }

    private func uploadImage(imageData: Data) async throws -> String {
        guard let url = URL(string: "\(Config.apiBaseURL)/api/upload/image") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        // Get auth token
        guard let token = UserDefaults.standard.string(forKey: "authToken") else {
            throw APIError.unauthorized
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add image data
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"court.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
        }

        struct UploadResponse: Codable {
            let url: String
            let publicId: String
        }

        let uploadResponse = try JSONDecoder().decode(UploadResponse.self, from: data)
        return uploadResponse.url
    }
}

#Preview {
    CourtFormView()
}
