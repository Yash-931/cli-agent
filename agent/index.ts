import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { responseGeneration } from "./ai";

console.log("Agent is running...");

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const userInput = await rl.question("You: ");

      if (userInput === "/exit") {
        console.log("Goodbye!");
        break;
      }

      console.log("Agent: ");
      await responseGeneration(userInput);
    }
  } catch (error) {
    console.error("An error occurred " + error);
  } finally {
    rl.close();
  }
}

main();
