# Resume Builder - AI-Powered WebSocket Bridge

A TypeScript WebSocket server that acts as a bridge for an AI-powered resume builder, conducting conversational interviews to gather information for creating high-impact resume bullet points.

## Features

- Real-time WebSocket communication
- OpenAI GPT-4 integration for intelligent resume assistance
- Conversational interview process to gather project details
- Automatic generation of ATS-friendly resume bullet points

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=8080
NODE_ENV=development
```

3. Start the development server:

```bash
npm run dev
```

The server will start on `ws://localhost:8080`

## Deployment on Render

### Prerequisites

- OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Deployment Steps

1. **Connect your repository to Render:**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub/GitLab repository

2. **Configure the service:**

   - **Name:** resume-builder (or your preferred name)
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Set Environment Variables:**

   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render will set this automatically)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Environment Variables

| Variable         | Description                          | Required | Default     |
| ---------------- | ------------------------------------ | -------- | ----------- |
| `OPENAI_API_KEY` | Your OpenAI API key                  | Yes      | -           |
| `PORT`           | Server port                          | No       | 8080        |
| `NODE_ENV`       | Environment (development/production) | No       | development |

## API Usage

The server exposes a WebSocket endpoint that accepts JSON messages with the following format:

```json
{
  "prompt": "Your message here"
}
```

The server will respond with streaming tokens from the AI assistant.

## Project Structure

```
resume-builder/
├── src/
│   ├── server.ts      # Main WebSocket server
│   └── prompt.ts      # AI system and user prompts
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── render.yaml        # Render deployment configuration
└── README.md          # This file
```

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server

## License

MIT
