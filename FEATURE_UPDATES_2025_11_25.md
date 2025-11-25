# 機能更新ドキュメント (2025-11-25)

## 概要
このドキュメントは、2025年11月25日のセッションで実装された機能と変更をまとめたものです。

---

## 実装された機能一覧

### 1. イベント編集ボタンのデザイン統一
**目的**: チームイベントと個人イベントの編集ボタンを統一されたデザインにする

**変更内容**:
- 個人イベント詳細画面の編集ボタンをアクションボタンセクションに追加
- チームイベントの編集ボタンと同じデザインパターンを適用

**実装ファイル**:
- `ios/PickleHub/Views/EventDetailView.swift`

**デザイン仕様**:
```swift
Button(action: { showingEditEvent = true }) {
    HStack {
        Spacer()
        Image(systemName: "pencil")
        Text("イベントを編集")
            .fontWeight(.semibold)
        Spacer()
    }
    .foregroundColor(.blue)
    .padding()
    .background(Color.blue.opacity(0.1))
    .cornerRadius(12)
}
```

---

### 2. アカウント削除機能の改善

#### 2.1 削除エラーメッセージの表示
**目的**: アカウント削除失敗時にユーザーにわかりやすいエラーメッセージを表示

**変更内容**:
- エラーアラートの追加
- エラーメッセージの表示

**実装ファイル**:
- `ios/PickleHub/Views/ProfileView.swift`

**実装詳細**:
```swift
// State変数
@State private var showingDeleteAccountError = false
@State private var deleteAccountErrorMessage = ""

// エラーハンドリング
do {
    try await authViewModel.deleteAccount()
} catch {
    deleteAccountErrorMessage = error.localizedDescription
    showingDeleteAccountError = true
}

// エラーアラート
.alert("削除できませんでした", isPresented: $showingDeleteAccountError) {
    Button("OK", role: .cancel) {}
} message: {
    Text(deleteAccountErrorMessage)
}
```

#### 2.2 アカウント削除ボタンのデザイン変更
**目的**: ボタンを目立たなくし、ログインボタンとフォントサイズを統一

**変更内容**:
- フォント: `.caption` → `.headline`
- 色: 赤 → グレー（`.secondary`）
- ボーダー: 赤 → 薄いグレー

#### 2.3 メンバーが自分1人のチームの削除を許可
**目的**: 1人チームがある場合でもアカウント削除を可能にする

**変更内容**:
- チーム削除ロジックの改善
- 1人チームは自動削除
- 複数メンバーがいてオーナー/アドミンが自分だけの場合は削除不可

**実装ファイル**:
- `backend/app/api/account/delete/route.ts`

**ロジック**:
```typescript
// チェックロジック
const teamsWithoutLeadership = userTeamMemberships.filter(
  (membership) => {
    const team = membership.team;
    const totalMembers = team.members.length;
    const otherLeaders = team.members.filter(
      (m) => m.userId !== userId && (m.role === 'owner' || m.role === 'admin')
    ).length;

    // メンバーが1人だけの場合は削除OK
    if (totalMembers === 1) return false;

    // 他のメンバーがいて、他にリーダーがいない場合は削除NG
    return otherLeaders === 0;
  }
);

// 1人チームの削除処理
const soloTeams = await tx.team.findMany({
  where: {
    members: {
      every: { userId: userId },
    },
  },
});

if (soloTeams.length > 0) {
  await tx.team.deleteMany({
    where: { id: { in: soloTeams.map((t) => t.id) } },
  });
}
```

**削除可能な条件**:
| ケース | メンバー構成 | 削除可否 | 理由 |
|--------|------------|---------|------|
| ケース1 | 自分（オーナー）のみ | ✅ 可能 | チームも削除される |
| ケース2 | 自分（オーナー）+ 他のメンバー | ❌ 不可 | オーナー/アドミンが不在になる |
| ケース3 | 自分（オーナー）+ 他のアドミン | ✅ 可能 | アドミンが残る |
| ケース4 | 自分（アドミン）+ オーナー | ✅ 可能 | オーナーが残る |

---

### 3. 通知の表示名をニックネームに変更

**目的**: 通知でユーザー名の代わりにニックネームを表示

**変更内容**:
- イベント参加通知: `user.name` → `user.nickname || user.name`
- イベントキャンセル通知: `user.name` → `user.nickname || user.name`
- チーム参加リクエスト通知: `user.name` → `user.nickname || user.name`

**実装ファイル**:
- `backend/app/api/reservations/route.ts`
- `backend/app/api/reservations/[id]/route.ts`
- `backend/app/api/teams/[id]/join-requests/route.ts`

**実装例**:
```typescript
// イベント参加通知
notifyEventJoined(body.eventId, user.nickname || user.name, event.title)

// イベントキャンセル通知
notifyEventCancelled(reservation.event.id, user.nickname || user.name, reservation.event.title)

// チーム参加リクエスト通知
notifyTeamJoinRequest(id, user.nickname || user.name, team.name)
```

---

### 4. イベントチャットの修正

**目的**: WebSocketベースからAPIベースの実装に変更し、チームチャットと同じパターンにする

**変更内容**:
- ChatViewModelの削除
- State管理でメッセージを保持
- API呼び出しでメッセージの読み込みと送信
- 空メッセージ時のプレースホルダー追加

**実装ファイル**:
- `ios/PickleHub/Views/ChatView.swift`

**実装詳細**:
```swift
// メッセージの読み込み
private func loadMessages() async {
    do {
        let chatRoom = try await APIClient.shared.getChatRoom(eventId: eventId)
        messages = chatRoom.messages
    } catch {
        print("Load event chat error: \(error)")
    }
}

// メッセージの送信
private func sendMessage() {
    let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !text.isEmpty else { return }

    messageText = "" // 即座にクリア

    Task {
        do {
            let chatRoom = try await APIClient.shared.getChatRoom(eventId: eventId)
            let newMessage = try await APIClient.shared.sendMessage(chatRoomId: chatRoom.id, content: text)
            messages.append(newMessage)
        } catch {
            print("Send message error: \(error)")
        }
    }
}
```

---

### 5. マイパドル表示の改善

**目的**: マイパドルのアイコンを変更し、未設定時も表示する

**変更内容**:
- アイコン: `sportscourt.fill` → `tennis.racket`
- 未設定時: 非表示 → ハイフン（`-`）表示
- DUPRと同じ表示形式

**実装ファイル**:
- `ios/PickleHub/Views/ProfileView.swift`
- `ios/PickleHub/Views/UserProfileView.swift`

**実装例**:
```swift
// 変更前
if let myPaddle = user.myPaddle, !myPaddle.isEmpty {
    ProfileInfoRow(
        icon: "sportscourt.fill",
        label: "使用パドル",
        value: myPaddle
    )
}

// 変更後
ProfileInfoRow(
    icon: "tennis.racket",
    label: "使用パドル",
    value: user.myPaddle ?? "-"
)
```

---

### 6. ユーザープロフィールの所属チーム表示改善

#### 6.1 チームアイコンを丸形に変更
**変更内容**:
- `.clipShape(RoundedRectangle(cornerRadius: CornerRadius.small))` → `.clipShape(Circle())`

#### 6.2 タップでチーム詳細に遷移
**変更内容**:
- Buttonでラップ
- sheetでチーム詳細を表示
- chevron.rightアイコンを追加

#### 6.3 チーム詳細シートに閉じるボタンを追加
**変更内容**:
- NavigationViewでラップ
- toolbarで閉じるボタンを追加

**実装ファイル**:
- `ios/PickleHub/Views/UserProfileView.swift`

**実装詳細**:
```swift
struct TeamCardRow: View {
    let team: Team
    @State private var showingTeamDetail = false

    var body: some View {
        Button(action: {
            showingTeamDetail = true
        }) {
            HStack(spacing: Spacing.md) {
                // チームアイコン（丸形）
                if let iconImageURL = team.iconImageURL {
                    CachedAsyncImage(url: iconImageURL) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Image(systemName: "person.3.fill")
                            .foregroundColor(.gray)
                    }
                    .frame(width: 40, height: 40)
                    .clipShape(Circle())
                }

                // チーム情報
                VStack(alignment: .leading, spacing: 4) {
                    Text(team.name)
                    // ...
                }

                Spacer()

                // chevron.rightアイコン
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showingTeamDetail) {
            NavigationView {
                TeamDetailView(teamId: team.id)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("閉じる") {
                                showingTeamDetail = false
                            }
                        }
                    }
            }
        }
    }
}
```

---

### 7. 通知とチャットのUI改善

#### 7.1 通知からイベントを開いた時の表示改善
**変更内容**:
- 閉じるボタンのテキスト: 「Done」 → 「閉じる」
- 編集ボタンを非表示（toolbarから削除）

**実装ファイル**:
- `ios/PickleHub/Views/EventDetailContainerView.swift`
- `ios/PickleHub/Views/EventDetailView.swift`

#### 7.2 チャット送信時のテキストフィールドクリア改善
**目的**: 送信ボタンを押した瞬間にテキストフィールドを確実にクリア

**変更内容**:
- `messageText = ""` をTask{}の外に移動
- `DispatchQueue.main.async`を使用してメインスレッドで確実にクリア
- `@FocusState`を追加してフォーカス管理を改善

**実装ファイル**:
- `ios/PickleHub/Views/ChatView.swift`
- `ios/PickleHub/Views/Teams/TeamChatView.swift`

**実装例**:
```swift
// FocusStateの追加
@FocusState private var isTextFieldFocused: Bool

// TextFieldにfocusedモディファイアを追加
TextField("メッセージを入力...", text: $messageText, axis: .vertical)
    .focused($isTextFieldFocused)

// sendMessage関数の改善
private func sendMessage() {
    let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !text.isEmpty else { return }

    // メインスレッドで確実にクリア
    DispatchQueue.main.async {
        messageText = ""
    }

    Task {
        // メッセージ送信処理
    }
}
```

#### 7.3 通知からの画面遷移時の「Done」ボタン修正
**目的**: すべての「Done」ボタンを日本語の「閉じる」に統一

**変更内容**:
- 通知からチーム詳細を開いた時の「Done」→「閉じる」
- 通知からチームイベント詳細を開いた時の「Done」→「閉じる」

**実装ファイル**:
- `ios/PickleHub/Views/NotificationsView.swift`
- `ios/PickleHub/Views/TeamEventDetailContainerView.swift`

**実装例**:
```swift
Button("閉じる") {
    showingTeamDetail = false
}
```

---

## API変更まとめ

### 変更されたエンドポイント

#### 1. DELETE /api/account/delete
**変更内容**:
- 1人チームの削除処理を追加
- チェックロジックを改善

**リクエスト**: 変更なし

**レスポンス**:
- 成功時: `{ message: 'Account deleted successfully' }`
- エラー時: `{ error: '以下のチームでオーナーまたはアドミンが他にいないため、アカウントを削除できません: [チーム名]' }` (400)

#### 2. POST /api/reservations
**変更内容**:
- 通知の表示名をニックネームに変更

**影響**: 通知メッセージ内のユーザー名表示

#### 3. DELETE /api/reservations/[id]
**変更内容**:
- 通知の表示名をニックネームに変更

**影響**: 通知メッセージ内のユーザー名表示

#### 4. POST /api/teams/[id]/join-requests
**変更内容**:
- 通知の表示名をニックネームに変更

**影響**: 通知メッセージ内のユーザー名表示

---

## UI/UX改善まとめ

### デザイン統一
1. **編集ボタン**: チームイベントと個人イベントで統一
2. **閉じるボタン**: 日本語表記「閉じる」に統一
3. **マイパドル**: アイコンを`tennis.racket`に統一、未設定時は`-`表示

### ユーザビリティ向上
1. **エラーメッセージ**: アカウント削除失敗時に具体的な理由を表示
2. **チャット**: 送信ボタンを押すと即座にテキストフィールドがクリア
3. **チーム詳細**: タップでチーム詳細に遷移、閉じるボタンで戻る

### アイコン・表示改善
1. **チームアイコン**: 丸形に変更
2. **マイパドル**: ラケットアイコンに変更
3. **通知**: ニックネームを優先表示

---

## 技術的な注意点

### 1. アカウント削除のトランザクション
- すべての削除処理は`prisma.$transaction`内で実行
- エラーが発生した場合はロールバック
- 処理順序が重要（外部キー制約に注意）

### 2. チャットのテキストクリアタイミング
- `messageText = ""`は`DispatchQueue.main.async`内で実行
- メインスレッドでの確実なUI更新を保証
- `@FocusState`でフォーカス管理を追加
- SwiftUIのState更新タイミング問題を回避
- エラー発生時の処理は考慮不要（ユーザーが再送信）

### 3. NavigationViewの重複に注意
- EventDetailContainerViewはNavigationViewでラップ済み
- EventDetailView内でtoolbarを使うと重複する可能性
- 通知から開く場合は編集ボタンを非表示にする

### 4. ニックネームのフォールバック
- `user.nickname || user.name`でニックネーム優先
- ニックネームが未設定の場合は名前を使用
- nullチェックは不要（必ずnameは存在）

---

## テスト項目

### アカウント削除
- [ ] メンバーが自分1人のチームがある場合、削除可能
- [ ] メンバーが複数いてオーナー/アドミンが自分だけの場合、削除不可
- [ ] エラーメッセージが正しく表示される
- [ ] 削除成功時にログアウトされる

### 通知
- [ ] ニックネームが設定されている場合、ニックネームが表示される
- [ ] ニックネームが未設定の場合、名前が表示される
- [ ] 通知からイベントを開いた時、閉じるボタンのみ表示される

### チャット
- [ ] 送信ボタンを押すと即座にテキストフィールドがクリアされる
- [ ] イベントチャットとチームチャットで同じ動作

### プロフィール
- [ ] マイパドルがラケットアイコンで表示される
- [ ] 未設定時はハイフン（-）が表示される
- [ ] チームアイコンが丸形で表示される
- [ ] チームをタップするとチーム詳細が開く
- [ ] チーム詳細に閉じるボタンが表示される

---

## 今後の改善案

### 短期的な改善
1. アカウント削除時の確認画面の改善
2. チャットのオフライン対応
3. 通知の既読/未読管理の改善

### 長期的な改善
1. リアルタイムチャットの復活（WebSocket）
2. プッシュ通知の実装
3. チーム管理機能の強化

---

## 関連ドキュメント
- [API Documentation](./API_DOCUMENTATION.md)
- [Teams Implementation](./TEAMS_IMPLEMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 変更履歴
- 2025-11-25: 初版作成
