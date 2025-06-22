import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { systemPrompt, userPrompt } from "./prompt";

const PORT = Number(process.env.PORT) || 8080;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;
const MODEL = "gpt-4o-mini";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Add middleware for parsing JSON
app.use(express.json());

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "resume-builder",
    websocket: "available",
  });
});

// Root endpoint with basic info
app.get("/", (req, res) => {
  res.json({
    service: "Resume Builder - AI-Powered WebSocket Bridge",
    version: "1.0.0",
    websocket: `ws://${req.get("host")}`,
    health: `http://${req.get("host")}/health`,
  });
});

type ClientMsg = { prompt: string };
type Message = { role: "system" | "user" | "assistant"; content: string };

wss.on("connection", (ws) => {
  console.log("🟢 New WebSocket connection established");

  const chatHistory: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  ws.on("message", async (data) => {
    const { prompt } = JSON.parse(data.toString()) as ClientMsg;
    if (!prompt?.trim()) return;

    chatHistory.push({ role: "user", content: prompt });

    try {
      let fullResponse = "";
      for await (const token of streamFromOpenAI(chatHistory)) {
        ws.send(token); // send token-by-token
        fullResponse += token;
      }
      chatHistory.push({ role: "assistant", content: fullResponse });
      ws.send("[DONE]"); // simple sentinel
    } catch (err) {
      console.error("Error in WebSocket message handling:", err);
      ws.send(`[ERROR] ${(err as Error).message}`);
    }
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`🟢 Resume Builder WebSocket server running on port ${PORT}`);
  console.log(`🟢 Health check available at http://localhost:${PORT}/health`);
  console.log(`🟢 WebSocket endpoint available at ws://localhost:${PORT}`);
});

/** Proxy OpenAI streaming response as an async generator of tokens */
async function* streamFromOpenAI(messages: Message[]): AsyncGenerator<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: messages,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`OpenAI HTTP ${res.status}`);
  }

  // OpenAI's stream is Server-Sent-Events style ("data: …\n\n")
  const decoder = new TextDecoder();
  let buffer = "";

  // Use the async iterator from the ReadableStream
  for await (const chunk of res.body as any) {
    buffer += decoder.decode(chunk, { stream: true });
    for (;;) {
      const nl = buffer.indexOf("\n");
      if (nl === -1) break;
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);

      if (!line.startsWith("data:")) continue;
      const payload = line.replace("data:", "").trim();
      if (payload === "[DONE]") return;

      const json = JSON.parse(payload) as { choices: any[] };
      const token = json.choices[0]?.delta?.content;
      if (token) yield token;
    }
  }
}
