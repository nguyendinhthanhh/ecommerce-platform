# E-Commerce Platform

## 1. Project Overview

This project is an **E-Commerce Web Platform** developed as a **group assignment for the SWD392 course**.  
The system provides a complete online shopping experience, including product browsing, shopping cart, online payment, order tracking, product reviews, and AI-assisted features.

The platform supports multiple roles such as **Customer**, **Seller**, and **Admin**, and follows a modern **frontend–backend separated architecture** with Continuous Integration (CI).

---

## 2. Project Objectives

The main objectives of this project are:

- Design and implement a modern e-commerce web application
- Apply software engineering principles such as UML use case modeling
- Separate frontend and backend for better scalability
- Integrate supporting systems such as online payment and AI services
- Practice teamwork, Git workflow, and CI configuration

---

## 3. System Features

### 3.1 Customer Features

- Browse and search products
- View product details and recommendations
- Manage shopping cart
- Place orders
- Make online payments (VNPay / Momo – simulated)
- Track order status
- Rate and review products
- Receive customer support via AI chatbot

### 3.2 Seller Features

- Manage shop information
- Manage products (AI-assisted product classification)
- Manage orders and update order status
- View sales reports

### 3.3 Admin Features

- Manage user accounts
- Moderate product content and reviews
- View system reports and statistics

---

## 4. System Architecture

The system follows a **monorepo architecture** with separated frontend and backend:

ecommerce-platform/
├── backend/ # Spring Boot backend
├── frontend/ # React frontend
├── docs/ # UML diagrams and documentation
├── .github/ # CI configuration
└── README.md

### Architecture Overview

- **Frontend**: Handles user interface and user interactions
- **Backend**: Handles business logic, authentication, and data persistence
- **AI System**: Internal supporting system for product classification, recommendation, and chatbot
- **Payment Gateway**: Supporting system for processing online payments

---

## 5. Technology Stack

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- Spring Security (JWT Authentication)
- MySQL
- Maven

### Frontend

- React
- React Router
- Axios
- Modern UI libraries (MUI / Ant Design / Tailwind)

### AI & Payment (Supporting Systems)

- AI features implemented as internal services or mocked logic
- Online payment simulated for VNPay / Momo integration

### DevOps

- Git & GitHub
- GitHub Actions (CI)

---

## 6. Use Case Summary

The system is designed based on high-level UML use cases.

### Actors

- Customer
- Seller
- Admin

### Main Use Cases

- Browse Products
- Manage Shopping Cart
- Place Order
- Make Online Payment
- Track Order
- Rate and Review Products
- Manage Products
- Manage Orders
- Moderate Content
- View System Reports

AI and Payment Gateway are modeled as **supporting systems**, not external actors.

---

## 7. Order Status Flow

The order tracking feature follows this status flow:

Order Placed
↓
Order Confirmed
↓
Shipped
↓
Delivered

- Order status is updated by the system or seller
- Customers can track the current order status at any time

---

## 8. Continuous Integration (CI)

This project uses **GitHub Actions** for Continuous Integration:

- Automatically builds backend and frontend on each push
- Ensures code quality and build consistency
- Helps detect errors early during development

CI configuration is located at:

.github/workflows/ci.yml

---

## 9. How to Run the Project

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```
