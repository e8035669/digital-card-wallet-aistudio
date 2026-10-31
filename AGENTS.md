# AGENTS.md

便利商店商品卡錢包（一張卡可存兩組條碼）。純前端 React + TypeScript + Vite 應用，無後端。用途與功能見 [README.md](README.md)。

## 環境與指令

Node.js / npm 由 pixi 提供。**所有 npm / node / tsc 指令一律透過 `pixi run` 執行，不要使用系統的 node/npm。**

```bash
pixi run install     # npm ci
pixi run dev         # Vite dev server，port 3000
pixi run build       # 建置到 dist/
pixi run typecheck   # npx tsc --noEmit
pixi run npm install <pkg>   # 新增/更新依賴（會同步更新 package-lock.json）
```

- 沒有測試與 lint 設定；改完程式請至少執行 `pixi run typecheck` 與 `pixi run build`。
- `pixi.lock`、`package-lock.json` 需一起提交；`node_modules/`、`dist/`、`.pixi/` 不提交。
- TypeScript 7 預設 strict；React 型別來自 `@types/react` / `@types/react-dom`。

## 架構

- `App.tsx`：唯一的狀態來源。`view`（`list` / `add` / `detail`）切換畫面，卡片 CRUD 在此，資料以 `useLocalStorage('digital-wallet-cards')` 持久化。無路由。
- `types.ts`：`Card`、`CardType`。`barcode2` 為 `string | null`（單條碼卡片為 null）。
- `constants.ts`：`CARD_TYPE_CONFIG`，定義各卡片類型的名稱、條碼數量、欄位標籤。
- `components/`：`CardList`、`AddCard`、`Scanner`（相機）、`CardDetail`、`Barcode`、`icons/`。
- `hooks/useLocalStorage.ts`：localStorage 同步 hook。

## 慣例與注意事項

- 新增卡片類型：在 `types.ts` 的 `CardType` 加成員，並在 `constants.ts` 的 `CARD_TYPE_CONFIG` 補設定（`Record<CardType, …>` 會強制補齊）。條碼數量大於 1 的邏輯由 `barcodeCount` 驅動，不要在元件中硬編碼類型。
- 條碼以 JsBarcode 繪製 CODE128（`components/Barcode.tsx`），掃描用 html5-qrcode。兩者由 `index.html` 以 CDN `<script>` 載入，程式中以 `declare var JsBarcode` / `declare var Html5Qrcode` 使用全域變數，不是 npm 套件。
- Tailwind 同樣由 CDN 載入（`index.html`），沒有 Tailwind 設定檔；直接在 `className` 使用 utility class。
- `useLocalStorage` 的 setter 目前只接受值（型別為 `(value: T) => void`），元件以 `setCards([...cards, x])` 方式更新。
- 已存入 localStorage 的 `Card` 結構與 `CardType` 字串值（`SEVEN_ELEVEN` 等）是使用者資料格式，修改或重新命名時需考慮向下相容或提供遷移。
- `vite.config.ts` 設定 `base: ''`（相對路徑，供 GitHub Pages）、`@` 別名指向專案根目錄、dev server 綁定 `0.0.0.0:3000`。
- 相機掃描需 HTTPS 或 localhost。
- 目前 UI 文字為英文；專案沒有 AI Studio / Gemini 相關內容，不要重新加入。

## 部署

推送到 `main` 後，`.github/workflows/deploy.yml` 以 `npm ci` + `npm run build` 建置並部署到 GitHub Pages。
