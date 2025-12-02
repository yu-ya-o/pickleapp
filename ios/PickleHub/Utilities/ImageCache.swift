import UIKit
import SwiftUI

/// メモリとディスクの両方で画像をキャッシュするシングルトンクラス
class ImageCache {
    static let shared = ImageCache()

    private let memoryCache = NSCache<NSString, UIImage>()
    private let fileManager = FileManager.default
    private lazy var cacheDirectory: URL? = {
        fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first?.appendingPathComponent("ImageCache")
    }()

    // ディスクキャッシュの存在確認用セット（高速チェック用）
    private var diskCacheKeys = Set<String>()
    private let diskCacheKeysLock = NSLock()

    private init() {
        // メモリキャッシュの設定
        memoryCache.countLimit = 200 // 最大200枚に増加
        memoryCache.totalCostLimit = 100 * 1024 * 1024 // 100MBに増加

        // キャッシュディレクトリを作成
        if let cacheDirectory = cacheDirectory {
            try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        }

        // バックグラウンドでディスクキャッシュをスキャンしてインデックス作成
        DispatchQueue.global(qos: .utility).async { [weak self] in
            self?.buildDiskCacheIndex()
        }
    }

    /// ディスクキャッシュのインデックスを構築
    private func buildDiskCacheIndex() {
        guard let cacheDirectory = cacheDirectory else { return }

        do {
            let files = try fileManager.contentsOfDirectory(at: cacheDirectory, includingPropertiesForKeys: nil)
            diskCacheKeysLock.lock()
            for file in files {
                diskCacheKeys.insert(file.lastPathComponent)
            }
            diskCacheKeysLock.unlock()
        } catch {
            // エラーは無視
        }
    }

    /// URLからキャッシュキーを生成
    private func cacheKey(for url: URL) -> String {
        url.absoluteString
    }

    /// ディスクキャッシュのファイル名
    private func diskCacheFileName(for url: URL) -> String {
        url.absoluteString.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? UUID().uuidString
    }

    /// ディスクキャッシュのファイルパス
    private func diskCachePath(for url: URL) -> URL? {
        guard let cacheDirectory = cacheDirectory else { return nil }
        return cacheDirectory.appendingPathComponent(diskCacheFileName(for: url))
    }

    /// ディスクキャッシュに存在するかどうか（高速チェック）
    func existsInDiskCache(url: URL) -> Bool {
        let fileName = diskCacheFileName(for: url)
        diskCacheKeysLock.lock()
        let exists = diskCacheKeys.contains(fileName)
        diskCacheKeysLock.unlock()
        return exists
    }

    /// メモリキャッシュから画像を取得
    func getFromMemory(url: URL) -> UIImage? {
        memoryCache.object(forKey: cacheKey(for: url) as NSString)
    }

    /// ディスクキャッシュから画像を取得（呼び出し元でバックグラウンドスレッドで呼ぶこと推奨）
    func getFromDisk(url: URL) -> UIImage? {
        guard let path = diskCachePath(for: url),
              let data = try? Data(contentsOf: path),
              let image = UIImage(data: data) else {
            return nil
        }

        // ディスクから取得した画像をメモリキャッシュにも保存
        memoryCache.setObject(image, forKey: cacheKey(for: url) as NSString)
        return image
    }

    /// 画像を両方のキャッシュに保存
    func set(_ image: UIImage, for url: URL) {
        // メモリキャッシュに保存
        memoryCache.setObject(image, forKey: cacheKey(for: url) as NSString)

        // ディスクキャッシュに保存（非同期）
        guard let path = diskCachePath(for: url),
              let data = image.jpegData(compressionQuality: 0.8) else {
            return
        }

        let fileName = diskCacheFileName(for: url)
        DispatchQueue.global(qos: .background).async { [weak self] in
            try? data.write(to: path)
            // インデックスを更新
            self?.diskCacheKeysLock.lock()
            self?.diskCacheKeys.insert(fileName)
            self?.diskCacheKeysLock.unlock()
        }
    }

    /// 頻繁に使用される画像をプリロード
    func preloadImages(urls: [URL]) {
        DispatchQueue.global(qos: .utility).async { [weak self] in
            for url in urls {
                // 既にメモリにあればスキップ
                if self?.getFromMemory(url: url) != nil {
                    continue
                }
                // ディスクからメモリにロード
                _ = self?.getFromDisk(url: url)
            }
        }
    }

    /// キャッシュをクリア
    func clearCache() {
        memoryCache.removeAllObjects()
        diskCacheKeysLock.lock()
        diskCacheKeys.removeAll()
        diskCacheKeysLock.unlock()

        if let cacheDirectory = cacheDirectory {
            try? fileManager.removeItem(at: cacheDirectory)
            try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        }
    }
}
