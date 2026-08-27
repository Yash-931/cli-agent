import { GoogleGenAI } from "@google/genai";
import { calculator, toolRegistry } from "./tools";

const ai = new GoogleGenAI({
  vertexai: true,
  location: "us-central1",
  project: process.env.GCP_PROJECT,
});

const calculatorDeclaration = {
  name: "calculator",
  description: "Calculate a mathematical expression",
  parameters: {
    type: "OBJECT",
    properties: {
      a: {
        type: "NUMBER",
        description: "The first number",
      },

      b: {
        type: "NUMBER",
        description: "The second number",
      },

      op: {
        type: "STRING",
        description: "The mathematical operation to perform",
        enum: ["add", "subtract", "multiply", "divide"],
      },
    },
  },
};

export async function responseGeneration(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [
        {
          functionDeclarations: [calculatorDeclaration],
        },
      ],
    },
  });


  const calls = response.functionCalls;

  if (calls && calls.length > 0) {
    console.log("Tool called")

    for (const call of calls) {
        const toolName = call.name
        const registeredTool = toolRegistry[toolName];
        
    }
    
    const a = Number(calls[0]?.args.a);
    const b = Number(calls[0]?.args.b);
    const op = String(calls[0]?.args.op);
    const toolResponse = calculator(a, b, op);
    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
      {
        role: "model",
        parts: [
          {
            functionCall: {
              name: calls[0].name,
              args: calls[0].args,
            },
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: calls[0].name,
              response: {
                result: toolResponse,
              },
            },
          },
        ],
      },
    ];

    const finalResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        tools: [
          {
            functionDeclarations: [calculatorDeclaration],
          },
        ],
      },
    });

    console.log(finalResponse.text);
  }

  process.stdout.write("\n");
}

await responseGeneration("25 + 15");
