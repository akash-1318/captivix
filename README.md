# captivix

# AI Email Summarizer

A full-stack application that ingests emails, summarizes them using OpenAI, categorizes them, and provides a dashboard for viewing, filtering, and managing email summaries.

## Project Structure

```
├── backend/          # Express.js server with PostgreSQL & OpenAI integration
├── frontend/         # React + TypeScript + Vite + Tailwind CSS
├── README.md         # This file
└── .gitignore
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless PostgreSQL)
- OpenAI API key

### Backend Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file:

   ```env
   DB_URL=postgresql://user:password@host/dbname
   OPENAI_API_KEY=sk-...
   PORT=3000
   ```

3. Run database migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The backend runs on `http://localhost:3000` by default.

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file (optional):

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The frontend runs on `http://localhost:5173` by default.

## API Endpoints

### Emails

- **POST** `/emails/ingest` - Ingest mock emails, summarize & categorize via OpenAI
- **GET** `/emails` - Fetch emails with optional filtering
  - Query params: `category` (string), `q` (search by subject)
- **GET** `/emails/categories` - Get distinct categories for filtering
- **GET** `/emails/:id` - Get a single email by ID
- **POST** `/emails/:id/resummarize` - Re-run OpenAI summarization on an email
- **DELETE** `/emails/:id` - Delete an email

### Export

- **GET** `/summaries/export` - Download all emails as CSV

## Design Decisions

### Backend

- **Express.js + Drizzle ORM**: Type-safe database access with PostgreSQL
- **OpenAI Integration**: Uses GPT-4-mini with structured JSON output for summaries and categorization
- **PDF Extraction**: Lightweight extraction of invoice items from PDFs using `pdf-parse`
- **Error Handling**: Graceful fallbacks ensure the pipeline never breaks
- **CORS Enabled**: Allows frontend to communicate with backend

### Frontend

- **React 19 + TypeScript**: Type-safe UI with modern React hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS 4**: Utility-first styling with `@tailwindcss/vite`
- **Custom Hooks**: `useDebouncedValue` debounces search input to reduce API calls
- **Component Structure**:
  - `Dashboard.tsx` - Main page with filtering, ingestion, and email list
  - `FilterBar.tsx` - Category dropdown and search input
  - `EmailCard.tsx` - Individual email display with summary, action buttons
  - `Header.tsx` - App title and export CSV button
  - `Loading.tsx` - Reusable loading spinner

### Data Flow

1. User clicks **"Ingest Mock Emails"**
2. Backend reads mock emails, processes each one:
   - Calls OpenAI to generate summary + category
   - Optionally extracts invoice items from PDF attachments
   - Stores in PostgreSQL
3. Frontend displays emails in a grid with filtering by category or search
4. User can re-summarize or delete emails
5. Export button downloads all emails as CSV

## Environment Variables

### Backend

| Variable         | Description                      |
| ---------------- | -------------------------------- |
| `DB_URL`         | PostgreSQL connection string     |
| `OPENAI_API_KEY` | OpenAI API key for summarization |
| `PORT`           | Server port (default: 3000)      |

### Frontend

| Variable            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL` | Backend API URL (default: http://localhost:3000) |

## Technologies Used

**Backend:**

- Express.js
- Drizzle ORM
- PostgreSQL
- OpenAI API
- pdf-parse
- csv-stringify
- Zod (validation)

**Frontend:**

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- ESLint
