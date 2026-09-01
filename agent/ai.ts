import { GoogleGenAI, type Content } from "@google/genai";
import { toolRegistry } from "../tools";
const ai = new GoogleGenAI({
  vertexai: true,
  location: "us-central1",
  project: process.env.GCP_PROJECT,
});

const toolDeclarations = Object.values(toolRegistry).map(
  (tool) => tool.declaration,
);

export async function responseGeneration(conversation: Content[]) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: conversation,
    config: {
      tools: [
        {
          functionDeclarations: toolDeclarations,
        },
      ],
    },
  });

  let calls = response.functionCalls;

  if (!calls || calls.length === 0) {
    process.stdout.write(response.text?.trimEnd() ?? "");
    conversation.push({
      role: "model",
      parts: [{ text: response.text ?? "" }],
    });
    return;
  }

  while (calls && calls.length > 0) {
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

    const finalResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversation,
      config: {
        tools: [
          {
            functionDeclarations: toolDeclarations,
          },
        ],
      },
    });

    calls = finalResponse.functionCalls;
    if (!calls || calls.length === 0) {
      process.stdout.write(finalResponse.text?.trimEnd() ?? "");
      conversation.push({
        role: "model",
        parts: [{text: finalResponse.text ?? ""}]
      })
      return;
    }
  }
}
