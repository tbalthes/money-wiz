# MONEY-WIZ: Full-Stack Application Architecture

## **1. Project Vision**

**Project Goal:** To build a modern, fully AI-integrated personal finance management application, competing with services like Monarch Money and Credit Karma. The application will provide users with a holistic view of their finances, automated transaction categorization, goal tracking, and intelligent financial insights.

---

## **2. High-Level Architecture**

The project follows a **headless backend / separated frontend** architecture, managed within a **PNPM monorepo** for streamlined development.

-   **`frontend/`**: A **Next.js (React)** application serving the user interface. It is responsible for all presentation logic and communicates with the backend via a REST API.
-   **`backend/`**: A **NestJS** application serving as a headless API. It handles all business logic, database interactions, authentication, and communication with external services.
-   **Database**: A **PostgreSQL** database managed by **Docker** for local development.

---

## **3. Technology Stack**

| Area                | Technology                                                       |
| :------------------ | :--------------------------------------------------------------- |
| **Monorepo**        | PNPM Workspaces                                                  |
| **Frontend**        | Next.js, React, TypeScript, Tailwind CSS, React Query / SWR      |
| **Backend**         | NestJS, TypeScript, Prisma (ORM)                                 |
| **Database**        | PostgreSQL                                                       |
| **Authentication**  | JWT (JSON Web Tokens), `bcrypt`                                  |
| **Containerization**| Docker, Docker Compose                                           |

---

## **4. API & External Services**

The backend acts as a secure gateway to all external services. The frontend **never** communicates with these services directly.

-   **Plaid API (Future):** For securely linking user bank accounts and automatically syncing transaction data.
-   **AI Model API (Future):** For providing intelligent features. The `ai/` module in the backend will handle all prompt engineering and API calls.

---

## **5. Database Architecture (Prisma Schema)**

The database schema, defined in `backend/prisma/schema.prisma`, is the blueprint for all application data. It is designed to be relational, scalable, and type-safe.

### 5.1 Schema Models & Relationships

| Model          | Description                                                                                             | Key Relationships                                                                      |
| :------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| **User**       | Represents an application user. Contains login credentials and is the root owner of all other data.     | One-to-Many with `Account`, `Category`, `Goal`, `Debt`.                                |
| **Account**    | Represents a user's bank account (e.g., Checking, Savings, Credit Card).                                | Belongs to one `User`. One-to-Many with `Transaction`.                                 |
| **Transaction**| Represents a single financial event (credit or debit). This is the core data point for analysis.        | Belongs to one `Account`. Can be assigned one `Category`.                              |
| **Category**   | A user-defined category for classifying transactions (e.g., "Groceries"). Supports parent/child nesting.  | Belongs to one `User`. Has a self-relation for sub-categories.                         |
| **MerchantRule**| A user-defined rule for automatically categorizing and renaming future transactions.                     | Belongs to one `User`. Linked to one `Category`.                                       |
| **Debt**       | Tracks a user's liabilities, such as loans or credit card debt.                                         | Belongs to one `User`.                                                                 |
| **Goal**       | Tracks a user's financial goals, like a vacation fund or down payment.                                   | Belongs to one `User`.                                                                 |

### 5.2 Prisma Schema Definition

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model: The root owner of all data.
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  password  String

  accounts      Account[]
  categories    Category[]
  merchantRules MerchantRule[]
  goals         Goal[]
  debts         Debt[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Account model: A user's bank account.
model Account {
  id               String  @id @default(cuid())
  accountName      String
  accountNumber    String
  bankName         String
  plaidItemId      String? @unique // For future Plaid integration
  plaidAccessToken String? // For future Plaid integration

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  transactions Transaction[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Transaction model: A single financial event.
model Transaction {
  id                String  @id @default(cuid())
  bankTransactionId String  // The original ID from the bank to prevent duplicates
  date              DateTime
  type              TransactionType
  merchant          String
  description       String
  amount            Decimal
  balanceAfter      Decimal
  rawMemo           String? // The original, unprocessed memo string

  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  accountId String

  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  categoryId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([accountId, bankTransactionId])
}

// Category model: Supports parent/child nesting for organization.
model Category {
  id            String  @id @default(cuid())
  name          String
  color         String?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  transactions  Transaction[]
  merchantRules MerchantRule[]

  parent        Category?  @relation("SubCategories", fields: [parentId], references: [id], onDelete: Cascade)
  parentId      String?
  subCategories Category[] @relation("SubCategories")

  @@unique([userId, name])
}

// MerchantRule model: For automating transaction categorization.
model MerchantRule {
  id              String @id @default(cuid())
  matchText       String
  setMerchantName String

  setCategory   Category @relation(fields: [setCategoryId], references: [id], onDelete: Cascade)
  setCategoryId String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
}

// Debt model: For tracking loans and credit cards.
model Debt {
  id             String   @id @default(cuid())
  name           String
  type           DebtType
  initialBalance Decimal
  currentBalance Decimal
  interestRate   Decimal
  minimumPayment Decimal?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
}

// Goal model: For tracking savings goals.
model Goal {
  id            String    @id @default(cuid())
  name          String
  targetAmount  Decimal
  currentAmount Decimal   @default(0)
  targetDate    DateTime?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
}

// ENUMS
enum TransactionType { CREDIT, DEBIT }
enum DebtType { MORTGAGE, STUDENT_LOAN, CREDIT_CARD, AUTO_LOAN, PERSONAL_LOAN, OTHER }
```

---

## **6. Core Data Flows**

-   **User Registration & Onboarding:**
    1.  **Frontend**: User submits the signup form.
    2.  **API Call**: Frontend sends a `POST` request to `/auth/register`.
    3.  **Backend**: `AuthService` hashes the password, creates the `User` via Prisma, and immediately triggers a `seedDefaultDataForUser` function to populate the `Category` table with a standard set of categories (with parent/child relationships) linked to the new `userId`.
    4.  **Response**: Backend returns a `201 Created` status with the new user object (excluding the password).

-   **Authenticated Data Fetching (e.g., Transactions):**
    1.  **Login**: User logs in, and the backend returns a JWT. The frontend stores this token securely.
    2.  **API Call**: To view transactions, the frontend makes a `GET` request to `/transactions`, including the JWT in the `Authorization: Bearer <token>` header.
    3.  **Backend Guard**: A NestJS `JwtAuthGuard` validates the token and attaches the user's ID to the request.
    4.  **Service Logic**: `TransactionsService` uses the `userId` to fetch the correct data from the database via Prisma.
    5.  **Response**: Backend returns a JSON array of the user's transactions, which the frontend then renders.

---

## **7. Local Development Environment**

-   **Frontend Server:** `http://localhost:3000`
-   **Backend Server:** `http://localhost:5000`
-   **Database:** PostgreSQL (in Docker), accessible from the host at `localhost:5433`.
-   **Backend `.env` Configuration:**
    `DATABASE_URL="postgresql://moneywiz_user:mysecretpassword@localhost:5433/moneywiz?schema=public"`

---

## **8. Complete Architecture**

```plaintext
MONEY-WIZ/
├── .devcontainer/         # VS Code Remote Development container configuration
├── .gitignore             # Specifies files and folders to be ignored by Git
├── docker-compose.yml     # Defines and configures the PostgreSQL Docker container
├── package.json           # Root pnpm configuration
├── pnpm-lock.yaml         # PNPM lockfile for deterministic installs
└── pnpm-workspace.yaml    # Defines the monorepo workspaces (frontend, backend)

# ==========================================================
# Frontend Application (./frontend)
# ==========================================================
├── frontend/
│   ├── public/              # Static assets (images, fonts, etc.)
│   ├── src/
│   │   ├── app/               # Next.js App Router directory
│   │   │   ├── (auth)/        # Route group for unauthenticated pages
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── signup/
│   │   │   │       └── page.tsx
│   │   │   ├── (main)/        # Route group for authenticated app pages (uses main layout)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── transactions/
│   │   │   │   │   └── page.tsx   # All main pages will be created here
│   │   │   │   └── layout.tsx   # Main layout with Sidebar and Header
│   │   │   ├── api/             # Next.js API routes (e.g., for proxying if needed)
│   │   │   ├── layout.tsx       # Root layout, contains AuthProvider
│   │   │   └── page.tsx         # Application landing page
│   │   ├── components/
│   │   │   ├── ai/              # Components for AI features (ChatInterface.tsx)
│   │   │   ├── charts/          # Reusable chart components
│   │   │   ├── dashboard/       # Components specific to the dashboard
│   │   │   ├── layout/          # Sidebar, Header, UserNav components
│   │   │   ├── transactions/    # TransactionsTable, AddTransactionModal
│   │   │   └── ui/              # Generic UI primitives (Button.tsx, Card.tsx, Input.tsx)
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Manages user auth state (JWT, user data) globally
│   │   └── lib/
│   │       ├── api.ts           # Central functions for calling the backend API
│   │       ├── firebase.ts      # Client-side Firebase SDK setup (if used)
│   │       ├── hooks.ts         # Custom React hooks
│   │       ├── types.ts         # Shared frontend TypeScript types
│   │       └── utils.ts         # Utility functions (e.g., formatting dates/currency)
│   ├── package.json
│   └── tailwind.config.ts

# ==========================================================
# Backend Application (./backend)
# ==========================================================
└── backend/
    ├── prisma/
    │   ├── migrations/      # Database migration history managed by Prisma
    │   └── schema.prisma    # The single source of truth for the database schema
    ├── src/
    │   ├── api/               # NOTE: Express-style structure (legacy or alternative pattern)
    │   │   ├── controllers/
    │   │   ├── middleware/
    │   │   ├── models/
    │   │   ├── routes/
    │   │   └── services/      # Contains Firestore/Gemini services
    │   ├── auth/              # NOTE: Preferred NestJS feature-module structure
    │   │   ├── dto/           # Data Transfer Objects for request validation
    │   │   ├── entities/      # Data entities (can be merged with DTOs)
    │   │   ├── auth.controller.ts # Defines API routes like /auth/register
    │   │   ├── auth.module.ts   # Connects the controller and service
    │   │   └── auth.service.ts  # Contains business logic for authentication
    │   ├── common/
    │   │   └── constants/     # For constants like default_categories.ts
    │   ├── config/            # For environment and config management
    │   ├── app.module.ts      # Root module, imports all other feature modules
    │   ├── index.ts           # Legacy entry point (main.ts is standard for NestJS)
    │   └── main.ts            # Standard NestJS application entry point
    ├── package.json
    └── tsconfig.json
```
## **9. Getting Started**

1.  **Install Dependencies**: From the root directory, run:
    ```bash
    pnpm install
    ```
2.  **Start Services**:
    ```bash
    docker-compose up -d
    ```
3.  **Run Database Migrations**: (Run once or after any schema change)
    ```bash
    cd backend
    pnpm prisma migrate dev
    ```
4.  **Start Backend Server**:
    ```bash
    cd backend
    pnpm run start:dev
    ```
5.  **Start Frontend Server**:
    ```bash
    cd frontend
    pnpm run dev
    ```
