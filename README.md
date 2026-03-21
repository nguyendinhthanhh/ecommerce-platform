# 🛒 E-Commerce Platform

[![Java](https://img.shields.io/badge/Java-21-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.10-%236DB33F.svg?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A premium, AI-enhanced e-commerce solution integrating Customers, Sellers, Admins, and Staff with advanced features like RAG Chatbot and eKYC.**

---

## 📖 Overview

The **E-Commerce Platform** is a sophisticated marketplace application built for the **SWD392 Capstone Project at FPT University**. It leverages a modern tech stack to provide a secure, scalable, and intelligent shopping experience.

### 🌟 Key Features

- **🤖 AI-Powered Intelligence**:
  - **Smart Chatbot**: Integrated with **Google Gemini (Gemma 3)** for natural language customer support.
  - **RAG (Retrieval-Augmented Generation)**: Uses **PGVector** for semantic search and context-aware product recommendations.
  - **Local Embeddings**: High-performance local text processing using ONNX models (`all-MiniLM-L6-v2`).
- **🛡️ Advanced Security & Identity**:
  - **VNPT eKYC**: Seamless integration for user identity verification.
  - **Role-Based Access Control (RBAC)**: Secure access for Admins, Sellers, Staff, and Customers.
  - **JWT Authentication**: Secure, stateless session management with access and refresh tokens.
- **💳 Integrated Payments**:
  - Native integration with **VNPAY** for secure online transactions.
- **📊 Real-time Analytics**:
  - Dynamic dashboards for Sellers (sales analytics) and Admins (user/system health monitoring) using **Chart.js**.

---

## 🛠️ Tech Stack

### Backend
- **Core**: Java 21, Spring Boot 3.5.10
- **Data**: Spring Data JPA, Hibernate, **PostgreSQL** (AWS RDS), **PGVector**
- **AI**: Spring AI 1.1.2 (Gemini, Transformers, Vector Store)
- **Migrations**: Flyway
- **Security**: Spring Security, JWT (JJWT 0.12.5)
- **Documentation**: Springdoc OpenAPI (Swagger UI)
- **Utilities**: MapStruct, Lombok, Apache POI (Excel reporting)

### Frontend
- **Framework**: React 19, Vite 7
- **Styling**: TailwindCSS 4
- **Routing**: React Router 7
- **State/API**: Axios, Custom Hooks
- **UI/UX**: React Hot Toast, Chart.js, Lucide Icons

---

## 🏗️ Project Structure

```text
.
├── backend/                # Spring Boot application
│   ├── src/main/java/      # Source code (ai, security, controller, service, etc.)
│   ├── src/main/resources/ # Configuration and database migrations
│   └── pom.xml             # Maven dependencies
├── frontend/               # React Vite application
│   ├── src/pages/          # Role-based pages (admin, seller, customer, staff)
│   ├── src/services/       # API interaction layer
│   └── package.json        # Frontend dependencies
└── docker-compose.yml      # Local infrastructure (PostgreSQL with PGVector)
```

---

## 🚀 Getting Started

### Prerequisites
- **JDK 21** or higher
- **Node.js 20+**
- **Maven 3.9+**
- **Docker** (for local database)

### Installation & Run

#### 1. Database Setup (Local)
Use the provided `docker-compose.yml` to start a PostgreSQL instance with `pgvector`:
```bash
docker-compose up -d
```

#### 2. Backend Setup
1. Navigate to `/backend`.
2. Configure `src/main/resources/application.properties` with your database credentials and API keys (Gemini, VNPAY, VNPT).
3. Run the application:
```bash
./mvnw spring-boot:run
```
*API available at: `http://localhost:8080`*

#### 3. Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

Made with ❤️ by **SWD392 Team** at **FPT University**

</div>
