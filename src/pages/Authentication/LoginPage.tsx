import { ChangeEvent, FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isAuthenticated, login } from '@/services/auth'
import styles from './LoginPage.module.css'

const LoginPage = () => {
  const [email, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  if (isAuthenticated()) return <Navigate to="/" />

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)


    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-card']}>
        <div className={styles['login-header']}>
          <h1>NU Housing Management System</h1>
          <p>Administrator Login</p>
        </div>

        {error && <div className={styles['alert']}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
              autoFocus
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className={styles['login-help']}>
          <p>For demo purposes, use:</p>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
