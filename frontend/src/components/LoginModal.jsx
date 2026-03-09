import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './LoginModal.css'

const LoginModal = ({ role, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('') // For registration
  const [phone, setPhone] = useState('') // For registration
  const [confirmPassword, setConfirmPassword] = useState('') // For registration

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  // Mock login - for when backend is not connected
  const mockLogin = (email, password, selectedRole) => {
    // Mock users for testing
    const mockUsers = {
      'admin@meditrack.com': { _id: '1', name: 'Admin Murugan', email: 'admin@meditrack.com', role: 'admin', department: 'Administration', specialization: 'Hospital Management', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0001' },
      'sarah.johnson@meditrack.com': { _id: '2', name: 'Dr. Ravi', email: 'sarah.johnson@meditrack.com', role: 'doctor', department: 'Cardiology', specialization: 'Cardiac Surgery', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0101' },
      'michael.chen@meditrack.com': { _id: '3', name: 'Dr. Ramana', email: 'michael.chen@meditrack.com', role: 'doctor', department: 'Emergency', specialization: 'Emergency Medicine', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0102' },
      'patricia.brown@meditrack.com': { _id: '7', name: 'Nurse Lakshmi', email: 'patricia.brown@meditrack.com', role: 'nurse', department: 'ICU', specialization: '', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0201' },
      'robert.taylor@meditrack.com': { _id: '8', name: 'Nurse Murugan', email: 'robert.taylor@meditrack.com', role: 'nurse', department: 'Emergency', specialization: '', isAvailable: true, isEmergencyAvailable: true, contactNumber: '555-0202' },
      'patient@meditrack.com': { _id: '99', name: 'Asok', email: 'patient@meditrack.com', role: 'patient', department: '', specialization: '', isAvailable: true, isEmergencyAvailable: false, contactNumber: '555-9999' }
    }

    const validPasswords = ['admin123', 'doctor123', 'nurse123', 'patient123']

    const user = mockUsers[email]
    if (user && validPasswords.includes(password) && user.role === selectedRole) {
      return user
    }
    return null
  }

  const getDefaultEmail = () => {
    const defaults = {
      admin: 'admin@meditrack.com',
      doctor: 'sarah.johnson@meditrack.com',
      nurse: 'patricia.brown@meditrack.com',
      patient: 'patient@meditrack.com'
    }
    return defaults[role] || ''
  }

  const getDefaultPassword = () => {
    const defaults = {
      admin: 'admin123',
      doctor: 'doctor123',
      nurse: 'nurse123',
      patient: 'patient123'
    }
    return defaults[role] || ''
  }

  const handleGoogleLogin = () => {
    // Mock Google Login
    alert('Redirecting to Google OAuth... (Mock)');
    // In real implementation: window.location.href = 'http://localhost:5001/api/auth/google';
    // Simulating successful login:
    if (role === 'patient') {
      login({
        _id: 'google-user-123',
        name: 'Google User',
        email: 'google.user@example.com',
        role: 'patient'
      });
      onClose();
    } else {
      setError('Google Login only available for patients/parents in this demo.');
    }
  };

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
          console.log("Sending:", { email, password });


          if (response.ok) {
            const data = await response.json();
            if (data.user.role !== role) {
              throw new Error('Unauthorized role access');
            }
            login(data.user);
            onClose();
            return;
          }
        } catch (backendErr) {
          console.log("Backend login failed, trying mock...", backendErr);
        }

        // Fallback to Mock login
        const mockUser = mockLogin(email, password, role)
        if (mockUser) {
          login(mockUser)
          onClose()
          return
        }

        setError(`Invalid credentials for ${role}. Please check your email and password.`)

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
          body: JSON.stringify({ name, email, password, role, phone })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        login(data.user);
        onClose(); // Auto-login after register
      }

    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{role.charAt(0).toUpperCase() + role.slice(1)} {isLogin ? 'Login' : 'Sign Up'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form-modal">
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

          <button type="submit" className="login-button-modal" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          {role === 'patient' && (
            <div className="social-login-section">
              <div className="divider"><span>or</span></div>
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <span className="google-icon">G</span> Continue with Google
              </button>
            </div>
          )}

          {role === 'patient' && (
            <div className="toggle-auth-mode">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="text-link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          )}
        </form>


      </div>
    </div>
  )
}

export default LoginModal
