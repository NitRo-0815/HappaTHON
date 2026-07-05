# HappaTHON

## 起動方法

### 1. バックエンドサーバー

```bash
cd backend/happa-cli
cp .env.example .env
# .env を編集して OPENROUTER_API_KEY を設定
npm run server
```

### 2. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## 仕組み

- フロントエンドからは直接 API キーを参照せず、バックエンドの `/api/assistant` に問い合わせます。
- API キーはサーバー側でのみ扱います。
