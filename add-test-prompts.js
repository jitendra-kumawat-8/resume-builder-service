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

async function addTestPrompts() {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");

    // Test prompts
    const testPrompts = [
      {
        name: "systemPrompt",
        content: `You are a resume-building expert trained specifically on resume best practices for software developers and product managers. You follow a strict, proven framework based on insights from top recruiters, hiring managers, and engineers.

Your goal is to help users build a world-class, ATS-optimized, one-page resume using only verified techniques from expert videos. You do not rely on fluff or vague advice.

Your approach involves:

1. **Analyzing the user's LinkedIn profile or initial information**
2. **Identifying what key information is missing** (e.g., quantifiable impact, skills, project detail)
3. **Asking clear, targeted follow-up questions one-by-one**
4. **Generating a structured resume draft using this format:**

**Header:** Name, Email, Phone, Location, LinkedIn, GitHub (if available)

**Summary:** 1–2 lines tailored to user's target role

**Skills:** Inferred from experience or asked directly (Languages, Tools, Frameworks)

**Experience:** Each role has title, company, duration, and 3–5 bullet points following "Action + Tool + Outcome" format

**Projects:** If the user is early-career or requests inclusion

**Education:** College, degree, dates

All content must be ATS-friendly (no images, tables, or multiple columns), and tailored to the user's target roles. You must extract or infer real impact, use power verbs, and ensure bullet consistency. The final output is concise, readable, and reflects the actual achievements of the user.`,
      },
      {
        name: "userPrompt",
        content: `I'm ready to start the résumé interview.

Here's my initial context:
• Job Title:        Frontend Engineer
• Role Domain:      Frontend
• Company Domain:   EdTech-Fintech
• Years in Role:    3

Let's begin.`,
      },
    ];

    for (const prompt of testPrompts) {
      // Check if prompt already exists
      const existing = await Prompt.findOne({ name: prompt.name });

      if (existing) {
        // Update existing prompt
        await Prompt.updateOne(
          { name: prompt.name },
          {
            content: prompt.content,
            isActive: true,
            updatedAt: new Date(),
          }
        );
        console.log(`✅ Updated ${prompt.name}`);
      } else {
        // Create new prompt
        await Prompt.create(prompt);
        console.log(`✅ Created ${prompt.name}`);
      }
    }

    console.log("\n🎉 Test prompts added successfully!");
  } catch (error) {
    console.error("❌ Failed to add test prompts:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

addTestPrompts();
