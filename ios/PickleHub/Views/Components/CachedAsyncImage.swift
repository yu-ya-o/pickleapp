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

        // 初期化時にメモリキャッシュをチェック（同期的・高速）
        if let url = url, let cachedImage = ImageCache.shared.getFromMemory(url: url) {
            _image = State(initialValue: cachedImage)
        }
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
        guard let url = url, !isLoading, image == nil else { return }

        // ディスクキャッシュを非同期でチェック
        isLoading = true
        DispatchQueue.global(qos: .userInitiated).async {
            if let diskImage = ImageCache.shared.getFromDisk(url: url) {
                DispatchQueue.main.async {
                    self.image = diskImage
                    self.isLoading = false
                }
                return
            }

            // ネットワークから取得
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

    @State private var phase: AsyncImagePhase
    @State private var isLoading = false
    @State private var currentURL: URL?

    init(url: URL?, @ViewBuilder content: @escaping (AsyncImagePhase) -> Content) {
        self.url = url
        self.content = content

        // 初期化時にメモリキャッシュをチェック（同期的・高速）
        if let url = url, let cachedImage = ImageCache.shared.getFromMemory(url: url) {
            _phase = State(initialValue: .success(Image(uiImage: cachedImage)))
            _currentURL = State(initialValue: url)
        } else {
            _phase = State(initialValue: .empty)
            _currentURL = State(initialValue: nil)
        }
    }

    var body: some View {
        content(phase)
            .onAppear {
                loadImage()
            }
            .onChange(of: url) { newURL in
                // URLが変更された場合、画像を再読み込み
                if newURL != currentURL {
                    // 新しいURLのメモリキャッシュをチェック
                    if let newURL = newURL, let cachedImage = ImageCache.shared.getFromMemory(url: newURL) {
                        phase = .success(Image(uiImage: cachedImage))
                        currentURL = newURL
                    } else {
                        phase = .empty
                        isLoading = false
                        loadImage()
                    }
                }
            }
    }

    private func loadImage() {
        guard let url = url, !isLoading else { return }

        // 既に成功状態なら何もしない
        if case .success(_) = phase, currentURL == url {
            return
        }

        currentURL = url

        // メモリキャッシュを再確認（他のビューがキャッシュした可能性）
        if let cachedImage = ImageCache.shared.getFromMemory(url: url) {
            phase = .success(Image(uiImage: cachedImage))
            return
        }

        // ディスクキャッシュとネットワークは非同期で
        isLoading = true
        DispatchQueue.global(qos: .userInitiated).async {
            // ディスクキャッシュをチェック
            if let diskImage = ImageCache.shared.getFromDisk(url: url) {
                DispatchQueue.main.async {
                    phase = .success(Image(uiImage: diskImage))
                    isLoading = false
                }
                return
            }

            // ネットワークから取得
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
}
