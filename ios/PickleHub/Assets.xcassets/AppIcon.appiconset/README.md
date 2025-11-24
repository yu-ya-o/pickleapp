# PickleHub アプリアイコン設定

## 必要なアイコンサイズ

iOS 17以降は、**1024x1024pxの単一のアイコン**があれば、Xcodeが自動的に必要なサイズを生成します。

## アイコンファイルの要件

- ファイル名: `icon-1024.png`
- サイズ: 1024x1024 ピクセル
- フォーマット: PNG（透明度なし）
- カラースペース: sRGB

## アイコンデザインのヒント

### ピックルボールアプリらしいデザイン

1. **メインモチーフ**
   - ピックルボールのパドル
   - ボール
   - 緑色（ログイン画面と統一）

2. **カラーパレット**
   - メイン: 緑 (#00FF00 系)
   - アクセント: 白、青

3. **スタイル**
   - シンプルで認識しやすい
   - 丸みを帯びたデザイン
   - モダンでクリーン

## アイコン作成ツール

- **Figma** (https://figma.com) - 無料
- **Canva** (https://canva.com) - 無料
- **App Icon Generator** - オンラインツール

## 設置方法

1. 1024x1024pxのアイコン画像を作成
2. `icon-1024.png`という名前で保存
3. このディレクトリ（`AppIcon.appiconset`）に配置
4. Xcodeでプロジェクトを開く
5. ビルドして確認

## SF Symbolsを使った一時的なアイコン

アイコン画像がない場合、SF Symbols の `figure.pickleball` をベースにした一時的なアイコンを使用できます。

```swift
// ※これは開発中のみ有効。App Store提出には実際の画像が必要
```

## 参考リンク

- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [iOS App Icon Template](https://applypixels.com/template/ios-app-icon)
