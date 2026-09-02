<div align="center">

# 🚗 SERVIQ

### Enterprise Vehicle & Fleet Maintenance Intelligence Platform

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Mobile%20Native-119eff?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable%20Offline-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

<p align="center">
  <strong>Single Codebase • Desktop Web App • Installable Responsive PWA • Native iOS & Android APK</strong>
</p>

[Key Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Native Mobile Builds](#-native-mobile-builds) • [Deployment](#-deployment)

---

</div>

## 📌 About SERVIQ

**SERVIQ** is a unified digital vehicle maintenance command center engineered for individual car owners, transport companies, logistics hubs, and enterprise commercial fleet operators. 

It keeps every vehicle road-ready, compliant, and cost-efficient by combining **dual-trigger predictive servicing** (calendar time + odometer milestones), **breakdown repair ticketing**, **digital document compliance**, and **real-time cost-per-kilometer analytics** across all branches.

SERVIQ runs on a **single codebase** that powers:
1. **Desktop Web App** — High-density fleet manager operations command center.
2. **Responsive Progressive Web App (PWA)** — Offline-first driver portal with background mutation synchronization.
3. **Native Android APK** — Standalone packaged Android application (`com.serviq.app`).
4. **Native iOS App** — Xcode project configured for iPhone & iPad distribution (`com.serviq.app`).

---

## ⚡ Key Features

### 🚙 1. Vehicle & Asset Management
- Comprehensive fleet registry across sedans, haulers, delivery vans, and EVs.
- Real-time **0–100 Fleet Health Scoring Algorithm** tracking overdue services, pending repairs, and document expirations.
- Complete lifecycle log with Odometer history, chassis/VIN identifiers, and active driver assignments.

### ⏰ 2. Predictive Smart Reminders
- Dual-trigger reminder engine: tracks both **calendar intervals** (e.g. 6 months) and **odometer limits** (e.g. 10,000 km).
- Average daily driving distance calculations projecting exact upcoming service dates.
- Automated urgency status badges: `Good`, `Due Soon`, and `Overdue`.

### 🔧 3. Maintenance & Itemized Repair Tracking
- Digital logbooks itemizing spare parts replaced, technician labor, and tax invoices.
- Breakdown ticket management tracking issues from initial driver roadside report to workshop road test and sign-off.
- Verified service history protecting asset warranty and resale value.

### 💰 4. Expenses & Total Cost of Ownership (TCO)
- Monitor recurring fuel logs, workshop invoices, toll receipts, and routine servicing.
- Automatic calculation of fleet-wide and asset-specific **Cost per Kilometer (CPK)**.
- Export audit logs in structured CSV formats.

### 📄 5. Digital Document & Compliance Vault
- Proactive expiry alerts at **30 days, 15 days, 7 days, 1 day, and on expiry**.
- Secure cloud storage for **Insurance Policies, PUC Certificates, Road Fitness, and Commercial Permits**.
- Document preview modal and instant replacement uploads.

### 📱 6. Touch-First Mobile & Driver Portal
- Dedicated mobile view featuring quick actions: **Log Odometer**, **Report Issue / Breakdown**, **Upload Receipt**, and **Emergency Roadside Assistance**.
- Responsive bottom navigation bar with safe-area padding for iPhone Dynamic Island and Android navigation bars.
- Instant camera receipt scanner integration.

### 📡 7. Offline-First Synchronization
- Local IndexedDB / LocalStorage mutation queue for logging odometer readings and issue reports without internet connectivity.
- Automatic background replay when network connectivity is restored (`fleetpulse:offline-queue-changed`).
- Sticky non-intrusive offline status banner.

---

## 🏗 Architecture

```
                                  +-----------------------+
                                  |    React 19 + Vite    |
                                  |   Tailwind CSS v4     |
                                  | Plus Jakarta & Outfit |
                                  +-----------+-----------+
                                              |
                   +--------------------------+--------------------------+
                   |                          |                          |
        +----------v----------+    +----------v----------+    +----------v----------+
        |     Desktop Web     |    |   Mobile PWA App    |    |  Capacitor Native   |
        |  Fleet Admin Portal |    | Offline Service Wkr |    | Android APK & iOS   |
        +----------+----------+    +----------+----------+    +----------+----------+
                   |                          |                          |
                   +--------------------------+--------------------------+
                                              |
                                   +----------v----------+
                                   |      Supabase       |
                                   |  Postgres Database  |
                                   |  Auth + Row-Level   |
                                   |  Realtime + Storage |
                                   +---------------------+
```

- **Frontend Core**: React 19, TypeScript, Vite 6, Tailwind CSS, Lucide React
- **Typography**: Outfit (Display/Headings) + Plus Jakarta Sans (Modern SaaS Body) + JetBrains Mono
- **Backend & Auth**: Supabase (PostgreSQL with Row Level Security, Storage Buckets, Realtime Subscriptions)
- **Native Runtime**: Capacitor 6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`)
- **PWA**: Custom Service Worker (`public/sw.js`) with Stale-While-Revalidate caching strategy

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- **npm** or **pnpm**
- *(Optional for building Android APK)*: Java JDK 21+ and Android SDK Command-line Tools / Android Studio

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thiruppugazhs/vehicle.git
cd vehicle
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the local development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📱 Native Mobile Builds

### Standalone Android APK

The project compiles a standalone Android APK directly wrapping the production web build:

1. Build web application:
```bash
npm run build
```

2. Synchronize web assets to native Android:
```bash
npx cap sync android
```

3. Assemble the Android APK with Gradle:
```bash
cd android
./gradlew assembleDebug
```
The compiled native APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
The application is pre-configured to download directly on mobile from `/downloads/serviq-android.apk`.

### Native iOS App

1. Synchronize web assets to native iOS:
```bash
npx cap sync ios
```

2. Open the Xcode workspace:
```bash
npx cap open ios
```
Open `ios/App/App.xcworkspace` in Xcode on macOS to run on the iOS Simulator, archive for TestFlight, or deploy to connected iPhones and iPads.

---

## 🌐 Deployment

### Vercel Deployment
The repository includes a production-ready `vercel.json` with SPA routing rewrites and proper MIME headers for direct APK downloads:

```bash
vercel --prod
```

Or connect the GitHub repository directly to Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🔐 Security & Data Protection
- **Zero Mock Data**: Production-clean initial state ready for real enterprise vehicle registrations.
- **Row-Level Security (RLS)**: Multi-tenant organization partitioning enforcing role boundaries (Admin, Fleet Manager, Driver, Viewer).
- **Authentication**: Supports Email/Password, Email OTP, SMS Phone OTP, and Google OAuth.

---

## 📄 License & Copyright

© 2026 **SERVIQ Inc.** All rights reserved. Enterprise Vehicle & Fleet Maintenance Command Center.
