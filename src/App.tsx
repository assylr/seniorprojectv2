import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Buildings from "./pages/Buildings";
import Rooms from "./pages/Rooms";
import Tenants from "./pages/Tenants";
import Reports from "./pages/Reports";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Buildings />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
