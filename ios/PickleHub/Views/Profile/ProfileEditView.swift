import SwiftUI

struct ProfileEditView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = ProfileEditViewModel()

    @State private var nickname: String
    @State private var selectedRegion: String
    @State private var selectedExperience: String
    @State private var selectedGender: String
    @State private var selectedSkillLevel: String

    let regions = Prefectures.all
    let experiences = ["6ヶ月未満", "6ヶ月〜1年", "1〜2年", "2〜3年", "3年以上"]
    let genders = ["男性", "女性", "その他", "回答しない"]
    let skillLevels = ["初心者", "中級者", "上級者"]

    init(user: User) {
        _nickname = State(initialValue: user.nickname ?? "")
        _selectedRegion = State(initialValue: user.region ?? "")
        _selectedExperience = State(initialValue: user.pickleballExperience ?? "")
        _selectedGender = State(initialValue: user.gender ?? "")
        _selectedSkillLevel = State(initialValue: user.skillLevel ?? "")
    }

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("基本情報")) {
                    TextField("ニックネーム", text: $nickname)
                        .textContentType(.name)

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
            await viewModel.updateProfile(
                nickname: nickname,
                region: selectedRegion,
                pickleballExperience: selectedExperience,
                gender: selectedGender,
                skillLevel: selectedSkillLevel
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

    func updateProfile(nickname: String, region: String, pickleballExperience: String, gender: String, skillLevel: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let request = UpdateProfileRequest(
                nickname: nickname,
                region: region,
                pickleballExperience: pickleballExperience,
                gender: gender,
                skillLevel: skillLevel
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
