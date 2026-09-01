import { GoogleGenAI, type Content } from "@google/genai";
import { toolRegistry } from "../tools";
import { SYSTEM_PROMPT } from "../prompt";
const ai = new GoogleGenAI({
  vertexai: true,
  location: "us-central1",
  project: process.env.GCP_PROJECT,
});

const toolDeclarations = Object.values(toolRegistry).map(
  (tool) => tool.declaration,
);

let n = 10;

export async function responseGeneration(conversation: Content[]) {
  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversation,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            functionDeclarations: toolDeclarations,
          },
        ],
      },
    });

    const calls = response.functionCalls;

    if (!calls || calls.length === 0) {
      process.stdout.write(response.text?.trimEnd() ?? "");
      conversation.push({
        role: "model",
        parts: [{ text: response.text ?? "" }],
      });
      break;
    }

    const toolResponses = [];

    for (const call of calls) {
      const toolName = call.name;

      if (!toolName || !(toolName in toolRegistry)) {
        throw new Error(`Unknown tool call: ${toolName}`);
      }

      const registeredTool =
        toolRegistry[toolName as keyof typeof toolRegistry];

      const toolResponse = await registeredTool.execute(call.args);
      toolResponses.push({
        name: toolName,
        result: toolResponse,
      });
    }

    const functionResponsePart = toolResponses.map((res) => ({
      functionResponse: {
        name: res.name,
        response: {
          result: res.result,
        },
      },
    }));

    const functionCallPart = calls.map((call) => ({
      functionCall: {
        name: call.name,
        args: call.args,
      },
    }));

    conversation.push({
      role: "model",
      parts: functionCallPart,
    });

    conversation.push({
      role: "user",
      parts: functionResponsePart,
    });
  }

  const limitMessage =
    "I wasn't able to finish this within the tool-call limit — could you rephrase or simplify the request?";
  process.stdout.write(limitMessage);
  conversation.push({
    role: "model",
    parts: [{ text: limitMessage }],
  });
  return;
}
