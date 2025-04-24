import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/auth"; // Assuming these are still correct

// --- Import the new component ---
import LogoutButton from "@/pages/Authentication/components/LogoutButton";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // const currentUser = getCurrentUser();

    // --- This handler function remains the same ---
    // It contains the logic specific to HOW your app performs logout
    const handleLogout = () => {
        logout(); // Calls your service function
        navigate('/login'); // Redirects
    };

    return (
        <nav>
            <div className="nav-container">
                <div className="nav-brand">
                    <h1>NU HMS</h1>
                </div>
                <ul className="nav-links">
                    {/* Your Link elements remain the same */}
                    <li>
                        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                            Blocks {/* Changed from Buildings based on your code */}
                        </Link>
                    </li>
                    <li>
                        <Link to="/rooms" className={location.pathname === "/rooms" ? "active" : ""}>
                            Rooms
                        </Link>
                    </li>
                    <li>
                        <Link to="/tenants" className={location.pathname === "/tenants" ? "active" : ""}>
                            Tenants
                        </Link>
                    </li>
                    <li>
                        <Link to="/maintenance" className={location.pathname === "/maintenance" ? "active" : ""}>
                            Maintenance
                        </Link>
                    </li>
                    <li>
                        <Link to="/utility-billing" className={location.pathname === "/utility-billing" ? "active" : ""}>
                            Utility Billing
                        </Link>
                    </li>
                    <li>
                        <Link to="/reports" className={location.pathname === "/reports" ? "active" : ""}>
                            Reports
                        </Link>
                    </li>
                </ul>
                <div className="nav-user">
                    {localStorage.getItem('authToken') && (
                        <>
                            {/* --- Replace the inline button with the LogoutButton component --- */}
                            <LogoutButton
                                onLogout={handleLogout} // Pass the handler function as a prop
                                className="logout-button" // Pass the class name for styling consistency
                            />
                        </>
                    )}
                    {/* If user is NOT logged in, you might want an else condition here */}
                    {/* {!currentUser && <Link to="/login">Login</Link>} */}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;