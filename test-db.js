const mongoose = require("mongoose");

// MongoDB connection string - should be in environment variables
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/resume-builder";

// Prompt Schema
const promptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ["systemPrompt", "userPrompt"],
  },
  content: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Prompt = mongoose.model("Prompt", promptSchema);

async function testDatabase() {
  try {
    console.log("🔍 Testing MongoDB connection...");
    console.log("Connection string:", MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");

    // Test fetching prompts
    console.log("\n🔍 Testing prompt retrieval...");
    const systemPrompt = await Prompt.findOne({
      name: "systemPrompt",
      isActive: true,
    });
    const userPrompt = await Prompt.findOne({
      name: "userPrompt",
      isActive: true,
    });

    if (systemPrompt) {
      console.log(
        "✅ Found systemPrompt:",
        systemPrompt.content.substring(0, 100) + "..."
      );
    } else {
      console.log("❌ No active systemPrompt found");
    }

    if (userPrompt) {
      console.log(
        "✅ Found userPrompt:",
        userPrompt.content.substring(0, 100) + "..."
      );
    } else {
      console.log("❌ No active userPrompt found");
    }

    // List all prompts in the collection
    console.log("\n📋 All prompts in collection:");
    const allPrompts = await Prompt.find({});
    allPrompts.forEach((prompt) => {
      console.log(`- ${prompt.name} (active: ${prompt.isActive})`);
    });
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

testDatabase();
