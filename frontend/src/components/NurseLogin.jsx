import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './NurseLogin.css'

const NurseLogin = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
          // Verify user is a nurse
          if (data.user.role === 'nurse') {
            login(data.user);
            navigate('/');
            return;
          } else {
            setError('This portal is for nurses only. Please use the nurse login.');
            setLoading(false);
            return;
          }
        } else {
          setError(data.error || 'Invalid email or password');
        }

      } else {
        // --- REGISTRATION FLOW ---
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            password, 
            phone,
            role: 'nurse',
            department
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }

        // Verify registered user is a nurse
        if (data.user.role === 'nurse') {
          login(data.user);
          navigate('/');
        } else {
          setError('Registration completed but user role is not nurse');
        }
      }

    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nurse-login-container">
      <div className="nurse-login-card">
        <div className="nurse-login-header">
          <h1>MediTrack</h1>
          <p>{isLogin ? 'Nurse Portal - Please sign in to continue' : 'Nurse Registration - Create a new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="nurse-login-form">
          {error && <div className="nurse-error-message">{error}</div>}

          {!isLogin && (
            <>
              <div className="nurse-form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="nurse-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="nurse-form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  placeholder="e.g., ICU, Emergency, General Ward, etc."
                />
              </div>
            </>
          )}

          <div className="nurse-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="nurse-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="nurse-form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button type="submit" className="nurse-login-button" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="nurse-toggle-auth-mode">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="nurse-text-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NurseLogin
