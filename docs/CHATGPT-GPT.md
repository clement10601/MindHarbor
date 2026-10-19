# 上架到 ChatGPT（GPT Store）

MindHarbor 目前是貼進 ChatGPT Project 的指示。做成公開的 GPT 之後，別人點連結就能用，也能直接開語音聊天，不用自己複製 SKILL.md。

GPT 要在 ChatGPT 網頁版的 GPT 編輯器裡建立：<https://chatgpt.com/gpts/editor>（需要 Plus 以上方案）。

## 1. 先設定建立者資料（只需一次）

公開到 GPT Store 前，要在 **Settings → Builder profile** 驗證身分：

- 建議用網域驗證 `fezone.tw`：ChatGPT 會給一筆 DNS TXT 紀錄，加到 Cloudflare 的 fezone.tw DNS 後按驗證。GPT 會顯示「By fezone.tw」。
- 也可以只用帳號名稱，但 GPT Store 上會顯示個人姓名。

## 2. Configure 分頁要填的內容

| 欄位 | 內容 |
| --- | --- |
| Name | MindHarbor |
| Description | 像朋友一樣聊天的 AI 陪伴。可以開語音邊做事邊聊，需要時幫你把心情整理成日記。不是心理治療或醫療服務。 |
| Instructions | `skills/zh-TW/SKILL.md` 全文（英文 GPT 用 `skills/en/SKILL.md`） |
| Conversation starters | 我想邊看動畫邊聊天／今天工作有點累，想聊聊／幫我整理今天的心情／I'd like to talk through my day |
| Knowledge | `skills/zh-TW/SKILL.md`、`skills/en/SKILL.md` |
| Capabilities | 全部關閉（Web Search、Canvas、Image Generation、Code Interpreter 都不需要） |
| Actions | 不設定。不連任何外部服務，所以也不需要隱私權政策網址 |
| Profile picture | `site/icon.svg` 匯出成 512×512 PNG |

**字數限制**：Instructions 最多 8,000 字元。v0.5 的 `skills/zh-TW/SKILL.md` 約 2,100 字元、`skills/en/SKILL.md` 約 6,900 字元，都放得下，直接貼全文即可。以後如果超過，Instructions 改放 `docs/QUICKSTART.md` 的精簡版，完整版放在 Knowledge。

**語音**：GPT 預設就能用語音模式。在手機 App 打開 GPT 後按右下角的語音按鈕即可，和現在用 ChatGPT 語音的方式一樣。

## 3. 發布

1. 右上角 **Create／Update** → 選 **GPT Store**，分類選 **Lifestyle**。
2. 發布後複製 GPT 連結（`https://chatgpt.com/g/...`）。
3. 把連結換到專頁 `site/index.html` 的「在 ChatGPT 開始使用」按鈕，以及 README。

## 注意

- OpenAI 的使用政策要求不能把 GPT 包裝成醫療或心理治療服務；說明與開場都要維持「陪伴聊天、非醫療」的定位，危機時引導到 1925／119。
- 使用者和 GPT 的對話存在對方自己的 ChatGPT 帳號。建立者看不到內容，但 GPT Store 會顯示對話次數等統計。
