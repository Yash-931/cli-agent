import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { responseGeneration } from "./ai";

console.log("Agent is running...");

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const userInput = await rl.question("You: ");
      rl.pause();
      if (userInput === "/exit") {
        console.log("Goodbye!");
        break;
      }
      process.stdout.write("Agent: ");
      await responseGeneration(userInput);

      rl.resume()
    }
  } catch (error) {
    console.error("An error occurred " + error);
  } finally {
    rl.close();
  }
}

main();
