import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  // Mock login - for when backend is not connected
  const mockLogin = (email, password) => {
    // Mock users for testing
    const mockUsers = {
      'admin@meditrack.com': { _id: '1', name: 'Admin Manager', email: 'admin@meditrack.com', role: 'admin', department: 'Administration', specialization: 'Hospital Management', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0001' },
      'sarah.johnson@meditrack.com': { _id: '2', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@meditrack.com', role: 'doctor', department: 'Cardiology', specialization: 'Cardiac Surgery', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0101' },
      'michael.chen@meditrack.com': { _id: '3', name: 'Dr. Michael Chen', email: 'michael.chen@meditrack.com', role: 'doctor', department: 'Emergency', specialization: 'Emergency Medicine', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0102' },
      'patricia.brown@meditrack.com': { _id: '7', name: 'Nurse Patricia Brown', email: 'patricia.brown@meditrack.com', role: 'nurse', department: 'ICU', specialization: '', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0201' },
      'robert.taylor@meditrack.com': { _id: '8', name: 'Nurse Robert Taylor', email: 'robert.taylor@meditrack.com', role: 'nurse', department: 'Emergency', specialization: '', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0202' },
      'patient@meditrack.com': { _id: '99', name: 'Patient User', email: 'patient@meditrack.com', role: 'patient', department: '', specialization: '', isAvailable: true, isEmergencyAvailable: false, contactNumber: '555-9999' }
    }

    const validPasswords = ['admin123', 'doctor123', 'nurse123', 'patient123']
    
    if (mockUsers[email] && validPasswords.includes(password)) {
      return mockUsers[email]
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        try {
          // Priority: Try backend login first
          const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (response.ok) {
            const data = await response.json();
            login(data.user);
            return;
          }
        } catch (backendErr) {
          console.log("Backend login failed, trying mock...", backendErr);
        }

        // Fallback to Mock login
        const mockUser = mockLogin(email, password)
        if (mockUser) {
          login(mockUser)
          return
        }

        setError('Invalid email or password')

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
          body: JSON.stringify({ name, email, password, phone })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        login(data.user);
      }

    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>MediTrack</h1>
          <p>{isLogin ? 'Please sign in to continue' : 'Create a new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          {!isLogin && (
            <>
              <div className="form-group">
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
              <div className="form-group">
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
            </>
          )}

          <div className="form-group">
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

          <div className="form-group">
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
            <div className="form-group">
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="toggle-auth-mode">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="text-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login


