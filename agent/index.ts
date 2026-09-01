import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { responseGeneration } from "./ai";

console.log("Agent is running...");

async function main() {
  const rl = readline.createInterface({ input, output });

  while (true) {
    try {
      const userInput = await rl.question("You: ");
      if (userInput === "/exit") {
        console.log("Goodbye!");
        break;
      }
      process.stdout.write("Agent: ");
      await responseGeneration(userInput);
      console.log()
    } catch (error) {
      console.error("An error occured" + error);
    }
  }

  rl.close()
  process.exit(0);
}

main();
