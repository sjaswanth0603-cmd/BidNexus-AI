# 🛡️ BidNexusAI — AI-Powered GeM & eGP Procurement Scrutiny Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Portal-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://bidnexus.vercel.app)
[![Render Backend](https://img.shields.io/badge/Render-FastAPI%20Backend-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://bidnexus-ai-backend.onrender.com/api/v1/docs)
[![SIH 2026](https://img.shields.io/badge/SIH-2026%20Problem%20ID%3A%20SIH26100-009F6B?style=for-the-badge)](https://bidnexus.vercel.app)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

> **Next-Generation Procurement Scrutiny Engine**: Verifies public tender requirements against bidder evidence documents with zero black-box AI outputs, page-level audit citations, and evaluator audit trails for **Government e-Marketplace (GeM)** and **State e-Procurement (eGP)** portals.

---

## 🌐 Live Deployments & Fast Demo Access

| Service | URL | Status |
| :--- | :--- | :--- |
| **Production Frontend UI** | [https://bidnexus.vercel.app](https://bidnexus.vercel.app) | 🟢 Live |
| **FastAPI Backend & Swagger API Docs** | [https://bidnexus-ai-backend.onrender.com/api/v1/docs](https://bidnexus-ai-backend.onrender.com/api/v1/docs) | 🟢 Active |
| **System Health Check** | [https://bidnexus-ai-backend.onrender.com/health](https://bidnexus-ai-backend.onrender.com/health) | 🟢 Online |

### ⚡ 1-Click SIH Hackathon Demo Credentials
The login portal features instant 1-click demo login buttons:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Bidder (Vendor)** | `user@example.com` | `Password@123` | Vendor dashboard, bid uploads, compliance self-checks |
| **Evaluator (Admin)** | `admin@example.com` | `Password@123` | Tender creation, evaluator review console, human override |

---

## 🚀 Core Platform Capabilities

- 📄 **Hybrid AI Requirement Extraction**: Automatically ingests complex, multi-page GeM tender documents (PDF/DOCX) and decomposes them into structured Technical, Financial, and Legal criteria with operators (`>=`, `==`, `<=`).
- 🔎 **Cross-Document Contradiction Engine**: Compares technical specification sheets against commercial price schedules to detect discrepancies, unapproved deviations, and hidden caveats.
- 🏛️ **Government Portal Architecture Adapters**: Built-in verification modules for GSTN (GST compliance), PAN verification, Udyam MSME classification, EPFO payment records, and Debarment/Blacklist registries.
- 🎯 **Explainable AI with Citation Grounding**: Every compliance decision links directly to the specific document name, section, and page number with verifiable rationale.
- 🛡️ **Human-in-the-Loop Override Console**: Evaluators maintain complete administrative oversight with tamper-evident audit logging of all manual status overrides and notes.
- 🔒 **Zero-Downtime SafeCollection Architecture**: Resilient database layer that seamlessly falls back to an in-memory transactional cache if remote Atlas connections experience latency.

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌───────────────────────────────┐
                                  │      Vercel Edge Network      │
                                  │   https://bidnexus.vercel.app │
                                  └───────────────┬───────────────┘
                                                  │
                            API Reverse-Proxy     │ (Vite + React 18 + Tailwind)
                            /api/:path*           ▼
                                  ┌───────────────────────────────┐
                                  │     Render Web Service        │
                                  │   bidnexus-ai-backend         │
                                  └───────┬───────────────┬───────┘
                                          │               │
                     MongoDB Protocol     │               │ HTTP / SDK Calls
                                          ▼               ▼
                       ┌────────────────────┐   ┌────────────────────┐
                       │  MongoDB Atlas     │   │  Google Gemini AI  │
                       │  (Cloud Database)  │   │  & Cloudinary      │
                       └────────────────────┘   └────────────────────┘
```

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS, Lucide React icons, Outfit & Plus Jakarta Sans typography
- **Visualizations**: Recharts data analytics and risk radars
- **Routing**: React Router DOM v6 with guarded `ProtectedRoute` and `AdminRoute`

### Backend
- **Framework**: FastAPI (Python 3.10+) with Uvicorn
- **Security**: OAuth2 with JWT tokens (python-jose), bcrypt password hashing
- **Document Ingestion**: PyMuPDF (`fitz`), PyPDF, and python-docx
- **Database Layer**: PyMongo with custom `SafeCollection` resilient proxy
- **AI Integrations**: Google Gemini 1.5 Pro / Flash & OpenAI LLM fallback

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10 or higher
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sjaswanth0603-cmd/BidNexus-AI.git
cd BidNexus-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend will be available at: `http://localhost:8000`
* Interactive API Documentation (Swagger): `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Frontend UI will be available at: `http://localhost:3000` (proxied to port 8000)

---

## 🔑 Key API Endpoints Reference

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user and issue JWT bearer token |
| `POST` | `/auth/register` | Register new bidder/evaluator account |
| `GET` | `/auth/me` | Fetch active authenticated session details |
| `POST` | `/auth/forgot-password` | Generate secure password reset token |
| `POST` | `/auth/reset-password` | Confirm new account password |

### Tender & Bid Management (`/api/v1/bids`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/bids` | List all open tenders and bid solicitations |
| `POST` | `/bids` | Create a new government tender notice |
| `GET` | `/bids/{id}` | Retrieve comprehensive tender details and requirement clauses |
| `POST` | `/bids/{id}/documents` | Upload tender specification or bidder evidence files |
| `POST` | `/bids/{id}/extract-requirements` | Trigger AI requirement extraction on tender PDF |

### Compliance, Reviews & Auditing
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/compliance/evaluate` | Evaluate evidence documents against tender requirements |
| `POST` | `/reviews/override` | Evaluator manual override of an automated status |
| `GET` | `/audit/logs` | Fetch chronological, tamper-evident audit history |
| `GET` | `/health` | Live platform and database connectivity status |

---

## 📂 Project Structure

```
BidNexus-AI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── ai/               # LLM extraction & retrieval services
│   │   ├── api/              # REST route controllers (auth, bids, compliance, etc.)
│   │   ├── auth/             # JWT authentication & password hashing
│   │   ├── database/         # MongoDB Atlas connection & resilient SafeCollection
│   │   ├── document_processing/ # PDF and DOCX text extraction
│   │   └── schemas/          # Pydantic request/response models
│   ├── main.py               # Application entrypoint
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Reusable UI widgets, Navbar, Sidebar, Modals
│   │   ├── context/          # AuthContext & ThemeContext
│   │   ├── pages/            # Login, Register, User & Admin Dashboards
│   │   ├── services/         # Axios API client with production Render fallback
│   │   └── types/            # TypeScript data contracts
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite build & local proxy configuration
│   └── vercel.json           # Vercel routing rules & API proxy
├── render.yaml               # Render Cloud Blueprint definition
├── vercel.json               # Root Vercel deployment configuration
└── .vercelignore             # Optimized deployment exclusions
```

---

## 🏆 SIH Hackathon Evaluation Guide

1. **Sign In**: Visit [https://bidnexus.vercel.app](https://bidnexus.vercel.app) and click **Demo Bidder Login** or **Demo Evaluator Login**.
2. **Explore Tender Notices**: View active GeM and AP eGP procurement tenders with pre-extracted requirement rules.
3. **Upload Bidder Evidence**: Upload vendor proposals, datasheets, or audited balance sheets to run the AI compliance scrutiny pipeline.
4. **Inspect Audit Trails**: Navigate to Evaluator Console to review clause-by-clause confidence scores, page-level citations, and override flags.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
