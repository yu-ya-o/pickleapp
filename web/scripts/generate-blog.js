/**
 * generate-blog.js
 * Auto-generates pickleball blog articles using the Anthropic Claude API.
 * Run: node scripts/generate-blog.js
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const GENERATED_FILE = path.join(ROOT, 'scripts', 'generated.json');
const LOGS_DIR = path.join(ROOT, 'logs');

// ─── Topic list (50 topics, consumed in order then looped) ───────────────────
const TOPICS = [
  'ピックルボールパドルおすすめ10選（初心者〜上級者別）',
  'ピックルボール初心者セット完全ガイド',
  'ピックルボールシューズの選び方と人気モデル比較',
  'ピックルボールのルール完全解説（初心者向け）',
  'ピックルボールコートの作り方と必要なもの',
  'ピックルボールボールの種類と選び方',
  'ピックルボールバッグおすすめ6選',
  'ピックルボールとテニスの違いを徹底比較',
  'ピックルボール上達のコツ10選',
  'ピックルボール大会に初めて出る方へのガイド',
  'ピックルボールグリップテープの選び方と交換方法',
  'ピックルボール用ネットおすすめ比較',
  'ピックルボールのサーブ練習方法',
  'ピックルボールダブルスの戦術入門',
  'ピックルボールシングルスのコツと戦略',
  'ピックルボール体験会・スクールの探し方',
  'ピックルボールとバドミントンの違い',
  'ピックルボールで痩せる？カロリー消費と健康効果',
  '50代・60代におすすめのピックルボール入門',
  'ピックルボール用インソールのおすすめ',
  'ピックルボール練習用マシン・ボール出し機',
  'ピックルボールウェアの選び方（夏・冬別）',
  'ピックルボールサングラスのおすすめ',
  'ピックルボールリストバンド・サポーターの活用法',
  'ピックルボール肘・手首の怪我予防と対策',
  'ピックルボールコートシューズとランニングシューズの違い',
  'ピックルボール初心者が最初に買うべきもの5選',
  'ピックルボールパドルの素材別比較（カーボン・グラスファイバー）',
  'ピックルボールパドルの重さとバランスの選び方',
  'ピックルボール公式試合で使えるボールの条件',
  'ピックルボールアウトドア用とインドア用の違い',
  'ピックルボールキッズ・子供向けセット紹介',
  'ピックルボール家族で楽しむ週末ガイド',
  'ピックルボールコミュニティの見つけ方（地域別）',
  'ピックルボール動画で学ぶおすすめYouTubeチャンネル',
  'ピックルボール審判のルールと判定ガイド',
  'ピックルボールスコアの数え方完全解説',
  'ピックルボールキッチン（ノンボレーゾーン）の使い方',
  'ピックルボールのサードショットドロップとは',
  'ピックルボールのロブショットを使いこなす',
  'ピックルボールのスピン技術入門',
  'ピックルボール試合前のウォームアップルーティン',
  'ピックルボール試合後のクールダウンとケア',
  'ピックルボール大会結果・世界ランキング最新情報',
  'ピックルボール日本代表選手紹介',
  'ピックルボール用語集・英語用語解説',
  'ピックルボールの歴史と起源',
  'ピックルボール施設・コート検索の方法',
  'ピックルボール体験レポート：初めて打ってみた',
  'ピックルボール月別おすすめ練習スケジュール',
];

const SYSTEM_PROMPT = `あなたはスポーツ用品のアフィリエイトメディアの編集者です。
日本のピックルボール初心者〜中級者に向けた、役立つ記事を書いてください。

ルール：
- 文字数：2,000〜3,000字
- 見出しはH2（##）とH3（###）を使う
- 読者に語りかける自然な口調（〜ですね、〜しましょう など）
- 商品紹介は押しつけがましくせず、選び方の基準を先に説明する
- アフィリエイトリンクのプレースホルダー：
  記事中盤に {{AFFILIATE_MAIN}} を1回
  記事末尾に {{AFFILIATE_SUB}} を1回
- フロントマターをMarkdown先頭に含める（title, description, date, category, affiliateLinks）
- affiliateLinksはプレースホルダーのまま出力（実際のURLは後で置換）

フロントマターの形式：
---
title: "記事タイトル"
description: "記事の説明（SEO用、100字以内）"
date: "YYYY-MM-DD"
category: "パドル" | "シューズ" | "初心者ガイド" | "大会情報" | "ルール解説"
affiliateLinks:
  main: "{{AFFILIATE_MAIN_URL}}"
  sub: "{{AFFILIATE_SUB_URL}}"
---`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadGenerated() {
  if (!fs.existsSync(GENERATED_FILE)) return { done: [] };
  return JSON.parse(fs.readFileSync(GENERATED_FILE, 'utf-8'));
}

function saveGenerated(data) {
  fs.writeFileSync(GENERATED_FILE, JSON.stringify(data, null, 2));
}

function topicToSlug(topic) {
  // Transliterate Japanese to a readable ASCII slug using a timestamp fallback
  const date = new Date().toISOString().slice(0, 10);
  const hash = Buffer.from(topic).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  return `${hash}-${date}`;
}

function replaceAffiliateLinks(content) {
  const main = process.env.AFFILIATE_AMAZON_MAIN || 'https://www.amazon.co.jp/';
  const sub = process.env.AFFILIATE_AMAZON_SUB || 'https://www.amazon.co.jp/';
  return content
    .replace(/\{\{AFFILIATE_MAIN_URL\}\}/g, main)
    .replace(/\{\{AFFILIATE_SUB_URL\}\}/g, sub)
    .replace(/\{\{AFFILIATE_MAIN\}\}/g, main)
    .replace(/\{\{AFFILIATE_SUB\}\}/g, sub);
}

function ensureDirs() {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// ─── Generation ──────────────────────────────────────────────────────────────

async function generateArticle(client, topic) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `以下のトピックで記事を書いてください：\n\n${topic}`,
      },
    ],
  });

  const rawContent = response.content[0].type === 'text' ? response.content[0].text : '';
  return replaceAffiliateLinks(rawContent);
}

function saveArticle(topic, content) {
  const slug = topicToSlug(topic);
  let filePath = path.join(CONTENT_DIR, `${slug}.md`);

  // Avoid overwriting existing files
  if (fs.existsSync(filePath)) {
    const date = new Date().toISOString().slice(0, 10);
    filePath = path.join(CONTENT_DIR, `${slug}-${date}.md`);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  return path.basename(filePath);
}

function logFailure(topic, error) {
  const date = new Date().toISOString().slice(0, 10);
  const logFile = path.join(LOGS_DIR, `generate-failures-${date}.log`);
  const entry = `[${new Date().toISOString()}] FAILED: ${topic}\n  ${error.message}\n\n`;
  fs.appendFileSync(logFile, entry);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }

  ensureDirs();

  const client = new Anthropic({ apiKey });
  const generated = loadGenerated();

  // Reset loop when all topics are consumed
  if (generated.done.length >= TOPICS.length) {
    console.log('🔄 All topics consumed – resetting generated.json to loop');
    generated.done = [];
  }

  // Pick up to 10 ungenerated topics
  const pending = TOPICS.filter((t) => !generated.done.includes(t));
  const batch = pending.slice(0, 10);

  if (batch.length === 0) {
    console.log('✅ No new topics to generate');
    return;
  }

  console.log(`🚀 Generating ${batch.length} articles in parallel…`);

  const results = await Promise.allSettled(
    batch.map(async (topic) => {
      const content = await generateArticle(client, topic);
      const filename = saveArticle(topic, content);
      return { topic, filename };
    }),
  );

  let successCount = 0;
  const newlyDone = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      successCount++;
      newlyDone.push(result.value.topic);
      console.log(`  ✅ ${result.value.filename}`);
    } else {
      const topic = batch[results.indexOf(result)];
      console.error(`  ❌ Failed: ${topic}`);
      logFailure(topic, result.reason);
    }
  }

  generated.done = [...generated.done, ...newlyDone];
  saveGenerated(generated);

  const remaining = TOPICS.length - generated.done.length;
  console.log(`\n✅ ${successCount}記事生成完了 / 残り${remaining}トピック`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
