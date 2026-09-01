import { Type } from "@google/genai";

function executeCalculator(a: number, b: number, op: string) {
  if (op === "add") {
    return a + b;
  } else if (op === "multiply") {
    return a * b;
  } else if (op === "subtract") {
    return a - b;
  } else if (op === "divide") {
    if (b === 0) {
      throw new Error("Cannot divide by zero")
    }
    return a / b;
  } else {
    throw new Error("Invalid operation");
  }
}

export const calculator = {
  declaration: {
    name: "calculator",
    description: "Calculate a basic mathematical expression. Supports addition, multiplication, division, subtraction of two numbers. Can use this tool multiple times breaking a complex mathematical expression and solving it in parts",
    parameters: {
      type: Type.OBJECT,
      properties: {
        a: {
          type: Type.NUMBER,
          description: "The first number",
        },

        b: {
          type: Type.NUMBER,
          description: "The second number",
        },

        op: {
          type: Type.STRING,
          description: "The mathematical operation to perform",
          enum: ["add", "subtract", "multiply", "divide"],
        },
      },
    },
  },

  execute: (args: any) => {
    const a = Number(args.a);
    const b = Number(args.b);
    const op = String(args.op);

    return executeCalculator(a, b, op);
  },
};
