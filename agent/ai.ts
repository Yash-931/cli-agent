import { GoogleGenAI } from "@google/genai";
import { toolRegistry } from "../tools";
const ai = new GoogleGenAI({
  vertexai: true,
  location: "us-central1",
  project: process.env.GCP_PROJECT,
});

const toolDeclarations = Object.values(toolRegistry).map(
  (tool) => tool.declaration,
);

export async function responseGeneration(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [
        {
          functionDeclarations: toolDeclarations,
        },
      ],
    },
  });

  const calls = response.functionCalls;

  const toolResponses = [];

  if (!calls || calls.length === 0) {
    console.log(response.text);
    return;
  }

  for (const call of calls) {
    const toolName = call.name;

    if (!toolName || !(toolName in toolRegistry)) {
      throw new Error(`Unknown tool call: ${toolName}`);
    }

    const registeredTool = toolRegistry[toolName];

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

  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
    {
      role: "model",
      parts: functionCallPart,
    },
    {
      role: "user",
      parts: functionResponsePart,
    },
  ];

  const finalResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      tools: [
        {
          functionDeclarations: toolDeclarations,
        },
      ],
    },
  });

  console.log(finalResponse.text);
}
