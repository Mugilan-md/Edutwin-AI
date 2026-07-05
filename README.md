# Edutwin AI — Centralised digital platform for student activity record in HEIs

> **Edutwin AI** is an institutional digital-twin platform designed for Higher Education Institutions (HEIs) to centralize student co-curricular and extra-curricular achievements, automate credit auditing workflows, and predict institutional accreditation outcomes using Machine Learning.

---

## 🚀 Key Features

* **AI-Powered OCR Parser:** Instantly extracts co-curricular certificate details (such as Category, Date, Title, Organization) from uploaded documents, assigning AI confidence ratings to speed up data logging.
* **ML Credit Projector:** Applies linear regression models to analyze student participation pace and project graduation credit outcomes in real-time.
* **Departmental Skill Density Map:** Employs TF-IDF text classification algorithms to group and visualize core student competencies (e.g. Software Engineering, Leadership, Research) across departments.
* **Cosine Similarity Career Matcher:** Recommends professional paths by matching student skill vectors against industry-standard role templates.
* **NAAC Accreditation Forecaster:** Calculates institutional accreditation CGPA (up to 4.00) based on student participation density and department-wide verified achievements.
* **Secure Role-Based Dashboard Access:** Features separate, custom-aligned views and features for **Students**, **Faculty Reviewers**, and **System Admins**.
* **Public Portfolios & NLG Summaries:** Auto-generates shareable student portfolios complete with PDF print styling and natural language resume summaries.

---

## 🛠️ Technology Stack

* **Frontend:** React.js, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Backend Database:** Supabase Postgres
* **Auth & Security:** Supabase Auth with custom Row Level Security (RLS) policies
* **Cloud Storage:** Supabase Storage (Public bucket for certificates)
* **Hosting:** Vercel

---

## 📂 Project Structure

```text
├── src/
│   ├── components/       # Common layouts (Navbar, etc.)
│   ├── lib/              # Supabase Client instantiation
│   ├── pages/            # Core views (Student/Faculty/Admin Dashboards, Portfolio)
│   ├── services/         # API Layer (auth, profiles, activities, storage)
│   ├── App.tsx           # Route configurations
│   ├── main.tsx          # App bootstrap
│   └── index.css         # Tailwind directives and SaaS design tokens
├── supabase_setup.md     # SQL schema setup scripts, functions, and triggers
├── package.json          # Dependency tree
└── vite.config.ts        # Vite configuration
```

---

## 📦 Local Installation Guide

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd edutwin-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
   ```

4. **Initialize database schemas:**
   Copy the SQL scripts from `supabase_setup.md` and execute them in your Supabase SQL Editor to configure tables, triggers, and RLS policies.

5. **Start development server:**
   ```bash
   npm run dev
   ```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
