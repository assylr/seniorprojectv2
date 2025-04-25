import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getCurrentUser, logout } from "../services/auth"; // Assuming these are still correct

// --- Import the new component ---
import LogoutButton from "@/pages/Authentication/components/LogoutButton"

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    // Re-check localStorage when path changes (covers login/logout navigation)
    useEffect(() => {
        setCurrentUser(getCurrentUser());
    }, [location.pathname]);

    if (location.pathname === '/login') return null;

    // --- This handler function remains the same ---
    // It contains the logic specific to HOW your app performs logout
    const handleLogout = () => {
        logout();
        setCurrentUser(null); // clear local user in state
    };

    return (
        <nav>
            <div className="nav-container">
                <div className="nav-brand">
                    <h1>NU HMS</h1>
                </div>
                <ul className="nav-links">
                    <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Blocks</Link></li>
                    <li><Link to="/rooms" className={location.pathname === "/rooms" ? "active" : ""}>Rooms</Link></li>
                    <li><Link to="/tenants" className={location.pathname === "/tenants" ? "active" : ""}>Tenants</Link></li>
                    <li><Link to="/maintenance" className={location.pathname === "/maintenance" ? "active" : ""}>Maintenance</Link></li>
                    <li><Link to="/utility-billing" className={location.pathname === "/utility-billing" ? "active" : ""}>Utility Billing</Link></li>
                    <li><Link to="/reports" className={location.pathname === "/reports" ? "active" : ""}>Reports</Link></li>
                </ul>
                <div className="nav-user">
                    {currentUser ? (
                            <LogoutButton
                                onLogout={handleLogout} // Pass the handler function as a prop
                                className="logout-button" // Pass the class name for styling consistency
                            />
                    ) : (
                        <Link to="/login" className="login-button">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
