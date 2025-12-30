# Google Maps SDK for iOS セットアップガイド

このガイドでは、iOSアプリでGoogleマップ機能を有効にするための手順を説明します。

## 必要なもの

1. **Google Maps API Key**
   - Maps SDK for iOS
   - Places API

## セットアップ手順

### 1. Google Cloud Platformでプロジェクトを設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成、または既存のプロジェクトを選択

### 2. 必要なAPIを有効化

#### Maps SDK for iOS
1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」を選択
2. 「Maps SDK for iOS」を検索
3. 「有効にする」をクリック

#### Places API
1. 「APIとサービス」→「ライブラリ」を選択
2. 「Places API」を検索
3. 「有効にする」をクリック

### 3. APIキーの作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「APIキー」をクリック
3. 生成されたAPIキーをコピー

### 4. APIキーの制限設定（推奨）

セキュリティのため、APIキーに制限を設定してください：

#### アプリケーションの制限
- **iOSアプリ**を選択
- バンドルID`を追加: `com.yourcompany.PickleHub`

#### APIの制限
以下のAPIのみに制限することを推奨：
- Maps SDK for iOS
- Places API

### 5. iOSプロジェクトでAPIキーを設定

`ios/PickleHub/Config.swift`を編集：

```swift
// MARK: - Google Maps
static let googleMapsAPIKey = "YOUR_ACTUAL_API_KEY_HERE"
```

⚠️ **重要**: `YOUR_GOOGLE_MAPS_API_KEY`を実際のAPIキーに置き換えてください。

### 6. Podをインストール

```bash
cd ios
pod install
```

### 7. 動作確認

1. Xcodeでプロジェクトを開く（`.xcworkspace`ファイルを使用）
2. ビルドして実行
3. イベント作成画面で場所検索を試す
4. イベント詳細画面で地図が表示されることを確認

## トラブルシューティング

### 地図が表示されない

1. **APIキーが正しく設定されているか確認**
   - `Config.swift`の`googleMapsAPIKey`を確認
   - プレースホルダーのままになっていないか確認

2. **APIが有効化されているか確認**
   - Google Cloud ConsoleでMaps SDK for iOSとPlaces APIが有効か確認

3. **APIキーの制限を確認**
   - バンドルIDが正しく設定されているか確認
   - 必要なAPIが許可されているか確認

4. **請求先アカウントが設定されているか確認**
   - Google Cloud Platformでは、無料枠を使用する場合でも請求先アカウントの設定が必要

### 場所検索が動作しない

1. **Places APIが有効化されているか確認**
2. **Xcodeのコンソールでエラーメッセージを確認**
3. **APIキーの制限設定を確認**

### ビルドエラーが発生する

1. **Podが正しくインストールされているか確認**
   ```bash
   cd ios
   pod install
   ```

2. **`.xcworkspace`ファイルを使用しているか確認**
   - `.xcodeproj`ではなく`.xcworkspace`を開いてください

## 料金について

### 無料枠

Google Maps Platformは、毎月以下の無料枠を提供しています：

- **Maps SDK for iOS**: 無料枠内で使用可能
- **Places API (Autocomplete)**: 月間無料$200相当のクレジット

通常の使用であれば、無料枠内で収まることが多いです。

### 料金の確認

- [Google Maps Platform料金](https://mapsplatform.google.com/pricing/)で最新の料金を確認してください
- Google Cloud Consoleで使用量と料金を監視できます

### コスト管理

1. **予算アラートの設定**
   - Google Cloud Consoleで予算アラートを設定
   - 一定額を超えた際に通知を受け取る

2. **クォータの設定**
   - APIの1日あたりのリクエスト数を制限
   - 予期しない料金を防ぐ

## 実装詳細

### 新しいコンポーネント

#### LocationSearchView
- Google Places Autocompleteを使用した場所検索
- 場所名、住所、緯度経度を取得

#### GoogleMapView
- イベント詳細ページで地図表示
- ピンで場所をマーク

### 更新されたモデル

#### Event & TeamEvent
新しいフィールド：
- `address: String?` - 詳細な住所
- `latitude: Double?` - 緯度
- `longitude: Double?` - 経度

### 更新されたView

#### CreateEventView
- 場所入力が`LocationSearchView`に置き換え
- Google Places Autocompleteで場所検索
- 選択した場所の緯度経度を自動取得

#### EventDetailView
- イベント詳細に地図表示を追加
- 緯度経度がある場合のみ地図を表示

## 参考リンク

- [Google Maps Platform公式ドキュメント](https://developers.google.com/maps/documentation)
- [Maps SDK for iOSガイド](https://developers.google.com/maps/documentation/ios-sdk)
- [Places APIガイド](https://developers.google.com/maps/documentation/places/ios-sdk)
- [APIキーのベストプラクティス](https://developers.google.com/maps/api-security-best-practices)
