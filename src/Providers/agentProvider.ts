/* eslint-disable @typescript-eslint/no-explicit-any */



import {
    AgentKit,
    CdpWalletProvider,
    wethActionProvider,
    walletActionProvider,
    erc20ActionProvider,
    cdpApiActionProvider,
    cdpWalletActionProvider,
    pythActionProvider,
    basenameActionProvider,
  } from "@coinbase/agentkit";
  import { getLangChainTools } from "@coinbase/agentkit-langchain";
  import { HumanMessage } from "@langchain/core/messages";
  import { MemorySaver } from "@langchain/langgraph";
  import { createReactAgent } from "@langchain/langgraph/prebuilt";
  import { ChatOpenAI } from "@langchain/openai";
  import * as dotenv from "dotenv";
  import * as fs from "fs";
  import * as readline from "readline";
  
  dotenv.config();
  const WALLET_DATA_FILE = process.env.NODE_ENV === 'production' 
  ? '/tmp/wallet_data.txt'  // Use appropriate path for production
  : './wallet_data.txt';
  validateEnvironment();
  
  // const WALLET_DATA_FILE = "wallet_data.txt";
  
  /**
   * Validates the required environment variables are set
   *
   * @throw {Error} - If any of the required environment variables are not set
   * @returns {void}
   */
  function validateEnvironment(): void {
    const missingVars: string[] = [];
  
    // Check for required environment variables
    const requiredVars = [
      "OPENAI_API_KEY",
      "CDP_API_KEY_NAME",
      "CDP_API_KEY_PRIVATE_KEY",
    ];
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });
  
    // Exit if any required environment variables are missing
    if (missingVars.length > 0) {
      console.error("Error: Required environment variables are missing:");
      missingVars.forEach((varName) => {
        console.error(`${varName}=your_${varName.toLowerCase()}_here`);
        process.exit(1);
      });
    }
  
    // Warn about optional NETWORK_ID
    if (!process.env["NETWORK_ID"]) {
      console.warn(
        "Warning: NETWORK_ID is not set. Defaulting to base-sepolia testnet."
      );
    }
  }
  
  /**
   * Initialize the Agent with CDP Agentkit
   *
   * @returns Agent executor & config
   */
  async function initializeAgent() {
    try {
      // Initialize LLM
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
      });
  
      let walletDataStr: string | null = null;
  
      // Read existing wallet data if available
      if (fs.existsSync(WALLET_DATA_FILE)) {
        try {
          walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
        } catch (error) {
          console.error("Error reading wallet data file: ", error);
        }
      }
  
      // Configure CDP Wallet Provider
      const config = {
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
        cdpWalletData: walletDataStr || undefined,
        networkId: process.env.NETWORK_ID || "base-sepolia",
      };
      const walletProvider = await CdpWalletProvider.configureWithWallet(config);
  
      // Initialize AgentKit
      const agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [
          wethActionProvider(),
          pythActionProvider(),
          walletActionProvider(),
          erc20ActionProvider(),
          basenameActionProvider(),
          cdpApiActionProvider({
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
              /\\n/g,
              "\n"
            ),
          }),
          cdpWalletActionProvider({
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
              /\\n/g,
              "\n"
            ),
          }),
        ],
      });
      const tools = await getLangChainTools(agentKit);
  
      // Store buffered conversation history in memory
      const memory = new MemorySaver();
      const agentConfig = {
        configurable: { thread_id: "SYNX" },
      };
  
      // Create React Agent using the LLM & CDP Agentkit tools
      const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
                You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
                empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
                faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
                funds from the user. Before executing your first action, get the wallet details to see what network 
                you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
                asks you to do something you can't do with your currently available tools, you must say so, and 
                encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
                docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
                restating your tools' descriptions unless it is explicitly requested.
                `,
      });
  
      // Save wallet data
      const exportedWallet = await walletProvider.exportWallet();
      fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
      return { agent, config: agentConfig };
    } catch (error) {
      console.error("Failed to initialize agent: ", error);
      throw error;
    }
  }
  
  /**
   * Run the agent autonomously with specified intervals
   */
  async function runAutonomousMode(agent: any, config: any, interval = 10) {
    console.log("Starting autonomous mode...");
  
    while (true) {
      try {
        const thought =
          "Be creative and do something interesting on the blockchain. " +
          "Choose an action or set of actions and execute it that highlights your abilities.";
  
        const stream = await agent.stream(
          { message: [new HumanMessage(thought)] },
          config
        );
  
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
          }
          console.log("----------------");
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error: ", error.message);
        }
        process.exit(1);
      }
    }
  }
  
  /**
   * Run the agent interactively based on user input
   */
  async function runChatMode(agent: any, config: any) {
    console.log("Starting chat mode... Type 'exit' to end.");
  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));
  
    try {
      while (true) {
        const userInput = await question("\nPrompt: ");
  
        if (userInput.toLowerCase() === "exit") {
          break;
        }
  
        const stream = await agent.stream(
          { messages: [new HumanMessage(userInput)] },
          config
        );
  
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
          }
          console.log("-------------------");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  }
  
  /**
   * Choose whether to run in autonomous or chat mode
   */
  async function chooseMode(): Promise<"chat" | "auto"> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));
  
    while (true) {
      console.log("\nAvailable modes:");
      console.log("1. chat    - Interactive chat mode");
      console.log("2. auto    - Autonomous action mode");
  
      const choice = (await question("\nChoose a mode (enter number or name): "))
        .toLowerCase()
        .trim();
  
      if (choice === "1" || choice === "chat") {
        rl.close();
        return "chat";
      } else if (choice === "2" || choice === "auto") {
        rl.close();
        return "auto";
      }
      console.log("Invalid choice. Please try again.");
    }
  }
  
  /**
   * Main entry point
   */
  async function main() {
    try {
      const { agent, config } = await initializeAgent();
      const mode = await chooseMode();
  
      if (mode === "chat") {
        await runChatMode(agent, config);
      } else {
        await runAutonomousMode(agent, config);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
  
  // Start the agent when running directly
  if (require.main === module) {
    console.log("Starting Agent...");
    main().catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
  }

  export { initializeAgent };
  