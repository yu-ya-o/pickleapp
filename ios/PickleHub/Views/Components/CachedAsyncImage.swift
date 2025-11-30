import SwiftUI

/// AsyncImageと同じインターフェースを持つ、キャッシュ機能付きの画像読み込みビュー
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    private let url: URL?
    private let content: (Image) -> Content
    private let placeholder: () -> Placeholder

    @State private var image: UIImage?
    @State private var isLoading = false

    init(
        url: URL?,
        @ViewBuilder content: @escaping (Image) -> Content,
        @ViewBuilder placeholder: @escaping () -> Placeholder
    ) {
        self.url = url
        self.content = content
        self.placeholder = placeholder
    }

    var body: some View {
        Group {
            if let image = image {
                content(Image(uiImage: image))
            } else {
                placeholder()
                    .onAppear {
                        loadImage()
                    }
            }
        }
    }

    private func loadImage() {
        guard let url = url, !isLoading else { return }

        // メモリキャッシュから取得を試みる
        if let cachedImage = ImageCache.shared.getFromMemory(url: url) {
            self.image = cachedImage
            return
        }

        // ディスクキャッシュから取得を試みる
        if let diskImage = ImageCache.shared.getFromDisk(url: url) {
            self.image = diskImage
            return
        }

        // ネットワークから取得
        isLoading = true
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data,
                  let downloadedImage = UIImage(data: data) else {
                DispatchQueue.main.async {
                    isLoading = false
                }
                return
            }

            // キャッシュに保存
            ImageCache.shared.set(downloadedImage, for: url)

            // UIを更新
            DispatchQueue.main.async {
                self.image = downloadedImage
                self.isLoading = false
            }
        }.resume()
    }
}

// AsyncImageと同じphaseベースのイニシャライザをサポート
extension CachedAsyncImage where Placeholder == ProgressView<EmptyView, EmptyView> {
    init(url: URL?, @ViewBuilder content: @escaping (Image) -> Content) {
        self.init(
            url: url,
            content: content,
            placeholder: { ProgressView() }
        )
    }
}

// AsyncImageのphaseスタイルをサポートするための拡張
struct CachedAsyncImagePhase<Content: View>: View {
    private let url: URL?
    private let content: (AsyncImagePhase) -> Content

    @State private var phase: AsyncImagePhase = .empty
    @State private var isLoading = false
    @State private var currentURL: URL?

    init(url: URL?, @ViewBuilder content: @escaping (AsyncImagePhase) -> Content) {
        self.url = url
        self.content = content
    }

    var body: some View {
        content(phase)
            .onAppear {
                loadImage()
            }
            .onChange(of: url) { _, newURL in
                // URLが変更された場合、画像を再読み込み
                if newURL != currentURL {
                    phase = .empty
                    isLoading = false
                    loadImage()
                }
            }
    }

    private func loadImage() {
        guard let url = url, !isLoading else { return }

        currentURL = url

        // メモリキャッシュから取得
        if let cachedImage = ImageCache.shared.getFromMemory(url: url) {
            phase = .success(Image(uiImage: cachedImage))
            return
        }

        // ディスクキャッシュから取得
        if let diskImage = ImageCache.shared.getFromDisk(url: url) {
            phase = .success(Image(uiImage: diskImage))
            return
        }

        // ネットワークから取得
        isLoading = true
        URLSession.shared.dataTask(with: url) { data, response, error in
            DispatchQueue.main.async {
                if let data = data, let uiImage = UIImage(data: data) {
                    let image = Image(uiImage: uiImage)
                    ImageCache.shared.set(uiImage, for: url)
                    phase = .success(image)
                } else {
                    phase = .failure(error ?? URLError(.badServerResponse))
                }
                isLoading = false
            }
        }.resume()
    }
}
