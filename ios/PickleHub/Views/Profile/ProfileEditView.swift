import SwiftUI
import PhotosUI

struct ProfileEditView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = ProfileEditViewModel()

    @State private var nickname: String
    @State private var bio: String
    @State private var selectedRegion: String
    @State private var selectedExperience: String
    @State private var selectedGender: String
    @State private var selectedAgeGroup: String
    @State private var selectedSkillLevel: String
    @State private var duprDoublesText: String
    @State private var duprSinglesText: String
    @State private var myPaddle: String
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImageData: Data?
    @State private var profileImageURL: String?
    @State private var instagramUrl: String
    @State private var twitterUrl: String
    @State private var tiktokUrl: String
    @State private var lineUrl: String

    let regions = Prefectures.all
    let experiences = ["6ヶ月未満", "6ヶ月〜1年", "1〜2年", "2〜3年", "3年以上"]
    let genders = ["男性", "女性", "回答しない"]
    let ageGroups = ["10代", "20代", "30代", "40代", "50代", "60代", "70代", "80代", "90代"]
    let skillLevels = ["初心者", "中級者", "上級者"]

    init(user: User) {
        _nickname = State(initialValue: user.nickname ?? "")
        _bio = State(initialValue: user.bio ?? "")
        _selectedRegion = State(initialValue: user.region ?? "")
        _selectedExperience = State(initialValue: user.pickleballExperience ?? "")
        _selectedGender = State(initialValue: user.gender ?? "")
        _selectedAgeGroup = State(initialValue: user.ageGroup ?? "")
        _selectedSkillLevel = State(initialValue: user.skillLevel ?? "")
        _duprDoublesText = State(initialValue: user.duprDoubles != nil ? String(format: "%.3f", user.duprDoubles!) : "")
        _duprSinglesText = State(initialValue: user.duprSingles != nil ? String(format: "%.3f", user.duprSingles!) : "")
        _myPaddle = State(initialValue: user.myPaddle ?? "")
        _profileImageURL = State(initialValue: user.profileImage)
        _instagramUrl = State(initialValue: user.instagramUrl ?? "")
        _twitterUrl = State(initialValue: user.twitterUrl ?? "")
        _tiktokUrl = State(initialValue: user.tiktokUrl ?? "")
        _lineUrl = State(initialValue: user.lineUrl ?? "")
    }

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("プロフィール画像")) {
                    VStack(spacing: 12) {
                        if let selectedImageData, let uiImage = UIImage(data: selectedImageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } else if let profileImageURL, let url = URL(string: profileImageURL) {
                            CachedAsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .scaledToFill()
                            } placeholder: {
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .foregroundColor(.gray)
                            }
                            .frame(width: 100, height: 100)
                            .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .foregroundColor(.gray)
                                .frame(width: 100, height: 100)
                        }

                        PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                            Label("画像を選択", systemImage: "photo")
                        }
                        .onChange(of: selectedPhotoItem) { newItem in
                            Task {
                                if let data = try? await newItem?.loadTransferable(type: Data.self) {
                                    selectedImageData = data
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .center)
                }

                Section(header: Text("基本情報")) {
                    TextField("ニックネーム", text: $nickname)
                        .textContentType(.name)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("自己紹介")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        TextEditor(text: $bio)
                            .frame(height: 80)
                            .onChange(of: bio) { newValue in
                                if newValue.count > 200 {
                                    bio = String(newValue.prefix(200))
                                }
                            }

                        Text("\(bio.count)/200")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                    }

                    Picker("地域", selection: $selectedRegion) {
                        Text("選択してください").tag("")
                        ForEach(regions, id: \.self) { region in
                            Text(region).tag(region)
                        }
                    }
                }

                Section(header: Text("ピックルボールについて")) {
                    Picker("ピックルボール歴", selection: $selectedExperience) {
                        Text("選択してください").tag("")
                        ForEach(experiences, id: \.self) { experience in
                            Text(experience).tag(experience)
                        }
                    }

                    Picker("レベル", selection: $selectedSkillLevel) {
                        Text("選択してください").tag("")
                        ForEach(skillLevels, id: \.self) { level in
                            Text(level).tag(level)
                        }
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("DUPR ダブルス")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        TextField("例: 4.500", text: $duprDoublesText)
                            .keyboardType(.decimalPad)
                            .onChange(of: duprDoublesText) { _, newValue in
                                duprDoublesText = formatDUPRInput(newValue)
                            }

                        Text("小数点以下3桁まで入力可能（任意）")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("DUPR シングルス")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        TextField("例: 4.500", text: $duprSinglesText)
                            .keyboardType(.decimalPad)
                            .onChange(of: duprSinglesText) { _, newValue in
                                duprSinglesText = formatDUPRInput(newValue)
                            }

                        Text("小数点以下3桁まで入力可能（任意）")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("使用パドル")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        TextField("例: JOOLA Ben Johns Hyperion", text: $myPaddle)
                            .onChange(of: myPaddle) { _, newValue in
                                if newValue.count > 100 {
                                    myPaddle = String(newValue.prefix(100))
                                }
                            }

                        Text("任意")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }

                Section(header: Text("その他")) {
                    Picker("性別", selection: $selectedGender) {
                        Text("選択してください").tag("")
                        ForEach(genders, id: \.self) { gender in
                            Text(gender).tag(gender)
                        }
                    }

                    Picker("年代", selection: $selectedAgeGroup) {
                        Text("選択してください").tag("")
                        ForEach(ageGroups, id: \.self) { ageGroup in
                            Text(ageGroup).tag(ageGroup)
                        }
                    }
                }

                Section {
                    SNSLinksEditor(
                        instagramUrl: $instagramUrl,
                        twitterUrl: $twitterUrl,
                        tiktokUrl: $tiktokUrl,
                        lineUrl: $lineUrl
                    )
                }

                if let errorMessage = viewModel.errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("プロフィール編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: saveProfile) {
                        if viewModel.isLoading {
                            ProgressView()
                        } else {
                            Text("保存")
                                .bold()
                        }
                    }
                    .disabled(!isFormValid || viewModel.isLoading)
                }
            }
        }
    }

    private var isFormValid: Bool {
        !nickname.isEmpty &&
        !selectedRegion.isEmpty &&
        !selectedExperience.isEmpty &&
        !selectedGender.isEmpty &&
        !selectedAgeGroup.isEmpty &&
        !selectedSkillLevel.isEmpty
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

    private func saveProfile() {
        Task {
            // Start loading indicator
            viewModel.isLoading = true

            // Upload image first if selected
            var newImageURL: String? = nil
            if let imageData = selectedImageData {
                print("📷 Uploading new profile image...")
                newImageURL = await viewModel.uploadProfileImage(imageData: imageData)
                if let url = newImageURL {
                    print("✅ Profile image uploaded: \(url)")
                } else {
                    print("⚠️ Failed to upload image, continuing with profile update")
                }
            }

            // Convert DUPR text to Double if valid
            let duprDoubles = duprDoublesText.isEmpty ? nil : Double(duprDoublesText)
            let duprSingles = duprSinglesText.isEmpty ? nil : Double(duprSinglesText)

            await viewModel.updateProfile(
                nickname: nickname,
                bio: bio.isEmpty ? nil : bio,
                region: selectedRegion,
                pickleballExperience: selectedExperience,
                gender: selectedGender,
                ageGroup: selectedAgeGroup,
                skillLevel: selectedSkillLevel,
                duprDoubles: duprDoubles,
                duprSingles: duprSingles,
                myPaddle: myPaddle.isEmpty ? nil : myPaddle,
                profileImage: newImageURL,
                instagramUrl: instagramUrl.isEmpty ? nil : instagramUrl,
                twitterUrl: twitterUrl.isEmpty ? nil : twitterUrl,
                tiktokUrl: tiktokUrl.isEmpty ? nil : tiktokUrl,
                lineUrl: lineUrl.isEmpty ? nil : lineUrl
            )

            if viewModel.errorMessage == nil {
                // Profile saved successfully, refresh auth state
                if let updatedUser = viewModel.updatedUser {
                    authViewModel.currentUser = updatedUser
                    if let userData = try? JSONEncoder().encode(updatedUser) {
                        UserDefaults.standard.set(userData, forKey: "currentUser")
                    }
                }
                dismiss()
            }
        }
    }
}

@MainActor
class ProfileEditViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var updatedUser: User?

    private let apiClient = APIClient.shared

    func uploadProfileImage(imageData: Data) async -> String? {
        do {
            let imageURL = try await apiClient.uploadProfileImage(imageData: imageData)
            return imageURL
        } catch {
            errorMessage = "画像のアップロードに失敗しました"
            print("Image upload error: \(error)")
            return nil
        }
    }

    func updateProfile(nickname: String, bio: String?, region: String, pickleballExperience: String, gender: String, ageGroup: String, skillLevel: String, duprDoubles: Double?, duprSingles: Double?, myPaddle: String?, profileImage: String?, instagramUrl: String?, twitterUrl: String?, tiktokUrl: String?, lineUrl: String?) async {
        errorMessage = nil

        // Debug: print ageGroup being sent
        print("📝 ProfileEdit ageGroup: \(ageGroup)")

        do {
            let request = UpdateProfileRequest(
                nickname: nickname,
                bio: bio,
                region: region,
                pickleballExperience: pickleballExperience,
                gender: gender,
                ageGroup: ageGroup,
                skillLevel: skillLevel,
                duprDoubles: duprDoubles,
                duprSingles: duprSingles,
                myPaddle: myPaddle,
                profileImage: profileImage,
                instagramUrl: instagramUrl,
                twitterUrl: twitterUrl,
                tiktokUrl: tiktokUrl,
                lineUrl: lineUrl
            )

            // Debug: print request JSON
            if let jsonData = try? JSONEncoder().encode(request),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                print("📝 ProfileEdit Request JSON: \(jsonString)")
            }

            let user = try await apiClient.updateProfile(request: request)
            print("✅ ProfileEdit updated successfully, ageGroup: \(user.ageGroup ?? "nil")")
            updatedUser = user
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Profile update error: \(error)")
        }
    }
}
