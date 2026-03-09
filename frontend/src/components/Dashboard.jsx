import ConstantCarePatients from './ConstantCarePatients'
import AvailableStaff from './AvailableStaff'
import './Dashboard.css'
import { useState, useEffect } from 'react'

const Dashboard = () => {
  const [patients, setPatients] = useState([])
  const [availableStaff, setAvailableStaff] = useState({ doctors: [], nurses: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* Removed unused hooks */


  useEffect(() => {
    // Using mock data instead of API calls - uncomment fetchData() below when backend is ready
    loadMockData()
    // fetchData() // Uncomment this when backend is ready
  }, [])

  // Mock data function - using dummy data for now
  const loadMockData = () => {
    setLoading(true)

    // Mock patients data
    const mockPatients = [
      {
        _id: '1',
        name: 'Asok',
        patientId: 'P001',
        department: 'ICU',
        needsConstantCare: true,
        assignedStaff: [
          { _id: '1', name: 'Dr. Ravi', role: 'doctor', department: 'Cardiology', contactNumber: '555-0101' },
          { _id: '6', name: 'Nurse Lakshmi', role: 'nurse', department: 'ICU', contactNumber: '555-0201' }
        ]
      },
      {
        _id: '2',
        name: 'Lakshmi',
        patientId: 'P002',
        department: 'Cardiology',
        needsConstantCare: true,
        assignedStaff: [
          { _id: '5', name: 'Dr. Meena', role: 'doctor', department: 'Cardiology', contactNumber: '555-0105' }
        ]
      },
      {
        _id: '4',
        name: 'Meena',
        patientId: 'P004',
        department: 'ICU',
        needsConstantCare: true,
        assignedStaff: [
          { _id: '4', name: 'Dr. Govintha', role: 'doctor', department: 'ICU', contactNumber: '555-0104' },
          { _id: '9', name: 'Nurse Karthikeyan', role: 'nurse', department: 'ICU', contactNumber: '555-0204' }
        ]
      },
      {
        _id: '6',
        name: 'Ramaya',
        patientId: 'P006',
        department: 'Emergency',
        needsConstantCare: true,
        assignedStaff: [
          { _id: '2', name: 'Dr. Ramana', role: 'doctor', department: 'Emergency', contactNumber: '555-0102' },
          { _id: '7', name: 'Nurse Murugan', role: 'nurse', department: 'Emergency', contactNumber: '555-0202' }
        ]
      }
    ]

    // Mock staff data
    const mockStaff = {
      doctors: [
        {
          _id: '1',
          name: 'Dr. Ravi',
          role: 'doctor',
          department: 'Cardiology',
          specialization: 'Cardiac Surgery',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0101'
        },
        {
          _id: '2',
          name: 'Dr. Ramana',
          role: 'doctor',
          department: 'Emergency',
          specialization: 'Emergency Medicine',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0102'
        },
        {
          _id: '4',
          name: 'Dr. Govintha',
          role: 'doctor',
          department: 'ICU',
          specialization: 'Intensive Care',
          isAvailable: true,
          isEmergencyAvailable: false,
          contactNumber: '555-0104'
        },
        {
          _id: '5',
          name: 'Dr. Meena',
          role: 'doctor',
          department: 'Cardiology',
          specialization: 'Cardiology',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0105'
        }
      ],
      nurses: [
        {
          _id: '6',
          name: 'Nurse Lakshmi',
          role: 'nurse',
          department: 'ICU',
          specialization: '',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0201'
        },
        {
          _id: '7',
          name: 'Nurse Murugan',
          role: 'nurse',
          department: 'Emergency',
          specialization: '',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0202'
        },
        {
          _id: '9',
          name: 'Nurse Karthikeyan',
          role: 'nurse',
          department: 'ICU',
          specialization: '',
          isAvailable: true,
          isEmergencyAvailable: false,
          contactNumber: '555-0204'
        },
        {
          _id: '10',
          name: 'Nurse Anitha',
          role: 'nurse',
          department: 'Pediatrics',
          specialization: '',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0205'
        },
        {
          _id: '11',
          name: 'Nurse Senthil',
          role: 'nurse',
          department: 'Emergency',
          specialization: '',
          isAvailable: true,
          isEmergencyAvailable: true,
          contactNumber: '555-0206'
        }
      ]
    }

    // Simulate loading delay
    setTimeout(() => {
      setPatients(mockPatients)
      setAvailableStaff(mockStaff)
      setLoading(false)
    }, 500)
  }

  // API call function - commented out for now, uncomment when backend is ready
  /*
  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsRes, staffRes] = await Promise.all([
        axios.get('/api/patients/constant-care'),
        axios.get('/api/staff/available')
      ])
      
      setPatients(patientsRes.data)
      setAvailableStaff(staffRes.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }
  */

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>MediTrack</h1>
        <p className="subtitle">Dashboard Overview</p>
        <button
          onClick={() => window.location.href = '/staff'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0f4c5c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Staff Module
        </button>
        <button
          onClick={() => window.location.href = '/medical-team'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0f4c5c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Medical Team
        </button>

      </header>



      <main className="dashboard-main">
        <section className="section constant-care-section">
          <h2>Constant Care Patients</h2>
          <ConstantCarePatients patients={patients} />
        </section>

        <section className="section available-staff-section">
          <h2>Available Staff</h2>
          <AvailableStaff staff={availableStaff} />
        </section>
      </main>
    </div>
  )
}

export default Dashboard

