# Google Maps API セットアップガイド

このガイドでは、Googleマップ連動機能を使用するために必要なGoogle Maps APIの設定方法を説明します。

## 必要なAPI

以下の2つのAPIを有効にする必要があります：

1. **Maps JavaScript API** - 地図表示用
2. **Places API** - 場所検索（オートコンプリート）用

## セットアップ手順

### 1. Google Cloud Platformプロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成、または既存のプロジェクトを選択

### 2. APIの有効化

#### Maps JavaScript APIの有効化
1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」を選択
2. 「Maps JavaScript API」を検索
3. 「有効にする」をクリック

#### Places APIの有効化
1. 同じく「APIとサービス」→「ライブラリ」を選択
2. 「Places API」を検索
3. 「有効にする」をクリック

### 3. APIキーの作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「APIキー」をクリック
3. 生成されたAPIキーをコピー

### 4. APIキーの制限設定（推奨）

セキュリティのため、APIキーに制限を設定することを強く推奨します：

#### アプリケーションの制限
- **開発環境**: HTTPリファラーを設定
  - 例: `http://localhost:*/*`, `https://yourdomain.com/*`
- **本番環境**: 本番ドメインのみを許可

#### APIの制限
以下のAPIのみに制限することを推奨：
- Maps JavaScript API
- Places API

### 5. 環境変数の設定

#### フロントエンド（web）

`web/.env`ファイルを作成し、以下を追加：

```bash
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

`.env.example`をコピーして`.env`を作成することもできます：

```bash
cd web
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

## 動作確認

### 1. 開発サーバーの起動

```bash
cd web
npm run dev
```

### 2. 機能のテスト

1. **イベント作成ページ**にアクセス
2. **場所**フィールドに入力すると、Google Places Autocompleteが動作
3. 場所を選択すると、自動的に住所と緯度経度が設定される
4. イベントを作成後、**イベント詳細ページ**で地図が表示される

## トラブルシューティング

### 地図が表示されない

1. **APIキーが正しく設定されているか確認**
   - ブラウザのコンソールでエラーを確認
   - `VITE_GOOGLE_MAPS_API_KEY`が`.env`に設定されているか確認

2. **APIが有効化されているか確認**
   - Google Cloud ConsoleでMaps JavaScript APIとPlaces APIが有効か確認

3. **APIキーの制限を確認**
   - 開発環境のURLが許可されているか確認
   - 必要なAPIが許可されているか確認

4. **請求先アカウントが設定されているか確認**
   - Google Cloud Platformでは、無料枠を使用する場合でも請求先アカウントの設定が必要

### オートコンプリートが動作しない

1. **Places APIが有効化されているか確認**
2. **ブラウザのコンソールでエラーメッセージを確認**
3. **APIキーの制限設定を確認**

## 料金について

### 無料枠

Google Mapsプラットフォームは、毎月以下の無料枠を提供しています：

- **Maps JavaScript API**: 月間28,500回までのマップロード
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

## 参考リンク

- [Google Maps Platform公式ドキュメント](https://developers.google.com/maps/documentation)
- [Maps JavaScript APIガイド](https://developers.google.com/maps/documentation/javascript)
- [Places API Web Serviceガイド](https://developers.google.com/maps/documentation/places/web-service)
- [APIキーのベストプラクティス](https://developers.google.com/maps/api-security-best-practices)
