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
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

function validateEnvironment(): void {
  const requiredVars = [
      "OPENAI_API_KEY",
      "CDP_API_KEY_NAME",
      "CDP_API_KEY_PRIVATE_KEY",
  ];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars.join(", "));
      process.exit(1);
  }

  if (!process.env.NETWORK_ID) {
      console.warn("NETWORK_ID not set, using base-sepolia");
  }
}

export async function initializeAgent({ userId }: { userId: string }) {
  validateEnvironment();

  try {
      // Check for existing wallet first
      const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { walletId: true, seed: true, networkId: true }
      });

      if (!user) {
          throw new Error("User not found");
      }

      console.log('Existing wallet data:', user);

      const apiKeyName = process.env.CDP_API_KEY_NAME!;
      const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, '\n');
      const networkId = process.env.NETWORK_ID || 'base-sepolia';

      // Construct config with wallet details if available
      const config = {
        apiKeyName: process.env.CDP_API_KEY_NAME!,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        networkId: process.env.NETWORK_ID || 'base-sepolia',
        cdpWalletData: user.walletId
          ? JSON.stringify({
              walletId: user.walletId,
              seed: user.seed,
              networkId: user.networkId,
            })
          : undefined,
      };
      

      console.log('Config:', config);      

      // Create or restore wallet
      const walletProvider = await CdpWalletProvider.configureWithWallet(config);

      // Persist new wallet if created (only if walletId doesn't exist)
      if (!user?.walletId) {
          const newWallet = await walletProvider.exportWallet();

          await prisma.user.update({
              where: { id: userId },
              data: {
                  walletId: newWallet.walletId,
                  networkId: newWallet.networkId,
                  seed: newWallet.seed
              }
          });
          console.log('Persisted new wallet:', newWallet);
      }
      const walletAddress = await walletProvider.getAddress();
      console.log('Wallet address:', walletAddress);

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
                  apiKeyName: process.env.CDP_API_KEY_NAME!,
                  apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, '\n'),
              }),
              cdpWalletActionProvider({
                  apiKeyName: process.env.CDP_API_KEY_NAME!,
                  apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, '\n'),
              }),
          ],
      });

      const tools = await getLangChainTools(agentKit);
      const memory = new MemorySaver();

      return createReactAgent({
          llm: new ChatOpenAI({ model: "gpt-4-0125-preview" }),
          tools,
          checkpointSaver: memory,
          messageModifier: `
      You are a helpful onchain agent using Coinbase Developer Platform.
      Be concise and focus on practical blockchain interactions.
      Mention docs.cdp.coinbase.com for advanced features.
    `,
      });

  } catch (error: any) {
      console.error("Agent initialization failed:", error);

      if (error.code === 'P2002') {
          console.error("Wallet conflict detected");
          throw new Error("Wallet already exists for another user");
      }

      throw error;
  }
}
