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
                    <div className={styles.languageDropdown}>
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'kk' | 'ru')}
                            className={styles.languageSelect}
                            title={t('language')}
                        >
                            <option value="en">{t('english')}</option>
                            <option value="kk">{t('kazakh')}</option>
                            <option value="ru">Русский</option>
                        </select>
                    </div>
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
