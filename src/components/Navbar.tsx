import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/auth";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav>
            <div className="nav-container">
                <div className="nav-brand">
                    <h1>NU HMS</h1>
                </div>
                <ul className="nav-links">
                    <li>
                        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                            Buildings
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
                    {currentUser && (
                        <>
                            <span className="user-name">{currentUser.name}</span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;