# Universal Links セットアップガイド

イベント共有URLから自動的にアプリを開くために、Universal Linksを設定します。

## 📋 必要な情報

まず、以下の情報を確認してください：

1. **Apple Developer Team ID**
   - [Apple Developer](https://developer.apple.com/account) にログイン
   - Membership → Team ID を確認（例: `A1B2C3D4E5`）

2. **Bundle ID**
   - Xcodeでプロジェクトを開く
   - Target → PickleHub → General → Bundle Identifier を確認
   - 例: `com.yourcompany.PickleHub`

---

## 🔧 設定手順

### 1. バックエンド側の設定

`backend/public/.well-known/apple-app-site-association` を以下のように更新：

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.YOUR_BUNDLE_ID",
        "paths": [
          "/events/*",
          "/teams/*/events/*"
        ]
      }
    ]
  }
}
```

**例:**
- Team ID が `A1B2C3D4E5`
- Bundle ID が `com.yourcompany.PickleHub`
- の場合: `"appID": "A1B2C3D4E5.com.yourcompany.PickleHub"`

### 2. iOSアプリ側の設定

#### A. Associated Domains を追加

1. Xcodeでプロジェクトを開く
2. Target → PickleHub を選択
3. **Signing & Capabilities** タブを開く
4. **+ Capability** をクリック
5. **Associated Domains** を選択
6. Domains に以下を追加：
   ```
   applinks:pickleapp.onrender.com
   ```

#### B. URL処理コードを追加

`PickleHubApp.swift` または `AppDelegate.swift` に以下を追加：

```swift
import SwiftUI

@main
struct PickleHubApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    handleUniversalLink(url)
                }
        }
    }

    func handleUniversalLink(_ url: URL) {
        // Universal Link: https://pickleapp.onrender.com/events/123
        // Custom Scheme: picklehub://events/123

        let pathComponents = url.pathComponents

        if pathComponents.contains("events") {
            if let eventIdIndex = pathComponents.firstIndex(of: "events"),
               eventIdIndex + 1 < pathComponents.count {
                let eventId = pathComponents[eventIdIndex + 1]

                // イベント詳細画面に遷移
                NotificationCenter.default.post(
                    name: NSNotification.Name("OpenEvent"),
                    object: nil,
                    userInfo: ["eventId": eventId]
                )
            }
        }
    }
}
```

#### C. Info.plist にカスタムURL Schemeを追加（既存の設定に追加）

すでにGoogle認証用の設定がありますが、`picklehub://` も追加：

```xml
<key>CFBundleURLTypes</key>
<array>
    <!-- 既存のGoogle認証用 -->
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.738453907848-foqdf7208fdh9odmttp2i377o0qnf09j</string>
        </array>
    </dict>
    <!-- 追加: PickleHub用 -->
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>picklehub</string>
        </array>
    </dict>
</array>
```

---

## ✅ 動作確認

### 1. ファイルが正しく配信されているか確認

ブラウザで以下のURLにアクセス：
```
https://pickleapp.onrender.com/.well-known/apple-app-site-association
```

正しいJSONが表示されればOK。

### 2. Apple検証ツールで確認

Appleの[App Search API Validation Tool](https://search.developer.apple.com/appsearch-validation-tool)で検証：
- URLに `https://pickleapp.onrender.com` を入力
- アプリが見つかればOK

### 3. 実機でテスト

1. アプリをビルドして実機にインストール
2. Safariで以下のURLを開く：
   ```
   https://pickleapp.onrender.com/events/[実際のイベントID]
   ```
3. アプリが自動的に開けばOK！

**注意:**
- Safariのアドレスバーに直接入力してください（リンクをタップではなく）
- 初回は「開く」の確認ダイアログが表示される場合があります
- Notesアプリなどでリンクをタップしてテストすることもできます

---

## 🐛 トラブルシューティング

### Universal Linksが動作しない場合

1. **デバイスを再起動**
   - iOSは起動時にUniversal Linksの設定を取得します

2. **アプリを再インストール**
   - アプリのインストール時にも設定を取得します

3. **apple-app-site-associationの内容を確認**
   ```bash
   curl https://pickleapp.onrender.com/.well-known/apple-app-site-association
   ```

4. **Associated Domainsの設定を確認**
   - Xcodeで `applinks:pickleapp.onrender.com` が正しく設定されているか確認

5. **Content-Typeを確認**
   - `application/json` である必要があります
   - 現在のNext.js設定で自動的に設定されています

### デバッグ方法

設定 → デベロッパ → Associated Domains Development で詳細ログを確認できます。

---

## 📱 期待される動作

### Universal Links設定後：

**ユーザーの視点:**
1. イベント共有リンクをタップ
   ```
   https://pickleapp.onrender.com/events/abc123
   ```
2. 一瞬ページが表示され、すぐにアプリが開く
3. アプリ内でイベント詳細画面が表示される

**アプリがインストールされていない場合:**
- 通常のWebページとして表示される
- 「アプリで開く」ボタンが表示される

---

## 📚 参考リンク

- [Apple Developer - Universal Links](https://developer.apple.com/ios/universal-links/)
- [Supporting Universal Links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
