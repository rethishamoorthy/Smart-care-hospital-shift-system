import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import NurseDashboard from './components/NurseDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import DoctorLogin from './components/DoctorLogin';
import NurseLogin from './components/NurseLogin';
import PatientLayout from './components/patient/PatientLayout';
import { PatientLanguageProvider } from './components/patient/PatientLanguageContext';
import DoctorListing from './components/patient/DoctorListing';
import BookAppointment from './components/patient/BookAppointment';
import PatientAppointments from './components/patient/PatientAppointments';
import PatientBilling from './components/patient/PatientBilling';
import StaffModule from './components/Staff/StaffModule';
import MedicalTeamModule from './components/MedicalTeam/MedicalTeamModule';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">Loading...</div>
      </div>
    );
  }

  const renderDashboard = () => {
    // If user is logged in, show role-based dashboard
    if (user) {
      switch (user.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'doctor':
          return <DoctorDashboard />;
        case 'nurse':
          return <NurseDashboard />;
        case 'patient':
          // If patient is on root, redirect to patient portal
          return <Navigate to="/patient/doctors" />;
        default:
          return <Dashboard />;
      }
    }
    // If not logged in, show the home dashboard
    return <Dashboard />;
  };

  return (
    <LanguageProvider>
      <div className="App">
        {/* Navbar shows on all pages except patient routes (handled by PatientLayout sidebar) or if we want it there too. 
             User requirement: "Navbar must be visible ONLY when user role = patient" (referring to sidebar).
             But standard Navbar shouldn't probably show on top of patient layout.
         */}
        <Routes>
          <Route path="/patient/*" element={
            user?.role === 'patient' ? (
              <PatientLanguageProvider>
                <PatientLayout />
              </PatientLanguageProvider>
            ) : <Navigate to="/" />
          }>
            <Route path="doctors" element={<DoctorListing />} />
            <Route path="book/:doctorId" element={<BookAppointment />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="billing" element={<PatientBilling />} />
            <Route path="" element={<Navigate to="doctors" />} />
          </Route>

          {/* Doctor Login Route */}
          <Route path="/doctor-login" element={<DoctorLogin />} />

          {/* Nurse Login Route */}
          <Route path="/nurse-login" element={<NurseLogin />} />

          {/* Admin Login Route */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Staff Module - Independent Route */}
          <Route path="/staff/*" element={<StaffModule />} />
          <Route path="/medical-team/*" element={<MedicalTeamModule />} />

          {/* Default Routes with Top Navbar */}
          <Route path="*" element={
            <>
              <Navbar />
              {renderDashboard()}
            </>
          } />
        </Routes>
      </div>
    </LanguageProvider>
  );
}

export default App;
