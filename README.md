# Liq'u - Discord Gemini Q&A Bot

Liq'u is a simple Discord bot that I built with Node.js and TypeScript that allows users to ask questions directly to Google's Gemini AI model using a slash command.

## Features

- **Slash Command:** Uses the `/ask` command for interaction.
- **Direct Gemini Query:** Sends user questions directly to the Gemini API.
- **Optional Persona:** Can use a `BOT_CONTEXT` environment variable to provide persistent identity/instructions to the AI.
- **Handles Long Responses:** Automatically splits long answers from Gemini to fit Discord's message limits.
- **Modern Discord.js:** Built using discord.js v14+ features (Intents, Events, REST API for command registration).

## Tech Stack

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [TypeScript](https://www.typescriptlang.org/)
- [discord.js](https://discord.js.org/)
- [dotenv](https://github.com/motdotla/dotenv)
- [Google Gemini API](https://ai.google.dev/)

## Setup

1.  **Prerequisites:**

    - Node.js v18.0.0 or later (to use the native `fetch` API). If you are using an older version, you will need to install and import a fetch polyfill like `node-fetch` (`pnpm add node-fetch` or `npm install node-fetch`) and adjust the import in `src/index.ts`.
    - A package manager like `pnpm` (used for development), `npm`, or `yarn`.

2.  **Clone the Repository:**

    ```bash
    git clone <your-repo-url>
    cd liqu-discord-bot
    ```

3.  **Install Dependencies:**

    ```bash
    pnpm install

    # Or using npm
    # npm install

    # Or using yarn
    # yarn install
    ```

4.  **Create `.env` File:**

    - Create a file named `.env` in the project root.
    - Add your Discord Bot Token, Client ID, and Google Gemini API Key:
      ```dotenv
      DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
      CLIENT_ID=YOUR_DISCORD_APPLICATION_CLIENT_ID_HERE
      GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE
      BOT_CONTEXT=YOUR_OPTIONAL_CONTEXT_HERE
      ```
    - Get Discord credentials from the [Discord Developer Portal](https://discord.com/developers/applications).
    - Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - **Important:** Add `.env` to your `.gitignore` file!

5.  **Command Registration:** The `/ask` slash command is registered automatically when the bot starts up.

## Running the Bot

1.  **Compile TypeScript:**

    ```bash
    pnpm run build
    ```

    _(Or `npm run build`, `yarn build`, or `npx tsc`)_

2.  **Start the Bot:**
    ```bash
    pnpm start
    ```
    _(Or `npm start`, `yarn start`, or `node dist/index.js`)_

## Usage

Once the bot is running and added to your server, users can interact with it using the `/ask` command:

`/ask <Your question for Gemini>`

If the `BOT_CONTEXT` variable is set in the `.env` file, the bot will use that context when interacting with the Gemini API, potentially influencing its persona and answers to identity-related questions.
