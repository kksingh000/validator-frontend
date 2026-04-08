# Startup Idea Validator - Frontend

A React + TypeScript single-page application for submitting startup ideas and viewing AI-generated validation reports. Features a dark-themed, modern UI with animated transitions and a comprehensive report layout.

## Tech Stack

| Layer       | Technology               |
| ----------- | ------------------------ |
| Framework   | React 19 + TypeScript    |
| Build Tool  | Vite 8                   |
| Styling     | CSS-in-JS (inline)       |
| Font        | Playfair Display (serif) |

## Features

- **Submit Page** — Form to enter idea title, description, industry, and target market
- **Dashboard** — Lists all submitted ideas with status badges, timestamps, and quick actions
- **Detail Page** — Full AI report with:
  - Profitability score ring (animated SVG)
  - Risk level badge with risk factors
  - Verdict summary
  - Problem summary
  - Customer persona (name, age, occupation, pain points, goals)
  - Market overview (TAM, growth rate, trends)
  - Competitor landscape (strengths/weaknesses cards)
  - Suggested tech stack with rationale
  - Profitability analysis
  - Actionable recommendations

## Installation & Setup

### 1. Clone & install dependencies

```bash
cd client
npm install
```

### 2. Configure API URL

The frontend connects to the backend at `http://localhost:3000/api` by default. To change this, update the `API_BASE` constant in `src/App.tsx` (line 6).

### 3. Start the dev server

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

Output goes to the `dist/` folder, ready for deployment to Vercel or Netlify.

## Project Structure

```
src/
└── App.tsx        # Single-file application containing:
                   #   - Theme constants & design tokens
                   #   - Reusable UI components (Button, Card, StatusBadge, etc.)
                   #   - ScoreRing (animated SVG profitability gauge)
                   #   - RiskBadge (color-coded risk indicator)
                   #   - SubmitPage (idea submission form)
                   #   - DashboardPage (idea listing with pagination)
                   #   - DetailPage (full AI analysis report)
                   #   - App root with client-side routing
```

## Connecting to the Backend

Ensure the backend server is running at `http://localhost:3000` before using the frontend. The app makes the following API calls:

| Action         | Method | Endpoint                |
| -------------- | ------ | ----------------------- |
| Submit idea    | POST   | `/api/ideas`            |
| List ideas     | GET    | `/api/ideas?limit=50`   |
| View report    | GET    | `/api/ideas/:id`        |
| Delete idea    | DELETE | `/api/ideas/:id`        |
| Retry analysis | POST   | `/api/ideas/:id/retry`  |
