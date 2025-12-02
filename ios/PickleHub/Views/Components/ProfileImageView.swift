import SwiftUI

/// プロフィール画像を表示するコンポーネント
/// ローディング中は何も表示せず、画像がない場合のみデフォルトアイコンを表示
struct ProfileImageView: View {
    let url: URL?
    let size: CGFloat

    @State private var image: UIImage?
    @State private var isLoading = false
    @State private var hasAttemptedLoad = false

    init(url: URL?, size: CGFloat = 40) {
        self.url = url
        self.size = size

        // メモリキャッシュから同期的に取得
        if let url = url, let cachedImage = ImageCache.shared.getFromMemory(url: url) {
            _image = State(initialValue: cachedImage)
            _hasAttemptedLoad = State(initialValue: true)
        }
    }

    var body: some View {
        Group {
            if let image = image {
                // 画像がある場合
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: size, height: size)
                    .clipShape(Circle())
            } else if hasAttemptedLoad || url == nil {
                // ロード完了後に画像がない場合、またはURLがない場合
                defaultIcon
            } else {
                // ローディング中は透明な円を表示（レイアウト維持のため）
                Circle()
                    .fill(Color(.systemGray6))
                    .frame(width: size, height: size)
            }
        }
        .onAppear {
            loadImage()
        }
    }

    private var defaultIcon: some View {
        Circle()
            .fill(Color(.systemGray5))
            .frame(width: size, height: size)
            .overlay(
                Image(systemName: "person.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: size * 0.5, height: size * 0.5)
                    .foregroundColor(Color(.systemGray3))
            )
    }

    private func loadImage() {
        guard let url = url, !isLoading, image == nil, !hasAttemptedLoad else { return }

        isLoading = true

        DispatchQueue.global(qos: .userInitiated).async {
            // ディスクキャッシュをチェック
            if let diskImage = ImageCache.shared.getFromDisk(url: url) {
                DispatchQueue.main.async {
                    self.image = diskImage
                    self.isLoading = false
                    self.hasAttemptedLoad = true
                }
                return
            }

            // ネットワークから取得
            URLSession.shared.dataTask(with: url) { data, response, error in
                DispatchQueue.main.async {
                    if let data = data, let downloadedImage = UIImage(data: data) {
                        ImageCache.shared.set(downloadedImage, for: url)
                        self.image = downloadedImage
                    }
                    self.isLoading = false
                    self.hasAttemptedLoad = true
                }
            }.resume()
        }
    }
}
