# KSP Sherlock 🕵️‍♂️🚔

KSP Sherlock is an advanced, AI-driven digital command center designed to revolutionize law enforcement operations, crime analytics, and investigative workflows. Built with modern web technologies, it provides officers and analysts with real-time insights, interactive mapping, and comprehensive offender profiling within a highly secure, visually stunning interface.

## 🚀 Features

- **Secure Authentication Flow**: Robust 4-stage authentication (Landing → Sign In/Up → 2FA Verification → Dashboard) utilizing Firebase Auth. Implements strict route guarding and sessionStorage persistence for automatic sign-out upon browser close.
- **AI-Powered Analytics (Recharts)**: Deep dive into crime statistics, identifying trends, correlations, and predictive insights across different regions and timeframes.
- **Interactive Mapping (Leaflet and openstreetmap)**: Real-time geographical visualizations including Crime Heatmaps and clustering, allowing for spatial analysis of incidents.
- **Offender Profiling**: Comprehensive digital dossiers of criminals, tracking risk levels, known associates, crime history, and last known locations.
- **Criminal Network Graph**: Visual representation of connections between offenders, syndicates, and ongoing cases.
- **Smart FIR Search**: Rapid retrieval and filtering of First Information Reports.
- **Case Similarity Engine**: Automatically find related historical cases based on M.O. and incident metadata.
- **Automated Reporting (jsPDF)**: Generate and export professional PDF dossiers and analytical reports directly from the dashboard.
- **Modern, High-Contrast UI**: Designed with Tailwind CSS and Framer Motion for a sleek, responsive, and highly interactive "dark-mode" command center aesthetic.
## 🏗️ Architecture

KSP Sherlock is built as a Single Page Application (SPA) using React. The architecture is modular and component-driven, emphasizing separation of concerns:
- **Presentation Layer**: Built with functional React components, styled via Tailwind CSS, and animated using Framer Motion.
- **Routing Layer**: Managed by `react-router-dom` (HashRouter) with highly robust, guarded routes (`ProtectedRoute` & `PendingAuthRoute`) to enforce the authentication pipeline.
- **State Management**: React Context (`AuthContext`) handles global authentication state, while localized state uses native React hooks.
- **Service Layer**: External interactions (like fetching case similarity data from `caseSimilarityEngine.ts` or database interactions) are abstracted into modular service files in `src/services/`.
- **Data & Configuration**: Environment variables handle critical configurations for services like Firebase, while static/mocked data resides in `src/data/` for rapid UI development and testing.

## 📂 Folder Structure

```text
KSP-Sherlock/
├── public/                 # Static assets and Vite entry files
│   └── client-package.json # Catalyst deployment configuration
├── src/                    # Main source code
│   ├── assets/             # Images, icons, and fonts
│   ├── components/         # Reusable UI components (Modals, Layouts, Charts, etc.)
│   ├── config/             # Configuration files (Firebase setup)
│   ├── context/            # React Context providers (AuthContext)
│   ├── data/               # Static/mock JSON data (cases, offenders)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Top-level route components (Dashboard, Profiling, etc.)
│   ├── services/           # External API integration and business logic
│   ├── supabase/           # Supabase config and edge functions (if applicable)
│   ├── types/              # TypeScript interface definitions
│   ├── utils/              # Helper functions and utilities
│   ├── App.tsx             # Main routing and application wrapper
│   ├── index.css           # Global Tailwind and custom theme styles
│   └── main.tsx            # React DOM entry point
├── .env                    # Environment variables (ignored in Git)
├── catalyst.json           # Zoho Catalyst deployment routing config
├── package.json            # Node.js dependencies and scripts
├── tailwind.config.js      # Tailwind CSS theme and plugin configurations
├── tsconfig.json           # TypeScript compiler options
└── vite.config.ts          # Vite bundler configuration
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Mapping**: Leaflet, React-Leaflet, Leaflet.heat, React-Leaflet-Cluster, openstreetmap
- **Charting**: Recharts
- **PDF Generation**: jsPDF, html2canvas
- **Authentication**: Firebase Authentication
- **Routing**: React Router (HashRouter for broad compatibility)
- **Deployment**: Zoho Catalyst (Serverless)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Firebase Project (for Authentication)
- Zoho Catalyst CLI (for Deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AritraFromTheBlock/KSP-Sherlock.git
   cd KSP-Sherlock
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Running Locally

To start the development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

### Building for Production

To create a highly optimized production build:
```bash
npm run build
```
The bundled files will be generated in the `dist` directory.

### Deployment (Zoho Catalyst)

This project is configured for deployment on Zoho Catalyst.
1. Initialize Catalyst (if not already done): `catalyst init`
2. Build the Vite project: `npm run build`
3. Deploy the client: `catalyst deploy`

## 🔒 Security Architecture

- **Session Management**: Authentication tokens are strictly maintained in `sessionStorage` ensuring sessions are inherently volatile and destroyed when the browser context closes.
- **Route Protection**: The `<ProtectedRoute>` and `<PendingAuthRoute>` wrappers ensure strict navigation enforcement, preventing URL manipulation from bypassing authentication phases.
- **2FA Enforcement**: The dashboard is completely inaccessible until both primary credentials and the secondary access code are validated server-side.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.
