/**
 * OpenRouter API Helper
 * OpenRouter allows accessing models like Google Gemini 2.5 Flash, GPT-4o-mini, Claude 3.5 Haiku, etc.
 */

export const askOpenRouter = async (
  messages,
  model = "google/gemini-2.5-flash",
  systemPrompt = "You are AgriSathi AI assistant. Helpful, friendly, expert in Indian farming, APMC mandi rates, crops, and agriculture market trading."
) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "YOUR_OPENROUTER_API_KEY_HERE") {
    throw new Error("OpenRouter API key is not configured in .env (VITE_OPENROUTER_API_KEY).");
  }

  const payloadMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://agri-sathi.vercel.app",
      "X-Title": "AgriSathi Platform",
      "Content-Type": "application.json"
    },
    body: JSON.stringify({
      model: model,
      messages: payloadMessages,
      temperature: 0.7,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `OpenRouter HTTP ${response.status} Error`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response received from OpenRouter AI.";
};
