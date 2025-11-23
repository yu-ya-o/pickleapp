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
    @State private var selectedSkillLevel: String
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImageData: Data?
    @State private var profileImageURL: String?

    let regions = Prefectures.all
    let experiences = ["6ヶ月未満", "6ヶ月〜1年", "1〜2年", "2〜3年", "3年以上"]
    let genders = ["男性", "女性", "その他", "回答しない"]
    let skillLevels = ["初心者", "中級者", "上級者"]

    init(user: User) {
        _nickname = State(initialValue: user.nickname ?? "")
        _bio = State(initialValue: user.bio ?? "")
        _selectedRegion = State(initialValue: user.region ?? "")
        _selectedExperience = State(initialValue: user.pickleballExperience ?? "")
        _selectedGender = State(initialValue: user.gender ?? "")
        _selectedSkillLevel = State(initialValue: user.skillLevel ?? "")
        _profileImageURL = State(initialValue: user.profileImage)
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
                            AsyncImage(url: url) { image in
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
                }

                Section(header: Text("その他")) {
                    Picker("性別", selection: $selectedGender) {
                        Text("選択してください").tag("")
                        ForEach(genders, id: \.self) { gender in
                            Text(gender).tag(gender)
                        }
                    }
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
        !selectedSkillLevel.isEmpty
    }

    private func saveProfile() {
        Task {
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

            await viewModel.updateProfile(
                nickname: nickname,
                bio: bio.isEmpty ? nil : bio,
                region: selectedRegion,
                pickleballExperience: selectedExperience,
                gender: selectedGender,
                skillLevel: selectedSkillLevel,
                profileImage: newImageURL
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

    func updateProfile(nickname: String, bio: String?, region: String, pickleballExperience: String, gender: String, skillLevel: String, profileImage: String?) async {
        isLoading = true
        errorMessage = nil

        do {
            let request = UpdateProfileRequest(
                nickname: nickname,
                bio: bio,
                region: region,
                pickleballExperience: pickleballExperience,
                gender: gender,
                skillLevel: skillLevel,
                profileImage: profileImage
            )

            let user = try await apiClient.updateProfile(request: request)
            updatedUser = user
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Profile update error: \(error)")
        }
    }
}
