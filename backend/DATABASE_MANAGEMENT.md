# データベース管理ガイド

## DBリセット（Render環境）

### 🔴 DBを完全リセットする場合（一度だけ）

1. **Renderのダッシュボードで環境変数を追加**
   ```
   Key: RESET_DB
   Value: true
   ```

2. **デプロイをトリガー**
   - Renderが自動的にビルド＆デプロイを実行
   - ビルド時に `npx prisma migrate reset --force` が実行される
   - データベースが完全にリセットされ、シードデータが投入される

3. **リセット後、すぐに環境変数を削除**
   ```
   RESET_DB を削除または false に変更
   ```
   ⚠️ **重要**: 削除しないと、次回のデプロイでもDBがリセットされます！

### ✅ 通常のマイグレーション適用（推奨）

環境変数を設定しない、または `RESET_DB=false` の場合：
- `npx prisma migrate deploy` が実行される
- 既存データを保持したまま、新しいマイグレーションのみ適用

## ビルドスクリプトの仕組み

```json
"build": "npm run db:prepare && prisma generate && next build"
"db:prepare": "if [ \"$RESET_DB\" = \"true\" ]; then npx prisma migrate reset --force; else npx prisma migrate deploy; fi"
```

### 動作フロー

```
ビルド開始
  ↓
db:prepare 実行
  ↓
RESET_DB=true?
  ├─ YES → prisma migrate reset (DBを完全リセット)
  └─ NO  → prisma migrate deploy (マイグレーションのみ適用)
  ↓
prisma generate
  ↓
next build
  ↓
デプロイ完了
```

## ローカル環境でのリセット

```bash
cd backend
npx prisma migrate reset
```

## 安全対策

✅ **推奨事項:**
- 本番環境では `RESET_DB=true` を使わない
- リセットは初回セットアップ時のみ
- 通常は `prisma migrate deploy` で十分

❌ **避けるべきこと:**
- `RESET_DB=true` を常時設定
- 本番データがある状態でリセット
- 環境変数の削除忘れ

## トラブルシューティング

### DBがリセットされない場合
1. 環境変数のスペルを確認（`RESET_DB`）
2. 値が正確に `true` か確認（大文字小文字区別）
3. Renderのログを確認

### 毎回リセットされてしまう場合
1. 環境変数 `RESET_DB` を削除
2. または `RESET_DB=false` に変更
3. 再デプロイ
