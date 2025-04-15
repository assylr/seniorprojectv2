import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const ProtectedRoute = () => {
    if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" />;
    }
    
    // Render child routes
    return <Outlet />;
};

export default ProtectedRoute;
