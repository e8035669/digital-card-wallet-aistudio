# Digital Card Wallet（數位商品卡錢包）

用來儲存 7-11、全家等便利商店「商品卡／禮物卡」的純前端網頁應用。

多數票卡／會員卡 App 一張卡只能存一組條碼，但便利商店商品卡的背面通常有**兩組條碼**（例如 7-11 的 `31-xxxxxxxxxxxx` 與 `xxxxxxxxxxxxxxxx`），結帳時需依序出示。本專案讓一張卡同時保存並顯示兩組條碼，不必再隨身攜帶實體卡。

## 功能

- 新增卡片：選擇卡片類型、命名，輸入或掃描條碼
  - 手動輸入
  - 相機即時掃描
  - 上傳圖片辨識條碼
- 卡片類型（見 [constants.ts](constants.ts)）：

  | 類型 | 條碼數量 |
  | --- | --- |
  | 7-Eleven Merchandise Card | 2 |
  | Library Card | 1 |
  | Generic Card | 1 |

- 卡片列表（依建立時間新到舊排序）、卡片詳情（同畫面顯示兩組條碼）、刪除卡片
- 資料只存在瀏覽器 `localStorage`（key：`digital-wallet-cards`），無後端、無帳號、不上傳任何資料

## 技術架構

- React 19 + TypeScript + Vite 6
- Tailwind CSS（CDN）
- [JsBarcode](https://github.com/lindell/JsBarcode)（CDN）：以 CODE128 將字串繪製成 SVG 條碼
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)（CDN）：相機與圖片掃描
- 沒有路由與狀態管理套件，`App.tsx` 以 `view` 狀態（`list` / `add` / `detail`）切換畫面

```
App.tsx                  畫面切換與卡片 CRUD（狀態來源）
types.ts                 Card、CardType 型別
constants.ts             各卡片類型的名稱、條碼數量與欄位標籤
hooks/useLocalStorage.ts localStorage 持久化 hook
components/
  CardList.tsx           卡片列表 / 空狀態
  AddCard.tsx            新增表單、掃描方式選擇、圖片掃描
  Scanner.tsx            相機掃描（html5-qrcode）
  CardDetail.tsx         卡片詳情，顯示 1~2 組條碼
  Barcode.tsx            JsBarcode 的 React 包裝（CODE128）
  icons/                 SVG 圖示
```

資料模型：

```ts
interface Card {
  id: string;
  name: string;
  type: CardType;
  barcode1: string;
  barcode2: string | null; // 單條碼卡片為 null
  createdAt: string;       // ISO 8601
}
```

### 已知注意事項

- JsBarcode 與 html5-qrcode 由 `index.html` 以 `<script>` 從 CDN 載入並以全域變數使用，離線時無法顯示或掃描條碼。
- `index.html` 內仍有 AI Studio 遺留的 `importmap`，以及 `vite.config.ts` 中的 `GEMINI_API_KEY` 設定，本專案並未使用 Gemini，可於日後清除。
- 相機掃描需要 HTTPS 或 `localhost`（`metadata.json` 宣告了 `camera` 權限）。
- 目前 UI 文字皆為英文，卡片類型尚未包含全家。

## 開發環境（pixi）

本專案使用 [pixi](https://pixi.sh) 提供 Node.js / npm，**請一律透過 `pixi run` 執行 npm 相關指令**，不要使用系統自帶的 node/npm。

```bash
pixi run install     # npm ci，安裝依賴
pixi run dev         # 啟動開發伺服器 http://localhost:3000
pixi run build       # 建置到 dist/
pixi run preview     # 預覽建置結果
pixi run typecheck   # tsc --noEmit
```

需要臨時執行其他指令時：

```bash
pixi run npm install <package>
pixi shell           # 進入含 node/npm 的 shell
```

任務定義在 [pixi.toml](pixi.toml)；`pixi.lock` 與 `package-lock.json` 都應納入版本控制。

## 部署

推送到 `main` 後，[.github/workflows/deploy.yml](.github/workflows/deploy.yml) 會自動建置並部署到 GitHub Pages（`vite.config.ts` 的 `base: ''` 使用相對路徑）。
