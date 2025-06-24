import mongoose from "mongoose";

// MongoDB connection string - should be in environment variables
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/resume-builder";

// Prompt Schema
const promptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["systemPrompt", "userPrompt"],
  },
  prompt: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export const Prompt = mongoose.model("prompts", promptSchema);

// Database connection function
export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🟢 Connected to MongoDB successfully");
  } catch (error) {
    console.error("🔴 MongoDB connection error:", error);
    process.exit(1);
  }
}

// Function to get active prompts from database
export async function getPrompts() {
  try {
    const systemPromptDoc = await Prompt.findOne({
      name: "systemPrompt",
      isActive: true,
    });
    const userPromptDoc = await Prompt.findOne({
      name: "userPrompt",
      isActive: true,
    });

    if (!systemPromptDoc || !userPromptDoc) {
      throw new Error("Required active prompts not found in database");
    }

    return {
      systemPrompt: systemPromptDoc.prompt,
      userPrompt: userPromptDoc.prompt,
    };
  } catch (error) {
    console.error("Error fetching prompts from database:", error);
    throw error;
  }
}
