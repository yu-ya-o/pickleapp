import SwiftUI
import PhotosUI

struct CreateTeamView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var teamsViewModel: TeamsViewModel

    @State private var name = ""
    @State private var description = ""
    @State private var region = ""
    @State private var visibility = "public"
    @State private var instagramUrl = ""
    @State private var twitterUrl = ""
    @State private var tiktokUrl = ""
    @State private var lineUrl = ""
    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var selectedIconPhotoItem: PhotosPickerItem?
    @State private var selectedIconImageData: Data?
    @State private var selectedHeaderPhotoItem: PhotosPickerItem?
    @State private var selectedHeaderImageData: Data?

    let visibilityOptions = ["public", "private"]

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("チームアイコン")) {
                    VStack(spacing: 8) {
                        if let selectedIconImageData, let uiImage = UIImage(data: selectedIconImageData) {
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

                        PhotosPicker(selection: $selectedIconPhotoItem, matching: .images) {
                            Label("アイコンを選択", systemImage: "photo")
                                .font(.caption)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }

                Section(header: Text("ヘッダー画像")) {
                    VStack(spacing: 8) {
                        if let selectedHeaderImageData, let uiImage = UIImage(data: selectedHeaderImageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(height: 150)
                                .clipped()
                                .cornerRadius(8)
                        } else {
                            Rectangle()
                                .fill(Color(.systemGray6))
                                .frame(height: 150)
                                .overlay(
                                    Image(systemName: "photo")
                                        .font(.largeTitle)
                                        .foregroundColor(.gray)
                                )
                                .cornerRadius(8)
                        }

                        PhotosPicker(selection: $selectedHeaderPhotoItem, matching: .images) {
                            Label("ヘッダー画像を選択", systemImage: "photo")
                                .font(.caption)
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

                Section {
                    SNSLinksEditor(
                        instagramUrl: $instagramUrl,
                        twitterUrl: $twitterUrl,
                        tiktokUrl: $tiktokUrl,
                        lineUrl: $lineUrl
                    )
                }

                // 暫定的にコメントアウト: 招待リンク機能の不具合により非公開設定を無効化
                /*
                Section(header: Text("公開設定")) {
                    Picker("誰がこのチームを見つけられますか？", selection: $visibility) {
                        Text("公開").tag("public")
                        Text("非公開").tag("private")
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
                */

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
                ToolbarItemGroup(placement: .navigationBarLeading) {
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
            .onChange(of: selectedIconPhotoItem) { newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self) {
                        selectedIconImageData = data
                    }
                }
            }
            .onChange(of: selectedHeaderPhotoItem) { newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self) {
                        selectedHeaderImageData = data
                    }
                }
            }
        }
    }

    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !region.isEmpty
    }

    private func createTeam() {
        Task {
            isLoading = true

            do {
                // Upload icon image if selected
                var iconImageURL: String? = nil
                if let imageData = selectedIconImageData {
                    iconImageURL = try await APIClient.shared.uploadProfileImage(imageData: imageData)
                }

                // Upload header image if selected
                var headerImageURL: String? = nil
                if let imageData = selectedHeaderImageData {
                    headerImageURL = try await APIClient.shared.uploadProfileImage(imageData: imageData)
                }

                try await teamsViewModel.createTeam(
                    name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.trimmingCharacters(in: .whitespacesAndNewlines),
                    region: region.isEmpty ? nil : region,
                    visibility: visibility,
                    iconImage: iconImageURL,
                    headerImage: headerImageURL,
                    instagramUrl: instagramUrl.isEmpty ? nil : instagramUrl,
                    twitterUrl: twitterUrl.isEmpty ? nil : twitterUrl,
                    tiktokUrl: tiktokUrl.isEmpty ? nil : tiktokUrl,
                    lineUrl: lineUrl.isEmpty ? nil : lineUrl
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
