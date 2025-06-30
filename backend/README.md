# AI Code Reviewer Backend

A backend service that provides AI-powered code review functionality. It analyzes code for bugs, performance issues, security vulnerabilities, and best practices using Google's GenAI.

## Features

- AI-powered code analysis
- Support for multiple programming languages
- Persistent storage of code reviews
- RESTful API endpoints
- Built with TypeScript and Express
- Uses Prisma ORM for database operations
- Integrates with Google's GenAI for code analysis

## Prerequisites

- Node.js (v18 or higher)
- Bun (for package management)
- Google Cloud API key with GenAI access
- PostgreSQL database (or any database supported by Prisma)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai_code_reviewer/backend
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_code_reviewer?schema=public"
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## Running the Server

Start the development server:
```bash
bun run index.ts
```

The server will start on `http://localhost:9008` by default.

## API Endpoints

### POST /review

Submit code for AI review.

**Request Body:**
```json
{
  "code": "your code here",
  "filename": "example.js",
  "language": "JavaScript"
}
```

**Response:**
```json
{
  "response": {
    "id": "review-id",
    "code": "your code here",
    "filename": "example.js",
    "language": "JavaScript",
    "feedback": "AI-generated feedback about the code..."
  }
}
```

## Development

- The main server logic is in `index.ts`
- AI integration is handled in `ai.ts`
- Database models are defined in `prisma/schema.prisma`

## Environment Variables

- `DATABASE_URL`: Connection string for your database
- `GOOGLE_API_KEY`: Your Google Cloud API key for GenAI access

## License

This project is licensed under the MIT License - see the LICENSE file for details.
