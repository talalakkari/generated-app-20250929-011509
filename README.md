# StellarPulse: Real-Time Crypto & Forex Tracker
A visually striking, real-time dashboard for tracking BTC/USD and USD/AUD rates with interactive charts, an AUD-to-BTC purchase calculator, and configurable price alerts.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/talalakkari/generated-app-20250929-011344)
## Key Features
-   **Real-Time Data:** Live tracking of BTC/USD price and USD/AUD exchange rate from the CoinGecko API.
-   **Interactive Candlestick Charts:** Analyze historical BTC/USD trends across various timeframes (1D, 7D, 1M, 1Y).
-   **Opportunity Calculator:** Instantly compute potential BTC purchase volume for a user-defined AUD budget, factoring in transfer fees.
-   **Personalized Price Alerts:** Set up custom price alerts for BTC to receive in-app and email notifications when thresholds are met.
-   **Persistent State:** User preferences and alert configurations are securely saved using Cloudflare Durable Objects.
-   **Stunning UI/UX:** A modern, clean, and professional dark-themed interface built with obsessive attention to visual excellence.
-   **Fully Responsive:** Flawless experience on any device, from mobile phones to desktops.
-   **Edge-Optimized:** Architected for maximum performance and low latency on Cloudflare's global network.
## Technology Stack
-   **Frontend:**
    -   React & Vite
    -   TypeScript
    -   Tailwind CSS
    -   shadcn/ui
    -   Recharts for charting
    -   Zustand for state management
    -   Framer Motion for animations
    -   Lucide React for icons
-   **Backend:**
    -   Cloudflare Workers
    -   Hono
    -   SendGrid for email notifications
-   **Persistence:**
    -   Cloudflare Durable Objects
## Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd stellar-pulse
    ```
2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```
3.  **Set up local environment variables:**
    Create a `.dev.vars` file in the root of the project for local development with Wrangler.
    ```
    # .dev.vars
    SENDGRID_API_KEY="YOUR_SENDGRID_API_KEY"
    ```
4.  **Run the development server:**
    This command starts the Vite frontend and the Wrangler development server for the backend worker.
    ```bash
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.
## Project Structure
-   `src/`: Contains the frontend React application source code.
    -   `pages/`: Top-level page components.
    -   `components/`: Reusable UI components.
    -   `hooks/`: Custom React hooks.
    -   `store/`: Zustand state management stores.
-   `worker/`: Contains the Cloudflare Worker backend code.
    -   `userRoutes.ts`: Hono API route definitions.
    -   `durableObject.ts`: The core logic for the singleton Durable Object.
-   `shared/`: TypeScript types and interfaces shared between the frontend and backend.
## Deployment
This application is designed to be deployed to Cloudflare's network.
1.  **Login to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```bash
    wrangler login
    ```
2.  **Deploy the application:**
    This command will build the frontend application and deploy both the static assets and the worker to Cloudflare.
    ```bash
    bun run deploy
    ```
Alternatively, you can deploy directly from your GitHub repository using the button below.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/talalakkari/generated-app-20250929-011344)