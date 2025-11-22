import SwiftUI
import PhotosUI

struct CreateTeamView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var teamsViewModel: TeamsViewModel

    @State private var name = ""
    @State private var description = ""
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

                Section(header: Text("Team Information")) {
                    TextField("Team Name", text: $name)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section(header: Text("Visibility")) {
                    Picker("Who can find this team?", selection: $visibility) {
                        HStack {
                            Image(systemName: "globe")
                            Text("Public")
                        }.tag("public")

                        HStack {
                            Image(systemName: "lock.fill")
                            Text("Private")
                        }.tag("private")
                    }
                    .pickerStyle(.segmented)

                    if visibility == "public" {
                        Text("Anyone can find and request to join this team")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Only accessible via invite link. Not visible in search.")
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
                                Text("Create Team")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("Create Team")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: $showingError) {
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
