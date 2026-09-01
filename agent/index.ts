import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { responseGeneration } from "./ai";
import { type Content } from "@google/genai";

console.log("Agent is running...");

// TODOS:
// - After conversation reaches a certain length we will need to summarize that as well

async function main() {
  const rl = readline.createInterface({ input, output });
  const conversation: Content[] = [];

  while (true) {
    try {
      const userInput = await rl.question("You: ");
      if (userInput === "/exit") {
        console.log("Goodbye!");
        break;
      }
      process.stdout.write("Agent: ");

      conversation.push({
        role: "user",
        parts: [{ text: userInput }],
      });

      await responseGeneration(conversation);
      console.log();
    } catch (error) {
      console.error("An error occured" + error);
    }
  }

  rl.close();
  process.exit(0);
}

main();
