import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav>
      <ul>
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
          <Link to="/reports" className={location.pathname === "/reports" ? "active" : ""}>
            Reports
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
