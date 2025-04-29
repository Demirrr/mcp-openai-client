import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { homedir } from "node:os";
import { join } from "node:path";
import { InferenceClient } from "@huggingface/inference";  // HuggingFace API
import type { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Agent } from "./src/Agent";

const PROVIDER = "http://harebell.cs.upb.de:8501/v1";
const TOKEN = "token-tentris-upb";  // Replace with real token
const MODEL_ID = "tentris";
const client = new InferenceClient(TOKEN).endpoint(PROVIDER);



const SERVERS: StdioServerParameters[] = [
	{
		// Filesystem "official" mcp-server with access to your Desktop
		command: "npx",
		args: ["-y", "@modelcontextprotocol/server-filesystem", join(homedir(), "Desktop")],
	},
	{
		// Playwright MCP
		command: "npx",
		args: ["@playwright/mcp@latest"],
	},
];

// Utility ANSI codes for colorful output
const ANSI = {
  BLUE: "\x1b[34m",
  GREEN: "\x1b[32m",
  RESET: "\x1b[0m",
};

async function chatWithLLM() {
  for (const server of SERVERS) {
    console.log(server);
  }
  
  if (!process.env.HF_TOKEN) {
    console.error("Error: HF_TOKEN environment variable is not set");
    return;
  }
  
  const agent = new Agent({provider: PROVIDER, 
    model: MODEL_ID,
    apiKey: process.env.HF_TOKEN,
    servers: SERVERS,
  });

  // Set up readline interface for CLI interaction
  const rl = readline.createInterface({ input: stdin, output: stdout });
  
  await agent.loadTools();

	stdout.write(ANSI.BLUE);
	stdout.write(`Agent loaded with ${agent.availableTools.length} tools:\n`);
	stdout.write(agent.availableTools.map((t) => `- ${t.function.name}`).join("\n"));
	stdout.write(ANSI.RESET);
	stdout.write("\n");

  // Display initial information
  stdout.write(ANSI.BLUE + "Welcome to the LLM CLI! Type 'exit' to quit." + ANSI.RESET);
  stdout.write("\n");

  // Loop for user input
  while (true) {
    const input = await rl.question("> ");
    if (input.trim().toLowerCase() === "exit") {
      console.log(ANSI.GREEN + "Goodbye!" + ANSI.RESET);
      rl.close();
      break;
    }

    try {
      const response = await client.chatCompletion({
        model: MODEL_ID,
        messages: [{ role: "user", content: input }],
        max_tokens: 512,
      });

      // Output LLM response
      console.log(ANSI.BLUE + "LLM: " + ANSI.RESET + response.choices[0].message.content);
    } catch (error) {
      console.error("Error with the LLM:", error);
    }
  }
}

// Run the chat function
chatWithLLM().catch(console.error);
