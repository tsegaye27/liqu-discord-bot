import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  Interaction,
  ChatInputCommandInteraction,
} from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const botContext = process.env.BOT_CONTEXT;
if (!botContext) {
  console.warn("Warning: BOT_CONTEXT not found in .env file.");
}

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

if (!token || !clientId || !geminiApiKey) {
  console.error(
    "Error: DISCORD_TOKEN, CLIENT_ID, or GEMINI_API_KEY not found in .env file.",
  );
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const COMMAND_NAME = "ask";

const rest = new REST({ version: "10" }).setToken(token);

async function registerCommand() {
  const command = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Ask Liq'u (Gemini) a question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question")
        .setRequired(true),
    );

  try {
    console.log("Registering slash command...");
    await rest.put(Routes.applicationCommands(clientId), {
      body: [command.toJSON()],
    });
    console.log("Slash command registered successfully.");
  } catch (error) {
    console.error("Failed to register slash command:", error);
  }
}

async function askGemini(prompt: string): Promise<string> {
  const contextToUse =
    botContext || "You are a helpful assistant. Answer the user's question.";
  const finalPrompt = `${contextToUse}\n\nUser Question: ${prompt}\n\nAnswer:`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
  const body = {
    contents: [{ parts: [{ text: finalPrompt }] }],
  };

  console.log(`Sending prompt to Gemini (length: ${finalPrompt.length})`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error Response: ${errorText}`);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: any = await response.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof answerText !== "string") {
      console.error("Unexpected response structure from Gemini:", data);
      return "Sorry, I received an unexpected response from the AI.";
    }

    return answerText;
  } catch (error) {
    console.error("Error during fetch to Gemini API:", error);
    throw error;
  }
}

const MAX_DISCORD_MESSAGE_LENGTH = 2000;
async function sendLongReply(
  interaction: ChatInputCommandInteraction,
  text: string,
) {
  if (!interaction.isRepliable()) {
    const interactionId =
      (interaction as ChatInputCommandInteraction).id ?? "unknown";
    console.error("Interaction is not repliable:", interactionId);
    return;
  }

  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += MAX_DISCORD_MESSAGE_LENGTH) {
    chunks.push(text.slice(i, i + MAX_DISCORD_MESSAGE_LENGTH));
  }

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(chunks[0]);
    } else {
      await interaction.reply(chunks[0]);
    }

    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp(chunks[i]);
    }
  } catch (error) {
    console.error("Error sending long reply:", error);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Sorry, I had trouble sending the full response.",
          ephemeral: true,
        });
      }
    } catch (followUpError) {
      console.error("Error sending follow-up error message:", followUpError);
    }
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  registerCommand();
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === COMMAND_NAME) {
    const question = interaction.options.getString("question", true);

    await interaction.deferReply();
    try {
      console.log(`Asking Gemini (with context): "${question}"`);
      const answer = await askGemini(question);
      console.log(`Gemini Answer received (length: ${answer.length})`);
      await sendLongReply(interaction, answer);
    } catch (err) {
      console.error("Error during Gemini interaction:", err);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply(
            "Sorry, there was an error contacting the AI.",
          );
        } else {
          // If deferReply failed or reply hasn't happened, try a fresh reply
          await interaction.reply({
            content: "Sorry, there was an error contacting the AI.",
            ephemeral: true,
          });
        }
      } catch (replyError) {
        console.error("Error sending error reply:", replyError);
      }
    }
  }
});

client.login(token).catch((loginError) => {
  console.error("Failed to login:", loginError);
  process.exit(1);
});

console.log("Bot script started...");
