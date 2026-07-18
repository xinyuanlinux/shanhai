const MAX_MESSAGE_LENGTH = 1600;
const MAX_HISTORY_MESSAGES = 8;

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(env) }
  });
}

export default {
  async fetch(request, env) {
    const headers = cors(env);
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, env);
    if (request.headers.get("Origin") !== env.ALLOWED_ORIGIN) return json({ error: "Origin not allowed" }, 403, env);

    try {
      const { message, history = [] } = await request.json();
      if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
        return json({ error: "请输入不超过 1600 字的内容。" }, 400, env);
      }

      const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];
      const input = [
        ...safeHistory
          .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
          .map(item => ({ role: item.role, content: item.content.slice(0, MAX_MESSAGE_LENGTH) })),
        { role: "user", content: message.trim() }
      ];

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-5",
          instructions: "你是“山海助手”，是久歌山海个人网站里的温和聊天伙伴。使用简洁自然的中文回答；不要假装知道站长的私人信息；遇到不确定的信息要坦诚说明。",
          input,
          store: false
        })
      });

      const data = await response.json();
      if (!response.ok) return json({ error: data.error?.message || "服务暂时不可用" }, response.status, env);
      const reply = (data.output || []).flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("")
        .trim();
      return json({ reply: reply || "抱歉，我暂时没有生成回复。" }, 200, env);
    } catch {
      return json({ error: "连接出现问题，请稍后再试。" }, 500, env);
    }
  }
};