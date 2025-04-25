import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/auth"; // Assuming these are still correct
import styles from './Navbar.module.css';

// --- Import the new component ---
import LogoutButton from "@/pages/Authentication/components/LogoutButton";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(getCurrentUser());
    const { language, setLanguage, t } = useLanguage();

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
        navigate('/login');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'kk' : 'en');
    };

    return (
        <nav>
            <div className={styles.navContainer}>
                <div className={styles.navBrand}>
                    <h1>NU HMS</h1>
                </div>
                <ul className={styles.navLinks}>
                    <li>
                        <Link to="/" className={location.pathname === "/" ? styles.active : ""}>
                            {t('nav.blocks')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/rooms" className={location.pathname === "/rooms" ? styles.active : ""}>
                            {t('nav.rooms')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/tenants" className={location.pathname === "/tenants" ? styles.active : ""}>
                            {t('nav.tenants')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/maintenance" className={location.pathname === "/maintenance" ? styles.active : ""}>
                            {t('nav.maintenance')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/reports" className={location.pathname === "/reports" ? styles.active : ""}>
                            {t('nav.reports')}
                        </Link>
                    </li>
                </ul>
                <div className={styles.navUser}>
                    <button 
                        onClick={toggleLanguage} 
                        className={styles.languageButton}
                        title={t('language')}
                    >
                        {language === 'en' ? 'Қаз' : 'En'}
                    </button>
                    {currentUser ? (
                        <LogoutButton
                            onLogout={handleLogout}
                            className={styles.logoutButton}
                        />
                    ) : (
                        <Link to="/login" className={styles.loginButton}>{t('login')}</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
