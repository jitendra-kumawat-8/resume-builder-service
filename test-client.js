const WebSocket = require("ws");
const readline = require("readline");

const ws = new WebSocket("ws://localhost:8080");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

ws.on("open", () => {
  console.log("🟢 Connected to chat server!");
  console.log('Type your message and press Enter (type "quit" to exit):\n');
  askForInput();
});

ws.on("message", (data) => {
  const message = data.toString();
  if (message === "[DONE]") {
    console.log("\n✅ Response complete\n");
    askForInput();
  } else if (message.startsWith("[ERROR]")) {
    console.log(`\n❌ Error: ${message}\n`);
    askForInput();
  } else {
    process.stdout.write(message);
  }
});

ws.on("close", () => {
  console.log("\n🔴 Disconnected from server");
  rl.close();
});

ws.on("error", (error) => {
  console.error("❌ WebSocket error:", error.message);
  rl.close();
});

function askForInput() {
  rl.question("You: ", (input) => {
    if (input.toLowerCase() === "quit") {
      ws.close();
      return;
    }

    ws.send(JSON.stringify({ prompt: input }));
    console.log("\nAssistant: ");
  });
}
