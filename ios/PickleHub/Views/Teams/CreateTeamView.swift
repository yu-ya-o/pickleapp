import SwiftUI
import PhotosUI

struct CreateTeamView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var teamsViewModel: TeamsViewModel

    @State private var name = ""
    @State private var description = ""
    @State private var region = ""
    @State private var visibility = "public"
    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImageData: Data?

    let visibilityOptions = ["public", "private"]

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("チームアイコン")) {
                    VStack(spacing: 12) {
                        // Display selected or default icon
                        if let selectedImageData, let uiImage = UIImage(data: selectedImageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } else {
                            Image(systemName: "person.3.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 60, height: 60)
                                .foregroundColor(.gray)
                                .frame(width: 100, height: 100)
                                .background(Color(.systemGray6))
                                .clipShape(Circle())
                        }

                        PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                            Label("画像を選択", systemImage: "photo")
                        }
                    }
                    .frame(maxWidth: .infinity)
                }

                Section(header: Text("チーム情報")) {
                    TextField("チーム名", text: $name)
                    TextField("説明", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section(header: Text("地域")) {
                    Picker("都道府県を選択", selection: $region) {
                        Text("選択してください").tag("")
                        ForEach(Prefectures.all, id: \.self) { prefecture in
                            Text(prefecture).tag(prefecture)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section(header: Text("公開設定")) {
                    Picker("誰がこのチームを見つけられますか？", selection: $visibility) {
                        HStack {
                            Image(systemName: "globe")
                            Text("公開")
                        }.tag("public")

                        HStack {
                            Image(systemName: "lock.fill")
                            Text("非公開")
                        }.tag("private")
                    }
                    .pickerStyle(.segmented)

                    if visibility == "public" {
                        Text("誰でもこのチームを見つけて参加リクエストできます")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Text("招待リンク経由でのみアクセス可能。検索には表示されません。")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section {
                    Button(action: createTeam) {
                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            HStack {
                                Spacer()
                                Text("チームを作成")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("チーム作成")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
            }
            .alert("エラー", isPresented: $showingError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
            .onChange(of: selectedPhotoItem) { _, newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self) {
                        selectedImageData = data
                    }
                }
            }
        }
    }

    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func createTeam() {
        Task {
            isLoading = true

            do {
                // Upload icon image if selected
                var iconImageURL: String? = nil
                if let imageData = selectedImageData {
                    iconImageURL = try await APIClient.shared.uploadProfileImage(imageData: imageData)
                }

                try await teamsViewModel.createTeam(
                    name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.trimmingCharacters(in: .whitespacesAndNewlines),
                    region: region.isEmpty ? nil : region,
                    visibility: visibility,
                    iconImage: iconImageURL
                )
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
                isLoading = false
            }
        }
    }
}

#Preview {
    CreateTeamView()
        .environmentObject(TeamsViewModel())
}
