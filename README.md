# 🛒 E-Commerce Platform — SWD392 Capstone Project

## 👥 The Team

<div align="center">
<table>
  <tr>
    <td align="center" width="160">
      <img src="https://ui-avatars.com/api/?name=Phan+Van+Huy&background=4F46E5&color=fff&size=64&bold=true&rounded=true" alt="Phan Văn Huy"/><br/>
      <b>Phan Văn Huy</b><br/>
      <code>SE184969</code><br/>
    </td>
    <td align="center" width="160">
      <img src="https://ui-avatars.com/api/?name=Tran+Quoc+Cong&background=7C3AED&color=fff&size=64&bold=true&rounded=true" alt="Trần Quốc Công"/><br/>
      <b>Trần Quốc Công</b><br/>
      <code>SE180709</code><br/>
    </td>
    <td align="center" width="160">
      <img src="https://ui-avatars.com/api/?name=Tran+Nhat+Huy&background=EC4899&color=fff&size=64&bold=true&rounded=true" alt="Trần Nhật Huy"/><br/>
      <b>Trần Nhật Huy</b><br/>
      <code>SE180369</code><br/>
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <img src="https://ui-avatars.com/api/?name=Duong+Xuan+Son&background=F59E0B&color=fff&size=64&bold=true&rounded=true" alt="Dương Xuân Sơn"/><br/>
      <b>Dương Xuân Sơn</b><br/>
      <code>SE181792</code><br/>
    </td>
    <td align="center" width="160">
      <img src="https://ui-avatars.com/api/?name=Nguyen+Trung+Tin&background=10B981&color=fff&size=64&bold=true&rounded=true" alt="Nguyễn Trung Tín"/><br/>
      <b>Nguyễn Trung Tín</b><br/>
      <code>SE181711</code><br/>
    </td>
    <td align="center" width="160">
      <img src="https://ui-avatars.com/api/?name=Nguyen+Dinh+Thanh&background=06B6D4&color=fff&size=64&bold=true&rounded=true" alt="Nguyễn Đình Thanh"/><br/>
      <b>Nguyễn Đình Thanh</b><br/>
      <code>SE182854</code><br/>
    </td>
  </tr>
</table>
</div>

A premium, AI-enhanced e-commerce solution designed for multi-actor marketplace management (Admin, Seller, Staff, Customer). This project integrates advanced Retrieval-Augmented Generation (RAG) for customer support and secure eKYC for user identity verification.

---

## 📊 Project Status

| Module | Status | Notes |
| :--- | :--- | :--- |
| **Security & Identity** | ✅ Completed | JWT Auth, RBAC, and VNPT eKYC integration. |
| **Product & Stock** | ✅ Completed | Full CRUD with real-time stock adjustment on orders. |
| **AI RAG Chatbot** | ✅ Completed | Intent-based routing with Gemini & PGVector. |
| **Order Management** | ✅ Completed | 7-stage state machine with automated transitions. |
| **Payment (VNPay)** | ✅ Completed | Integrated with callback and secure signature verification. |
| **Payment (Momo)** | ⚠️ In Progress | Backend service implemented; sandbox testing pending. |
| **Sales Analytics** | ✅ Completed | Seller dashboards with Chart.js and Excel reporting. |
| **Review System** | ✅ Completed | Customer reviews with automated rating aggregation. |

---

## 🛠️ Tech Stack

### Backend (Spring Boot 3.5.10 / Java 21)
- **AI Intelligence**: Spring AI 1.1.2 (Google Gemini Gemma 3).
- **Vector Search**: PostgreSQL with **pgvector** extension.
- **Local Embeddings**: ONNX-based `all-MiniLM-L6-v2` for local processing.
- **Reporting**: Apache POI (Excel generation).
- **Persistence**: Spring Data JPA / Hibernate / Flyway (Migrations).
- **Security**: Spring Security + JJWT 0.12.5.

### Frontend (React 19 / Vite 7)
- **Routing**: React Router 7 (SPA).
- **Styling**: TailwindCSS 4 (PostCSS / Utility-first).
- **Visuals**: Chart.js / Lucide Icons / React Hot Toast.
- **Networking**: Axios with custom interceptors for token refresh.

---

## ✨ Key Features (Code Verified)

- **🤖 AI RAG Chatbot**: Automatically classifies user intent (search, stock, price, review) and provides context-aware answers using product data and vector embeddings.
- **🛡️ Secure Identity (eKYC)**: Integration with VNPT eKYC to verify seller/staff identities.
- **💳 Financial Integration**: Support for VNPAY, Momo, and Cash on Delivery (COD).
- **📊 Business Intelligence**: Real-time sales charts, revenue tracking per category, and the ability to export reports.
- **📦 Reliable Fulfillment**: Order tracking through PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, COMPLETED, and CANCELLED states.

---

## 🏗️ Project Structure

```text
.
├── backend/                # Java Spring Boot Service
│   ├── src/main/java/.../ai/       # Intent classification & RAG logic
│   ├── src/main/java/.../security/ # JWT & RBAC configuration
│   ├── src/main/java/.../entity/   # Hibernate ORM Models
│   └── src/main/resources/db/      # Flyway SQL migrations
├── frontend/               # React Vite SPA
│   ├── src/pages/          # Role-based dashboard views
│   ├── src/services/       # API integration layer (Axios)
│   └── src/components/     # Reusable UI widgets
└── docker-compose.yml      # Managed infrastructure (Postgres + pgvector)
```

---

## 🚀 Installation & Local Development

### Prerequisites
- **OpenJDK 21**
- **Node.js 20+**
- **Docker** (Required for the database and vector engine)

### Infrastructure Setup
Spin up the local PostgreSQL instance with pgvector support:
```bash
docker-compose up -d
```

### Backend Setup
1. Enter the `backend` directory.
2. Ensure you have a valid local or cloud PostgreSQL instance running.
3. Run the development server:
```bash
./mvnw spring-boot:run
```

### Frontend Setup
1. Enter the `frontend` directory.
2. Install dependencies:
```bash
npm install
```
3. Start the Vite dev server:
```bash
npm run dev
```

---

## 📖 API & Documentation

- **Swagger UI**: Access interactive documentation at `http://localhost:8080/swagger-ui.html`
- **Database**: Port `5432` (default via Docker Compose)
- **Frontend**: Port `5173` (Vite default)

---

## 📐 Architecture Flow

### AI Retrieval-Augmented Generation (RAG)
1. **Classifier**: Incoming queries are categorized by the `IntentClassifierService`.
2. **Retrieval**: 
   - Factual data (price/stock) is pulled via standard SQL.
   - Semantic data (recommendations) is pulled via `pgvector` similarity search.
3. **Augmentation**: Context is injected into the Gemma 3 model prompt.
4. **Generation**: The LLM generates a natural language response with clickable product suggestions.

---

## ⚠️ Limitations & Known Issues

- **Security Isolation**: Environment variables are currently managed via `application.properties`; moving to an external secrets manager is recommended for production.
- **First Startup**: The system will download a ~500MB embedding model during the first AI interaction.
- **Sandbox Keys**: Payment and eKYC integrations currently use sandbox credentials; production keys are required for real transactions.
- **Dockerization**: The application services themselves (Backend/Frontend) are not yet containerized; only infrastructure is managed via Docker.

---
<div align="center">
  Generated by Senior Engineering Audit Team | SWD392 FPT University
</div>
