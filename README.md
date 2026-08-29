# 🚀 BidNexusAI — AI-Powered GeM Procurement Compliance Verification Platform

An intelligent, multi-service e-Procurement verification system for Government e-Marketplace (GeM), State eGP, and Public Tenders.

---

## 🏗️ Architecture Overview

The system consists of 3 decoupled microservices:

```
                  ┌─────────────────────────────────────┐
                  │          React Frontend             │
                  │       http://localhost:3000         │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Spring Boot Java Backend       │
                  │       http://localhost:8080         │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     FastAPI Python AI Microservice  │
                  │       http://localhost:8000         │
                  └─────────────────────────────────────┘
```

1. **`java-backend/` (Port 8080)**:
   - Spring Boot REST API
   - Manages Tenders, Requirements, Vendor Bids, Document Storage, and Evaluator Qualification Decisions.
   - Orchestrates HTTP calls to the Python AI Microservice for document extraction and evaluation.
   - Exposes `mock_govt_records.json` verification data for GST, PAN, and Udyam MSME registry validation.

2. **`python-ai-service/` (Port 8000)**:
   - FastAPI AI Microservice
   - `POST /extract`: Parses PDF/DOCX page chunks using PyMuPDF and PyPDF2 text extraction.
   - `POST /evaluate`: Calls Anthropic Claude API / OpenAI ChatGPT API / Rule Engine to evaluate evidence against tender clauses and explain reasoning in concise sentences.

3. **`frontend/` (Port 3000)**:
   - React + Tailwind CSS + Lucide Icons
   - Pages for Intro/Login, Government Tender Creation (dynamic repeatable requirement rows), Vendor Bid Submission (multiple file upload inputs), Real-time Processing Screen, Score Badge Report (Green $\ge 80\%$, Yellow 50-79%, Red $<50\%$), Evaluator Review Console, and Decision Confirmation.

---

## ⚡ Quick Start Guide (Run All 3 Backends Locally)

### 1️⃣ Start the Python AI Microservice (Port 8000)

```bash
cd python-ai-service
python -m pip install -r requirements.txt
python main.py
```
* Service will start on: **`http://localhost:8000`**

---

### 2️⃣ Start the Java Backend REST API (Port 8080)

```bash
cd java-backend
javac -d bin src/main/java/com/bidnexus/app/BidNexusApplication.java
java -cp bin com.bidnexus.app.BidNexusApplication
```
* Service will start on: **`http://localhost:8080`**

*(Alternative using Maven)*:
```bash
mvn spring-boot:run
```

---

### 3️⃣ Start the React Frontend Application (Port 3000)

```bash
cd frontend
npm install
npm run dev
```
* App will open on: **`http://localhost:3000`**

---

## 📜 Key REST API Endpoints (Java Backend 8080)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tenders` | Government creates a new tender + dynamic requirements |
| `GET` | `/api/tenders` | List open tenders (for vendor dropdown) |
| `POST` | `/api/bids` | Vendor submits a bid with document uploads |
| `POST` | `/api/bids/{id}/evaluate` | Triggers Python AI extraction + evaluation & returns compliance score |
| `GET` | `/api/bids/{id}` | Evaluator fetches full breakdown & evidence reasoning |
| `POST` | `/api/bids/{id}/decision` | Evaluator sets `QUALIFIED`, `DISQUALIFIED`, or `NEEDS_CLARIFICATION` |
| `GET` | `/api/govt-records` | Fetches mock GST, PAN, and Udyam records for verification lookup |

---

## 🧪 Mock Verification Records (`mock_govt_records.json`)

To enable demoing the **Government Verification** step without live API credentials, fake records are stored in `java-backend/mock_govt_records.json`:
- **GSTIN**: `GST37AAACT9876F1Z8` (*TechCorp Solutions AP Pvt Ltd - ACTIVE*)
- **PAN**: `AAACT9876F` (*TECHCORP SOLUTIONS AP PRIVATE LIMITED - VALID*)
- **Udyam**: `UDYAM-AP-03-0012345` (*Medium Enterprise - VERIFIED*)

---

## 🏁 Hackathon Demo Walkthrough Flow

1. Open `http://localhost:3000/government` to create a government tender with dynamic requirement rows.
2. Navigate to `http://localhost:3000/vendor` to select the open tender and upload vendor evidence files.
3. Watch `http://localhost:3000/processing/:bidId` execute real-time extraction and LLM evaluation.
4. Review `http://localhost:3000/score/:bidId` with the Green/Yellow/Red score badge.
5. Perform evaluation on `http://localhost:3000/evaluator/:bidId` and click **Qualify Vendor Bid**.
6. View official signed decision confirmation on `http://localhost:3000/decision/:bidId`.
