import SwiftUI
import PhotosUI

struct EditTeamView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: TeamDetailViewModel

    @State private var name: String
    @State private var description: String
    @State private var region: String
    @State private var visibility: String
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImageData: Data?
    @State private var selectedHeaderPhotoItem: PhotosPickerItem?
    @State private var selectedHeaderImageData: Data?
    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var instagramUrl: String
    @State private var twitterUrl: String
    @State private var tiktokUrl: String
    @State private var lineUrl: String

    let visibilityOptions = ["public", "private"]

    init(viewModel: TeamDetailViewModel) {
        self.viewModel = viewModel
        _name = State(initialValue: viewModel.team?.name ?? "")
        _description = State(initialValue: viewModel.team?.description ?? "")
        _region = State(initialValue: viewModel.team?.region ?? "")
        _visibility = State(initialValue: viewModel.team?.visibility ?? "public")
        _instagramUrl = State(initialValue: viewModel.team?.instagramUrl ?? "")
        _twitterUrl = State(initialValue: viewModel.team?.twitterUrl ?? "")
        _tiktokUrl = State(initialValue: viewModel.team?.tiktokUrl ?? "")
        _lineUrl = State(initialValue: viewModel.team?.lineUrl ?? "")
    }

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("チームアイコン")) {
                    VStack(spacing: 12) {
                        // Display current, selected, or default icon
                        if let selectedImageData, let uiImage = UIImage(data: selectedImageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } else if let iconURL = viewModel.team?.iconImageURL {
                            CachedAsyncImagePhase(url: iconURL) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 100, height: 100)
                                        .clipShape(Circle())
                                case .failure(_), .empty:
                                    Image(systemName: "person.3.fill")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: 60, height: 60)
                                        .foregroundColor(.gray)
                                        .frame(width: 100, height: 100)
                                        .background(Color(.systemGray6))
                                        .clipShape(Circle())
                                @unknown default:
                                    EmptyView()
                                }
                            }
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
                            Label("画像を変更", systemImage: "photo")
                        }
                    }
                    .frame(maxWidth: .infinity)
                }

                Section(header: Text("ヘッダー画像")) {
                    VStack(spacing: 12) {
                        // Display current, selected, or default header image
                        if let selectedHeaderImageData, let uiImage = UIImage(data: selectedHeaderImageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(height: 150)
                                .frame(maxWidth: .infinity)
                                .clipped()
                                .cornerRadius(8)
                        } else if let headerURL = viewModel.team?.headerImageURL {
                            CachedAsyncImagePhase(url: headerURL) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                        .frame(height: 150)
                                        .frame(maxWidth: .infinity)
                                        .clipped()
                                        .cornerRadius(8)
                                case .failure(_), .empty:
                                    Rectangle()
                                        .fill(Color(.systemGray6))
                                        .frame(height: 150)
                                        .frame(maxWidth: .infinity)
                                        .cornerRadius(8)
                                        .overlay(
                                            Image(systemName: "photo")
                                                .font(.system(size: 40))
                                                .foregroundColor(.gray)
                                        )
                                @unknown default:
                                    EmptyView()
                                }
                            }
                        } else {
                            Rectangle()
                                .fill(Color(.systemGray6))
                                .frame(height: 150)
                                .frame(maxWidth: .infinity)
                                .cornerRadius(8)
                                .overlay(
                                    Image(systemName: "photo")
                                        .font(.system(size: 40))
                                        .foregroundColor(.gray)
                                )
                        }

                        PhotosPicker(selection: $selectedHeaderPhotoItem, matching: .images) {
                            Label("ヘッダー画像を変更", systemImage: "photo")
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
                    SNSLinksEditor(
                        instagramUrl: $instagramUrl,
                        twitterUrl: $twitterUrl,
                        tiktokUrl: $tiktokUrl,
                        lineUrl: $lineUrl
                    )
                }

                Section {
                    Button(action: updateTeam) {
                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            HStack {
                                Spacer()
                                Text("変更を保存")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("チームを編集")
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
            .onChange(of: selectedPhotoItem) { newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self) {
                        selectedImageData = data
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
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func updateTeam() {
        Task {
            isLoading = true

            do {
                // Upload new icon image if selected
                var iconImageURL: String? = viewModel.team?.iconImage
                if let imageData = selectedImageData {
                    iconImageURL = try await APIClient.shared.uploadProfileImage(imageData: imageData)
                }

                // Upload new header image if selected
                var headerImageURL: String? = viewModel.team?.headerImage
                if let headerImageData = selectedHeaderImageData {
                    headerImageURL = try await APIClient.shared.uploadProfileImage(imageData: headerImageData)
                }

                try await viewModel.updateTeam(
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
