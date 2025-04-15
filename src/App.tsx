import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Buildings from "./pages/Buildings";
import Rooms from "./pages/Rooms";
import Tenants from "./pages/Tenants";
import Reports from "./pages/Reports";
import UtilityBilling from "./pages/UtilityBilling";
import Maintenance from "./pages/Maintenance";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              <>
                <Navbar />
                <main>
                  <Buildings />
                </main>
              </>
            } />
            <Route path="/rooms" element={
              <>
                <Navbar />
                <main>
                  <Rooms />
                </main>
              </>
            } />
            <Route path="/tenants" element={
              <>
                <Navbar />
                <main>
                  <Tenants />
                </main>
              </>
            } />
            <Route path="/utility-billing" element={
              <>
                <Navbar />
                <main>
                  <UtilityBilling />
                </main>
              </>
            } />
            <Route path="/maintenance" element={
              <>
                <Navbar />
                <main>
                  <Maintenance />
                </main>
              </>
            } />
            <Route path="/reports" element={
              <>
                <Navbar />
                <main>
                  <Reports />
                </main>
              </>
            } />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
