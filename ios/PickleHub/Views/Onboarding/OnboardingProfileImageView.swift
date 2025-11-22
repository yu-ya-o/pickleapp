import SwiftUI
import PhotosUI

struct OnboardingProfileImageView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var showingImagePicker = false

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            // Title
            Text("プロフィール画像を\n設定してください")
                .font(.displayMedium)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Text("他のユーザーに表示されます(スキップ可)")
                .font(.bodyLarge)
                .foregroundColor(.secondary)

            Spacer()

            // Image Picker
            VStack(spacing: Spacing.lg) {
                if let imageData = viewModel.selectedImageData,
                   let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 200, height: 200)
                        .clipShape(Circle())
                        .overlay(
                            Circle()
                                .stroke(Color.twitterBlue, lineWidth: 4)
                        )
                        .shadow(.medium)
                } else {
                    Circle()
                        .fill(Color.twitterGray)
                        .frame(width: 200, height: 200)
                        .overlay(
                            VStack(spacing: Spacing.sm) {
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(.gray)
                                Text("タップして選択")
                                    .font(.bodyMedium)
                                    .foregroundColor(.gray)
                            }
                        )
                }

                Button(action: { showingImagePicker = true }) {
                    Text(viewModel.selectedImageData == nil ? "写真を選択" : "写真を変更")
                        .font(.headlineMedium)
                        .foregroundColor(.twitterBlue)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.md)
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.large)
                                .stroke(Color.twitterBlue, lineWidth: 1.5)
                        )
                }
                .padding(.horizontal, Spacing.xl)
            }

            Spacer()
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(selectedImageData: $viewModel.selectedImageData)
        }
    }
}

// MARK: - Image Picker
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var selectedImageData: Data?
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.filter = .images
        config.selectionLimit = 1

        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: ImagePicker

        init(_ parent: ImagePicker) {
            self.parent = parent
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            parent.dismiss()

            guard let provider = results.first?.itemProvider else { return }

            if provider.canLoadObject(ofClass: UIImage.self) {
                provider.loadObject(ofClass: UIImage.self) { image, error in
                    guard let image = image as? UIImage else { return }

                    // Compress image
                    if let data = image.jpegData(compressionQuality: 0.7) {
                        DispatchQueue.main.async {
                            self.parent.selectedImageData = data
                        }
                    }
                }
            }
        }
    }
}
