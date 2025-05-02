import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { join } from "node:path";
import { homedir } from "node:os";
import type { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { InferenceClient, InferenceProvider } from "@huggingface/inference";
import type { ChatCompletionStreamOutput } from "@huggingface/tasks/src/tasks/chat-completion/inference";

import { ANSI } from "./src/util";
import { Agent } from "./src/Agent";

import * as dotenv from 'dotenv';

export * from "./src/McpClient";
export * from "./src/Agent";
export type { ChatCompletionInputMessageTool, } from "./src/McpClient";

// Load environment variables from .env file
dotenv.config();
const PROVIDER = (process.env.PROVIDER as InferenceProvider) ?? "";
const BASE_URL = "http://harebell.cs.upb.de:8501/v1"
const TOKEN = process.env.TOKEN ?? "token-tentris-upb"
const MODEL_ID = process.env.MODEL_ID ?? "tentris"

const DESKTOP_PATH = join(homedir(), "Desktop");

const prompt = `
You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved, or if you need more info from the user to solve the problem.

IMPORTANT: When working with files and directories, ALWAYS use paths within the user's Desktop directory (${DESKTOP_PATH}). NEVER use system directories like /tmp unless specifically instructed by the user.

If you are not sure about anything pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.
`.trim()


const SERVERS: StdioServerParameters[] = [
	{command: "npx",args: ["-y", "@modelcontextprotocol/server-filesystem", join(homedir(), "Desktop")],env: { MCP_FILESYSTEM_ROOT: DESKTOP_PATH,MCP_FILESYSTEM_DEFAULT_PATH: DESKTOP_PATH}},
	{command: "npx", args: ["@playwright/mcp@latest"]}];


async function main() {

	const agent = new Agent(
		BASE_URL
			? {baseUrl: BASE_URL, model: MODEL_ID, apiKey: TOKEN, servers: SERVERS,prompt}
			: {provider: PROVIDER,model: MODEL_ID,apiKey: TOKEN,servers: SERVERS,prompt});

	const rl = readline.createInterface({ input: stdin, output: stdout });
	let abortController = new AbortController();
	let waitingForInput = false;
	async function waitForInput() {
		waitingForInput = true;
		const input = await rl.question("> ");
		waitingForInput = false;
		return input;
	}
	rl.on("SIGINT", async () => {
		if (waitingForInput) {
			// close the whole process
			await agent.cleanup();
			stdout.write("\n");
			rl.close();
		} else {
			// otherwise, it means a request is underway
			abortController.abort();
			abortController = new AbortController();
			stdout.write("\n");
			stdout.write(ANSI.GRAY);
			stdout.write("Ctrl+C a second time to exit");
			stdout.write(ANSI.RESET);
			stdout.write("\n");
		}
	});
	process.on("uncaughtException", (err) => {
		stdout.write("\n");
		rl.close();
		throw err;
	});

	await agent.loadTools();

	stdout.write(ANSI.BLUE);
	stdout.write(`Agent loaded with ${agent.availableTools.length} tools:\n`);
	// stdout.write(agent.availableTools.map((t) => `- ${t.function.name}`).join("\n"));
	// console.log("Available tools details:", agent.availableTools.map(t => ({name: t.function.name,params: t.function.parameters})));
	// stdout.write(`Agent loaded with ${agent.availableTools.length} tools:\n${agent.availableTools.map(t => `- ${t.function.name}`).join('\n')}\nAvailable tools details: ${JSON.stringify(agent.availableTools.map(t => ({ name: t.function.name, params: t.function.parameters })), null, 2)}\n${ANSI.RESET}\n`);
	stdout.write(ANSI.RESET);
	stdout.write("\n");

	while (true) {
		const input = await waitForInput();
		for await (const chunk of agent.run(input, { abortSignal: abortController.signal })) {
			if ("choices" in chunk) {
				const delta = (chunk as ChatCompletionStreamOutput).choices[0]?.delta;
				if (delta.content) {
					stdout.write(delta.content);
				}
				if (delta.tool_calls) {
					stdout.write(ANSI.GRAY);
					for (const deltaToolCall of delta.tool_calls) {
						if (deltaToolCall.id) {
							stdout.write(`<Tool ${deltaToolCall.id}>\n`);
						}
						if (deltaToolCall.function.name) {
							stdout.write(deltaToolCall.function.name + " ");
						}
						if (deltaToolCall.function.arguments) {
							stdout.write(deltaToolCall.function.arguments);
						}
					}
					stdout.write(ANSI.RESET);
				}
			} else {
				/// Tool call info
				stdout.write("\n\n");
				stdout.write(ANSI.GREEN);
				stdout.write(`Tool[${chunk.name}] ${chunk.tool_call_id}\n`);
				stdout.write(chunk.content);
				stdout.write(ANSI.RESET);
				stdout.write("\n\n");
			}
		}
		stdout.write("\n");
	}
}

main();