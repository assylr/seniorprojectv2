// Import base styles first
import './styles/index.css'; // Global styles
// import './App.css'; // App-specific styles

import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

// --- Import Layouts ---
import AdminLayout from './layouts/AdminLayout'

// --- Import Pages ---
import BuildingsPage from "./pages/Buildings/BuildingsPage"
import Login from "./pages/Login.tsx"; // Keep Login page route if you want to access it directly still
import RoomsPage from "./pages/Rooms/RoomsPage"
import TenantsPage from "./pages/Tenants/TenantsPage"

// --- Import Auth/Nav Components ---
// ProtectedRoute import is no longer strictly needed here unless used elsewhere
// import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Login Route (still accessible if needed) */}
          <Route path="/login" element={<Login />} />

          {/* --- Main Application Routes (Now Publicly Accessible) --- */}
          {/* Removed the ProtectedRoute wrapper */}
          <Route element={<AdminLayout />}> {/* Apply layout directly */}
            {/* Define Routes within the Admin Layout */}

            {/* Default route now goes directly to buildings */}
            <Route index element={<Navigate to="/blocks" replace />} />

            <Route path="blocks" element={<BuildingsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            {/* <Route path="utility-billing" element={<UtilityBilling />} /> */}
            {/* <Route path="maintenance" element={<Maintenance />} /> */}
            {/* <Route path="reports" element={<Reports />} /> */}

            {/* Add other application routes here */}

            {/* Catch-all within the main layout */}
            <Route path="*" element={<div>App Page Not Found</div>} /> {/* Or your NotFoundPage */}

          </Route>{/* End AdminLayout Route */}

          {/* Optional: Top-level catch-all (if you want un-matched routes to go somewhere specific) */}
          {/* If removed, unmatched routes simply won't render anything */}
          {/* <Route path="*" element={<Navigate to="/buildings" replace />} /> */}


        </Routes>
      </Router>
    </div>
  );
}

export default App;