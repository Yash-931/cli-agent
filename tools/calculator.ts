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
  },

  execute: (args: any) => {
    const a = Number(args.a);
    const b = Number(args.b);
    const op = String(args.op);

    return executeCalculator(a, b, op);
  },
};
