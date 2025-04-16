import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/auth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    
    // If already authenticated, redirect to home
    if (isAuthenticated()) {
        return <Navigate to="/" />;
    }
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>NU Housing Management System</h1>
                    <p>Administrator Login</p>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="primary" 
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
                
                <div className="login-help">
                    <p>For demo purposes, use:</p>
                    <p><strong>Username:</strong> admin</p>
                    <p><strong>Password:</strong> admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
