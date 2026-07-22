# 🛒 PriceGuard

> **An automated price tracking platform powered by a production-style CI/CD pipeline.**
> Track product prices, receive instant email alerts when prices drop below your target, and experience a deployment workflow built with modern DevOps best practices.

![CI/CD Pipeline](https://github.com/YOUR_USERNAME/priceguard/actions/workflows/ci-cd.yml/badge.svg)
![Scheduled Price Check](https://github.com/YOUR_USERNAME/priceguard/actions/workflows/price-check.yml/badge.svg)

> **Replace `YOUR_USERNAME` with your GitHub username after publishing the repository.**

---

# Overview

PriceGuard is a full-stack web application that continuously monitors product prices and notifies users via email whenever a product reaches their desired price.

Unlike many academic projects where CI/CD consists only of a simple build workflow, PriceGuard separates **application delivery** from **scheduled business operations** using independent GitHub Actions workflows. This architecture mirrors production engineering practices by isolating deployment automation from background job execution.

---

# Key Features

* Product price tracking with custom target prices
* Automated price checks every 30 minutes
* Email notifications using Resend
* Complete price history logging
* Secure scheduled API execution
* Independent CI/CD and Cron pipelines
* Automatic Preview & Production deployments
* Dependency security auditing
* Unit testing and linting before deployment

---

# Architecture

```text
                 ┌────────────────────────────┐
                 │ GitHub Actions (CI/CD)      │
                 │ Lint → Test → Audit → Build │
                 │        → Deploy             │
                 └──────────────┬─────────────┘
                                │
                                ▼
                 ┌────────────────────────────┐
 Browser ───────▶│ Next.js Application         │
                 │ UI + API Routes             │
                 └──────────────┬─────────────┘
                                │
                                ▼
                 ┌────────────────────────────┐
                 │ Supabase PostgreSQL         │
                 │ Products                    │
                 │ Price History               │
                 │ Alerts                      │
                 └──────────────┬─────────────┘
                                ▲
                                │
                                │ POST /api/check-prices
                                │ Bearer Token Protected
                                │
                 ┌──────────────┴─────────────┐
                 │ GitHub Actions (Cron)       │
                 │ Every 30 Minutes            │
                 └──────────────┬─────────────┘
                                │
                                ▼
                 ┌────────────────────────────┐
                 │ Resend Email Service        │
                 └────────────────────────────┘
```

---

# CI/CD Workflow

The project contains **two independent GitHub Actions workflows**, each serving a dedicated production responsibility.

## 1. CI/CD Pipeline (`ci-cd.yml`)

Triggered on:

* Push
* Pull Request

Pipeline stages:

```
Checkout Repository
        │
Install Dependencies
        │
Run ESLint
        │
Execute Unit Tests
        │
Security Audit
        │
Build Application
        │
Deploy Preview (PR)
        │
Deploy Production (main)
```

Every stage must pass before the next stage begins, ensuring that only verified code reaches production.

---

## 2. Scheduled Price Monitoring (`price-check.yml`)

Runs independently of deployments.

**Triggers**

* Every 30 minutes (Cron)
* Manual execution (`workflow_dispatch`)

Responsibilities:

* Retrieve products from the database
* Generate current prices
* Compare against target prices
* Store historical prices
* Send email alerts
* Log failures without stopping the remaining jobs

This separation ensures that deployment issues never interrupt scheduled monitoring and vice versa.

---

# Why This Architecture?

### Independent Workflows

Deployment automation and scheduled background jobs solve different problems.

Keeping them isolated provides:

* Better fault tolerance
* Easier debugging
* Faster deployments
* Reliable scheduled execution

---

### Deterministic Price Simulation

Instead of scraping retailer websites—which is unreliable and often violates Terms of Service—PriceGuard uses a deterministic mock price generator.

Advantages:

* Repeatable testing
* Stable demonstrations
* Easy replacement with a real pricing API
* Zero dependency on external websites

---

### Secure Scheduled Endpoint

The scheduled API endpoint is protected using a Bearer Token.

This prevents unauthorized requests while allowing GitHub-hosted runners to securely invoke the endpoint over the public internet.

---

### Fault-Tolerant Processing

Each product is processed independently.

```
Product 1 ✔
Product 2 ✔
Product 3 ❌
Product 4 ✔
```

A failure affecting one product never interrupts processing for the remaining products.

---

### Security as a Deployment Gate

Dependency scanning is part of the deployment pipeline.

```
npm audit --audit-level=high
```

High or critical vulnerabilities immediately fail the workflow, preventing insecure deployments.

---

# Technology Stack

| Layer           | Technology            |
| --------------- | --------------------- |
| Frontend        | Next.js (App Router)  |
| Backend         | Next.js API Routes    |
| Database        | Supabase (PostgreSQL) |
| Authentication  | Bearer Token          |
| Email Service   | Resend                |
| CI/CD           | GitHub Actions        |
| Hosting         | Vercel                |
| Version Control | GitHub                |

---

# Project Structure

```text
PriceGuard/
│
├── app/
├── lib/
│   └── mockPriceFeed.js
│
├── supabase/
│   └── schema.sql
│
├── .github/
│   └── workflows/
│       ├── ci-cd.yml
│       └── price-check.yml
│
├── README.md
└── package.json
```

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/priceguard.git
cd priceguard
```

---

## 2. Configure Supabase

Execute:

```
supabase/schema.sql
```

This creates:

* products
* price_history
* alerts_sent

---

## 3. Configure Vercel

Create:

* Preview Deploy Hook
* Production Deploy Hook

---

## 4. Configure Resend

Generate a Resend API Key.

---

## 5. GitHub Secrets

| Secret                     | Purpose                     |
| -------------------------- | --------------------------- |
| SUPABASE_URL               | Database connection         |
| SUPABASE_SERVICE_ROLE_KEY  | Database authentication     |
| VERCEL_PROD_DEPLOY_HOOK    | Production deployment       |
| VERCEL_PREVIEW_DEPLOY_HOOK | Preview deployment          |
| PRODUCTION_URL             | Scheduled workflow endpoint |
| PRICE_CHECK_SECRET         | Endpoint authentication     |

---

## 6. Vercel Environment Variables

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
ALERT_FROM_EMAIL
PRICE_CHECK_SECRET
```

---

# Deployment

Push your code to the **main** branch.

GitHub Actions will automatically:

* Lint the project
* Execute unit tests
* Perform dependency security scanning
* Build the application
* Deploy to Vercel

After deployment, manually trigger **price-check.yml** once to verify the complete alert workflow before relying on the scheduled execution.

---

# Production Highlights

* Production-style CI/CD implementation
* Automated Preview Deployments
* Automated Production Deployments
* Scheduled background processing
* Secure API communication
* Dependency vulnerability checks
* Modular architecture
* Fault-tolerant execution
* Scalable backend design

---

# Future Improvements

* Real product price APIs
* Integration testing with Supabase and Resend
* Docker-based deployment
* Monitoring and logging dashboard
* Rollback strategy for production releases
* User authentication and personalized dashboards
* Analytics for historical price trends
* Multi-vendor product comparison

---

# Learning Outcomes

This project demonstrates practical experience with:

* GitHub Actions
* Continuous Integration
* Continuous Deployment
* Scheduled Automation
* Next.js App Router
* PostgreSQL
* Supabase
* API Security
* Production Deployment
* Email Automation
* Background Job Processing
* DevOps Best Practices

---

# License

This project is intended for educational and portfolio purposes.

---

## Author

**Sri Ram Charan**

B.Tech – Computer Science Engineering (AI & ML)

Passionate about **Full-Stack Development, Cloud Computing, DevOps, Artificial Intelligence, and Production Software Engineering**.

If you found this project helpful, consider giving it a ⭐ on GitHub.

This version is structured like a professional open-source project README, with clearer sections, stronger technical language, and formatting suitable for recruiters, hiring managers, and GitHub visitors.
