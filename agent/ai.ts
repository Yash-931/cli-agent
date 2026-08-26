import { GoogleGenAI } from "@google/genai";
import { calculator } from "./tools";

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

  if(calls) {
    const toolResponse = calculator(calls[0]?.args.a, calls[0]?.args.b, calls[0]?.args.op)
  }

  process.stdout.write("\n");
}

await responseGeneration("What is 25 + 15")