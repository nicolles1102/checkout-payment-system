# 🛒 Checkout Payment System

> Technical test — FullStack checkout system integrated with Wompi payment gateway.

A full-stack application that simulates a **product purchase flow with credit card payment** using the Wompi sandbox API. The system follows a **5-step business process**: Product page → Credit Card/Delivery info → Summary → Final status → Product page with updated stock.

---

## 📚 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
  - [Hexagonal Architecture (Ports & Adapters)](#hexagonal-architecture-ports--adapters)
  - [Folder Structure](#folder-structure)
- [Database Model](#database-model)
- [API Endpoints](#api-endpoints)
- [Frontend](#frontend)
  - [Business Flow (5 Steps)](#business-flow-5-steps)
  - [State Management](#state-management)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Evaluation Rubric Coverage](#evaluation-rubric-coverage)

---

## 🛠 Tech Stack

### Backend
| Technology | Version |
|-----------|---------|
| [![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs)](https://nestjs.com/) | 11.x |
| [![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript)](https://www.typescriptlang.org/) | 5.7 |
| [![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma)](https://www.prisma.io/) | 7.9 |
| [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/) | (Supabase) |
| [![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js)](https://nodejs.org/) | 24.x |

### Frontend
| Technology | Version |
|-----------|---------|
| [![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)](https://react.dev/) | 19.x |
| [![TypeScript](https://img.shields.io/badge/TypeScript-v6-3178C6?logo=typescript)](https://www.typescriptlang.org/) | 6.x |
| [![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux)](https://redux-toolkit.js.org/) | 2.12 |
| [![Vite](https://img.shields.io/badge/Vite-v8-646CFF?logo=vite)](https://vitejs.dev/) | 8.x |
| [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/) | 4.x |

### Payment Gateway
| Service | Environment |
|---------|------------|
| [![Wompi](https://img.shields.io/badge/Wompi_Sandbox-00B4D8)](https://docs.wompi.co/) | Sandbox (UAT) |

---

## 🏗 Architecture

### Hexagonal Architecture (Ports & Adapters)

The project follows **Hexagonal Architecture** (also known as *Ports & Adapters*) to keep business logic isolated from external concerns like databases, HTTP frameworks, and payment gateways.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Controllers (HTTP)    │  Adapters (Prisma, Wompi, etc.)    │  │
│  └────────────────────────┴────────────────────────────────────┘  │
│                           │                                        │
│                    (depends on port)                                │
│                           ▼                                        │
├─────────────────────────────────────────────────────────────────────┤
│                        APPLICATION                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Use Cases (business logic)     │  Common (Result<T,E>)    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                        │
│                    (depends on port)                                │
│                           ▼                                        │
├─────────────────────────────────────────────────────────────────────┤
│                          DOMAIN                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Entities                     │  Ports (interfaces)         │  │
│  └───────────────────────────────┴──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principles applied:**
- **Domain layer** defines business entities and port interfaces (contracts)
- **Application layer** implements use cases with business logic, using the `Result<T,E>` pattern (Railway Oriented Programming)
- **Infrastructure layer** contains concrete implementations of ports (Prisma repository, Wompi HTTP client, controllers)

### Folder Structure

```
checkout-payment-system/
│
├── checkout-backend/              # NestJS API
│   ├── prisma/                    # Prisma schema & migrations
│   │   └── schema.prisma          # Data model definition
│   ├── generated/                 # Generated Prisma client
│   └── src/
│       ├── domain/                # 👑 Domain layer
│       │   ├── entities/          #   Business entities (Product, Transaction, etc.)
│       │   └── ports/             #   Repository interfaces
│       ├── application/           # ⚙️ Application layer
│       │   ├── common/            #   Shared utilities (Result<T,E>)
│       │   └── use-cases/         #   Business logic use cases
│       ├── infrastructure/        # 🔌 Infrastructure layer (adapters)
│       │   ├── adapters/
│       │   │   ├── prisma/        #   Prisma service & repositories
│       │   │   └── wompi/         #   Wompi API client
│       │   └── controllers/       #   HTTP controllers
│       ├── app.module.ts          # Root module
│       ├── app.controller.ts      # Health check controller
│       ├── app.service.ts         # Health check service
│       └── main.ts                # Application entry point
│
├── checkout-frontend/             # React SPA
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Page-level components
│       ├── store/                 # Redux store (state management)
│       ├── services/              # API client services
│       ├── App.tsx                # Root component
│       └── main.tsx               # Entry point
│
└── README.md                      # 📘 You are here
```

---

## 💾 Database Model

### Entity Relationship Diagram

```mermaid
erDiagram
    products {
        uuid id PK
        varchar name
        text description
        decimal price
        int stock
        varchar image_url "nullable"
        timestamptz created_at
    }

    customers {
        uuid id PK
        varchar email UK
        varchar full_name
        varchar phone_number
        timestamptz created_at
    }

    deliveries {
        uuid id PK
        text address
        varchar city
        varchar region
        varchar postal_code "nullable"
        varchar status "default: PENDING"
        timestamptz created_at
    }

    transactions {
        uuid id PK
        decimal amount
        decimal base_fee
        decimal delivery_fee
        varchar status "default: PENDING"
        varchar wompi_transaction_id "nullable"
        uuid product_id FK "nullable"
        uuid customer_id FK "nullable"
        uuid delivery_id FK "nullable"
        timestamptz created_at
    }

    products ||--o{ transactions : "has"
    customers ||--o{ transactions : "has"
    deliveries ||--o{ transactions : "has"
```

### Schema Summary

| Table | Description | Key Fields |
|-------|-------------|------------|
| `products` | Store items available for purchase | `id`, `name`, `description`, `price`, `stock`, `image_url` |
| `customers` | Customer information collected during checkout | `id`, `email`, `full_name`, `phone_number` |
| `deliveries` | Delivery address and status tracking | `id`, `address`, `city`, `region`, `postal_code`, `status` |
| `transactions` | Payment transactions linked to Wompi | `id`, `amount`, `base_fee`, `delivery_fee`, `status`, `wompi_transaction_id` |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/` | Health check | ✅ Done |
| `GET` | `/products` | List all available products | ✅ Done |
| `GET` | `/products/:id` | Get product by ID | 🔜 Planned |
| `POST` | `/transactions` | Create a new transaction | 🔜 Planned |
| `GET` | `/transactions/:id` | Get transaction status | 🔜 Planned |
| `POST` | `/transactions/:id/pay` | Process payment with Wompi | 🔜 Planned |
| `POST` | `/customers` | Register customer info | 🔜 Planned |
| `POST` | `/deliveries` | Create delivery record | 🔜 Planned |
| `POST` | `/webhooks/wompi` | Wompi payment callback | 🔜 Planned |

> 📌 **Postman Collection:** [Link pendiente]  
> 📌 **Swagger Documentation:** [Link pendiente]

---

## 🎨 Frontend

### Business Flow (5 Steps)

The app follows a strict **5-step screen process** as specified in the requirements:

```
Step 1                    Step 2                    Step 3
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│  Product    │  ─────►  │  Credit     │  ─────►  │  Summary    │
│  Page       │          │  Card &     │          │  Payment    │
│             │          │  Delivery   │          │             │
│ • Show      │          │ • Credit    │          │ • Product   │
│   product   │          │   card form │          │   amount    │
│ • Stock     │          │ • Delivery  │          │ • Base fee  │
│ • Price     │          │   info      │          │ • Delivery  │
│ • "Pay"     │          │ • Valid-    │          │   fee       │
│   button    │          │   ation     │          │ • Pay btn   │
└─────────────┘          └─────────────┘          └─────────────┘
       ▲                                                  │
       │                                                  ▼
       │                                          ┌─────────────┐
       │  ┌─────────────┐                          │  Payment    │
       │  │  Product    │  ◄────────────────────  │  Result     │
       └── │  Page      │     (redirect after      │             │
          │  (updated)  │       completion)         │ • Success   │
          │  • Stock    │                           │   / Fail    │
          │  • Units    │                           │ • Updated   │
          └─────────────┘                           │   stock     │
               Step 5                              └─────────────┘
                                                       Step 4
```

### State Management

The application uses **Redux Toolkit** with **Flux Architecture** to manage state. The store includes:

- **`productsSlice`** — Product catalog, stock tracking
- **`paymentSlice`** — Credit card data, payment status
- **`deliverySlice`** — Customer delivery information
- **`transactionSlice`** — Current transaction state

> State persistence is handled via `localStorage` to ensure the app **recovers progress** in case of a page refresh (resilience requirement).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **PostgreSQL** database (or a Supabase instance)
- **Wompi Sandbox** account (keys provided in `.env`)

### Backend Setup

```bash
# 1. Navigate to backend
cd checkout-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Copy the .env template and fill in your values
#    DATABASE_URL points to your PostgreSQL instance
#    Wompi keys for sandbox environment
#    
#    Example .env:
#    DATABASE_URL="postgresql://user:password@host:5432/db"
#    PORT=3000
#    WOMPI_PUBLIC_KEY="pub_stagtest_..."
#    WOMPI_PRIVATE_KEY="prv_stagtest_..."
#    WOMPI_EVENTS_KEY="stagtest_events_..."
#    WOMPI_INTEGRITY_KEY="stagtest_integrity_..."
#    WOMPI_BASE_URL="https://api-sandbox.co.uat.wompi.dev/v1"

# 4. Generate Prisma client & run migrations
npx prisma generate
npx prisma db push

# 5. Start development server
npm run start:dev

# The server starts at http://localhost:3000
# Products table is auto-seeded on first run
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd checkout-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# The app opens at http://localhost:5173
```

---

## 🧪 Testing

> ⚠️ Tests are currently being implemented.

| Aspect | Tool | Coverage Target | Status |
|--------|------|----------------|--------|
| Backend Unit Tests | Jest | > 80% | 🔜 Planned |
| Frontend Unit Tests | Jest / React Testing Library | > 80% | 🔜 Planned |
| Backend E2E Tests | Jest + Supertest | Key flows | 🔜 Planned |

```bash
# Run backend tests
cd checkout-backend && npm test

# Run backend tests with coverage
cd checkout-backend && npm run test:cov

# Run frontend tests
cd checkout-frontend && npm test
```

---

## ☁ Deployment

> ⚠️ Deployment is currently pending.

| Service | Proposed Provider | Resource |
|---------|------------------|----------|
| Backend API | AWS (ECS / Lambda) | REST API |
| Frontend SPA | AWS (S3 + CloudFront) | Static site |
| Database | Supabase (PostgreSQL) | Managed DB |

---

## 📊 Evaluation Rubric Coverage

| Criteria | Points | Status |
|----------|--------|--------|
| README completed correctly | 5 | ✅ In progress |
| Images that render fast & UI/UX boundaries | 5 | 🔜 Planned |
| Full functionality of checkout process | 20 | 🔜 Planned |
| API working correctly | 20 | ✅ In progress |
| > 80% test coverage (Backend + Frontend) | 30 | 🔜 Planned |
| App & API deployed to Cloud | 20 | 🔜 Planned |
| **Total required** | **100** | **In progress** |

### Bonus Points

| Criteria | Points | Status |
|----------|--------|--------|
| OWASP alignments, HTTPS, Security headers | 5 | 🔜 Planned |
| Responsive cross-browser | 5 | 🔜 Planned |
| CSS skills | 10 | 🔜 Planned |
| Clean code | 10 | ✅ In progress |
| Hexagonal Architecture | 10 | ✅ In progress |
| Railway Oriented Programming | 10 | ✅ Structure ready |
| **Total bonus** | **50** | |

---

## 🔗 Links

- **GitHub Repository:** [https://github.com/nicolles1102/checkout-payment-system](https://github.com/nicolles1102/checkout-payment-system)
- **Postman Collection:** [Link pendiente]
- **Swagger Documentation:** [Link pendiente]
- **Live API URL:** [Link pendiente]
- **Live Frontend URL:** [Link pendiente]

---

> Built with ❤️ for the Wompi FullStack technical test.