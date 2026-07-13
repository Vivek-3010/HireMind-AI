# HireMind AI — Adaptive Recruitment Orchestrator

HireMind AI is a full-stack, state-of-the-art technical interview simulation and campaign platform. It allows hiring managers and technical recruiters to design bespoke interview profiles, upload and analyze candidate resumes with high-fidelity direct binary PDF ingestion using the Gemini 2.0/2.5 series model, design intelligent scenario-driven developer blueprints, and conduct immersive speech-interactive simulated live interview screens with real-time browser-based Web Speech API recognition and manual simulation fallbacks.

## 🚀 Key Features

- **Full-Stack Gemini Sandbox**: Server-side proxy routing via Express blocks any browser API key leaks. Uses the official `@google/genai` SDK.
- **Direct PDF Binary & Text Ingestion**: Eliminates the "corrupted stream" file-size and text-parsing limitations by enabling direct Base64 inline PDF transfers straight into Gemini's multi-modal intelligence.
- **Adaptive Interview Planner**: Automatically structures Graduated Escalation blueprints targeting candidate weak areas, technological gaps, and project architectures with customized follow-ups.
- **Speech-Interactive Simulator**: Real-time microphone audio transcription using the Web Speech API (`webkitSpeechRecognition`), complete with diagnostic error handling (not-allowed permission recovery, silent-state warnings, and manual high-fidelity typing simulation fallback).
- **Responsive Fluid UI**: Built with React 18, Vite, Tailwind CSS, Lucide icons, and beautiful micro-animations using Framer Motion (`motion/react`).

---

## 💻 Local Setup & Running in VS Code

Follow these straightforward steps to run and develop HireMind AI locally on your system using Visual Studio Code:

### Prerequisites

- **Node.js**: Install Node.js (v18.x or newer is highly recommended). Check your version by running `node -v` in your terminal.
- **Git**: (Optional) For cloning the codebase.

### Step-by-Step Instructions

#### 1. Open the Project in VS Code
Open your VS Code editor, click `File > Open Folder...` (or `Open...` on macOS), and select the project root folder.

#### 2. Create Your Environment Variables
The application keeps sensitive variables secure. In the root of the project:
1. Duplicate the `.env.example` file and rename it to `.env`, or create a file named `.env` in the root folder.
2. Add your **Gemini API Key**:
   - You can get a free-tier API key in seconds from [Google AI Studio](https://aistudio.google.com/).
   - Populate the `.env` file as follows:

```env
# Secure Gemini API Key from Google AI Studio
GEMINI_API_KEY="your_actual_api_key_here"

# Development URL (typically port 3000)
APP_URL="http://localhost:3000"
```

#### 3. Install Dependencies
Open the VS Code integrated terminal (`Ctrl + ~` or `Cmd + ~` on macOS, or go to `Terminal > New Terminal` in the top bar) and run:

```bash
npm install
```

#### 4. Run the Development Server
In your terminal, start the unified full-stack server:

```bash
npm run dev
```

This starts the Express server which hosts both the API endpoints and mounts the Vite dev environment middleware.
- **Local Address**: [http://localhost:3000](http://localhost:3000)
- Any edits you make in the `src/` directory will immediately hot-reload in your browser.

---

## 🛠️ Build & Scripts Explained

The codebase features a production-ready, self-contained server compilation pipeline:

- `npm run dev`: Launches `server.ts` using `tsx` on port `3000`. The server runs Vite in middleware mode for ultra-fast, local client development.
- `npm run build`: 
  1. Builds the static client assets into `/dist` via Vite.
  2. Compiles `server.ts` into a standalone, bundled CommonJS script (`/dist/server.cjs`) using `esbuild`. This bypasses native Node ESM import strictness and achieves super-fast cold starts in serverless environments.
- `npm run start`: Starts the production compiled server (`node dist/server.cjs`), perfectly mimicking cloud container environments.
- `npm run lint`: Performs static analysis and strict TypeScript checking (`tsc --noEmit`) to verify correctness.

---

## 📂 Project Architecture

```txt
├── server.ts                 # Full-stack Express server entry point (API routes + Vite integration)
├── package.json              # App dependencies, engines, and run scripts
├── tsconfig.json             # Root TypeScript configuration
├── vite.config.ts            # Vite build pipeline configurations
├── .env.example              # Environment variables template
├── src/
│   ├── main.tsx              # React mounting entry point
│   ├── App.tsx               # Primary single-page coordinator and view switcher
│   ├── index.css             # Tailwind imports and customized typographic scales
│   ├── types/
│   │   └── index.ts          # Central shared TypeScript declarations
│   ├── utils/
│   │   └── pdfParser.ts      # Fast local PDF byte array extraction routine
│   ├── server/
│   │   ├── gemini.ts         # Secure server-side Gemini prompt engines and structured JSON schemas
│   │   └── orchestrator.ts   # Double-agent chain controller coordinating analysis and planner phases
│   └── components/
│       ├── LandingPage.tsx   # Visual launcher, campaign selectors, and hero banner
│       ├── ResumeUpload.tsx  # Interactive PDF drag/drop, pasting sandbox, and ingestion loader
│       ├── LiveInterview.tsx # Real-time Web Speech Webkit transcription & simulated interview portal
│       ├── EvaluationDashboard.tsx # Comprehensive candidate analytical outcomes and metrics visualizers
│       └── ui/               # Modular micro-components (Cards, Buttons, Dialogs, etc.)
```

---

## 🎙️ Speech Input Diagnostics (Local vs. Remote)

When running the Live Interview simulator, you can speak your responses. Here is what to expect based on your context:
- **Supported Browsers**: The Web Speech API is natively supported in **Google Chrome**, **Microsoft Edge**, and **Safari**.
- **Permissions**: The browser will request permission to access your microphone. If denied or blocked, HireMind AI will display a clean warning notification and automatically offer a high-fidelity manual text-typing voice simulator.
- **Manual Simulation Link**: Next to the voice visualizer, click the `(Simulate speech)` link to instantaneously stream simulated professional developer soundbites straight into the chat box without speaking out loud.
