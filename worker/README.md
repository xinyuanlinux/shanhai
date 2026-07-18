# 山海助手 · Cloudflare Worker

这个 Worker 把 GitHub Pages 的聊天窗口安全连接到 OpenAI Responses API。API Key 只存于 Cloudflare，不会进入网页或 GitHub。

## 部署

1. 安装 Node.js 后，在本目录执行：

   `npx wrangler login`
   `npx wrangler deploy`

2. 按提示登录 Cloudflare。部署完成后会得到形如 `https://shanhai-chat.<你的子域>.workers.dev` 的地址。
3. 设置密钥（不要提交或发送密钥）：

   `npx wrangler secret put OPENAI_API_KEY`

4. 将 Worker 地址填到仓库根目录的 `chat-config.js` 中的 `window.SHANHAI_CHAT_ENDPOINT`，提交后聊天窗口即可使用。

## 安全说明

- Worker 仅接受来自 `https://xinyuanlinux.github.io` 的 POST 请求。
- 消息长度和历史条数已限制；公开网站上线前，建议在 Cloudflare 控制台再设置 Rate Limiting，以防止他人消耗你的 API 额度。
- 如需变更模型，修改 `wrangler.toml` 的 `OPENAI_MODEL` 后重新部署。