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

    private init() {
        // メモリキャッシュの設定
        memoryCache.countLimit = 100 // 最大100枚
        memoryCache.totalCostLimit = 50 * 1024 * 1024 // 50MB

        // キャッシュディレクトリを作成
        if let cacheDirectory = cacheDirectory {
            try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        }
    }

    /// URLからキャッシュキーを生成
    private func cacheKey(for url: URL) -> String {
        url.absoluteString
    }

    /// ディスクキャッシュのファイルパス
    private func diskCachePath(for url: URL) -> URL? {
        guard let cacheDirectory = cacheDirectory else { return nil }
        let fileName = url.absoluteString.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? UUID().uuidString
        return cacheDirectory.appendingPathComponent(fileName)
    }

    /// メモリキャッシュから画像を取得
    func getFromMemory(url: URL) -> UIImage? {
        memoryCache.object(forKey: cacheKey(for: url) as NSString)
    }

    /// ディスクキャッシュから画像を取得
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

        DispatchQueue.global(qos: .background).async {
            try? data.write(to: path)
        }
    }

    /// キャッシュをクリア
    func clearCache() {
        memoryCache.removeAllObjects()
        if let cacheDirectory = cacheDirectory {
            try? fileManager.removeItem(at: cacheDirectory)
            try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        }
    }
}
