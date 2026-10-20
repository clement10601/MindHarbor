# 上架到 ChatGPT（Plugin 目錄）

> 原本的計畫是做成 GPT 上 GPT Store，但 OpenAI 已經改了規則（2026-10 確認）：
>
> - **個人帳號（Free／Go／Plus／Pro）不能再建立或發佈新的 GPT**，只剩既有 GPT 可以繼續用。
> - 所有 custom GPT 預定 **2026-12-11 退場**，官方建議改做 **Plugin**。
>
> 來源：[Sharing and publishing GPTs](https://help.openai.com/en/articles/8798878)、[Custom GPT retirement FAQ](https://help.openai.com/en/articles/20001519)
>
> 所以 MindHarbor 改走 **ChatGPT Plugin 目錄**。MindHarbor 只有對話指示、不連外部服務，正好是「只含 skill 的 plugin」，不需要架 MCP 伺服器。

使用者在 ChatGPT 左側 **Plugins** 找到 MindHarbor、按安裝，之後對話中 ChatGPT 就會在相關時自動用它，也可以用 `@MindHarbor` 叫出來。

## 0. 先自己試（建議）

送審前先確認 skill 版的表現跟 Project 版一樣，特別是**語音模式**（官方文件沒有寫 plugin 的 skill 在語音模式一定會被套用，要實測）。

1. ChatGPT 左側 **Plugins** → 安裝 **Plugin Creator**。
2. 開新對話輸入 `@plugin-creator 建立一個叫 MindHarbor 的 plugin，只放一個 skill`，把 `skills/zh-TW/SKILL.md` 全文貼上。
3. 用 `@MindHarbor` 和語音模式各聊幾輪，對照 Project 版的感覺。

註：建立私人 plugin／skill 的權限依方案而定，Plus 帳號如果看不到這個選項，就直接走下面的公開上架流程，上架後第一時間自己安裝實測。

## 1. 驗證發佈者身分（只需一次）

公開上架一定要是驗證過的個人或公司。

1. 登入 [OpenAI Platform](https://platform.openai.com/settings/organization/general)（和 ChatGPT 同一個帳號即可）。
2. 在 **Organization → General** 完成驗證：
   - 用 **Fezone Ltd.** 做商業驗證，目錄上會顯示公司名（建議，和 LICENSE 的版權人一致）。
   - 或做個人驗證，會顯示個人姓名。

## 2. 網站要先補的頁面

送審規定要有可公開瀏覽、且看得出是同一個發佈者的網址：

| 欄位 | 建議網址 | 內容 |
| --- | --- | --- |
| Website | `https://mindharbor.fezone.tw/` | 現有專頁 |
| Privacy policy | `https://mindharbor.fezone.tw/privacy/` | **必填**。要寫清楚：收集哪些資料、用途、給誰、保存多久、使用者能怎麼刪除。MindHarbor 本身不收對話；若上線匿名回饋表單，要寫明表單收什麼、存在哪、多久刪 |
| Terms of service | `https://mindharbor.fezone.tw/terms/` | 非醫療服務聲明、免責、危機時請撥 1925／1995／119 |
| Support | 回饋表單或 email | **必填**，使用者找得到你的聯絡方式 |

## 3. 打包 plugin ZIP

套件來源在 `plugin/`，跑 `scripts/build-plugin.sh` 會從 `skills/` 組好並輸出 `dist/mindharbor-plugin.zip`，可直接上傳。結構如下：

```
mindharbor-plugin/
├── plugin.json
├── skills/
│   └── mindharbor/
│       └── SKILL.md        # 開頭要有 YAML 的 name 和 description
└── assets/
    ├── icon.png  icon-dark.png   # composer 小圖示
    └── logo.png  logo-dark.png   # 目錄大圖，從 site/icon.svg 匯出
```

`SKILL.md` 開頭要加：

```yaml
---
name: mindharbor
description: 像朋友一樣陪使用者聊天、整理心情與寫日記的對話方式。使用者想聊聊、抒發情緒或整理今天的心情時使用。不是心理治療或醫療服務。
---
```

`plugin.json` 的重點欄位（格式見 [Submit and publish](https://developers.openai.com/plugins/deploy/submission)）：

| 欄位 | 內容 |
| --- | --- |
| `name` | `mindharbor` |
| `displayName` | MindHarbor |
| `shortDescription` | 像朋友一樣聊天的陪伴對話 |
| `longDescription` | 可以開語音邊做事邊聊，需要時幫你把心情整理成日記。不是心理治療或醫療服務。 |
| `developerName` | Fezone Ltd. |
| `category` | Lifestyle |
| `defaultPrompt` | 我想邊看動畫邊聊天／今天工作有點累，想聊聊／幫我整理今天的心情 |
| `websiteURL`／`privacyPolicyURL`／`termsOfServiceURL`／`supportURL` | 第 2 步的網址 |
| `author.email` | 收審查通知與使用者聯絡的信箱 |
| `license` | MIT |

只含 skill 的 plugin 不需要 MCP 設定、網域驗證檔或審查測試帳號。

## 4. 上傳、送審、發佈

1. 打開 [platform.openai.com/plugins](https://platform.openai.com/plugins) → **Upload new or existing plugin**。
2. 選第 1 步驗證過的 **Developer identity**，上傳 ZIP。
3. 在 **Metadata & Skills** 看自動檢查結果，有問題就改檔案重新上傳 ZIP。
4. **Submit for review**，勾選政策聲明。審查結果會寄 email，可在 **Review status** 追蹤。被退件就照信裡的原因修改再送，或直接回信申覆。
5. 通過後按 **Publish plugin**，自己決定上架時間。之後改 SKILL.md 要上傳新版 ZIP 再審一次。

## 5. 心理健康類內容的政策重點

[Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines) 裡和 MindHarbor 有關的：

- **要適合 13–17 歲使用者**，不能鎖定 13 歲以下。內容維持一般陪伴對話，不碰成人內容。
- **不能收集受保護的健康資訊（PHI）**，也不能收集敏感個資，除非是功能必需、取得同意並明確告知。MindHarbor 不存對話，維持這樣就好；日記只存在使用者自己的 ChatGPT 或他自己連的 Notion／Drive。
- **名稱和描述要準確**：不寫「治療」「診斷」「諮商師」，維持「陪伴聊天、非醫療」定位。
- SKILL.md 第六節「安全、界線與品質」的危機處理要保留。目前只寫「當地緊急服務」，建議 zh-TW 版補上具體號碼：1925 安心專線、1995 生命線、119。

## 6. 上架後

1. 複製 plugin 在目錄上的連結。
2. 把專頁 `site/index.html`、`site/en/index.html` 的「在 ChatGPT 開始使用」按鈕和 README 換成這個連結（Project 版的設定步驟可以留著當備案）。
3. 使用者回饋從專頁回饋表單和 support email 進來。
