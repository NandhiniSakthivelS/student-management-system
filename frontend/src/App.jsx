import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IntroScreen from './IntroScreen';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Fees from './pages/Fees';
import Notices from './pages/Notices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('sms_token');
  return isAuth ? children : <Navigate to="/login" replace />;
}

function RoleBasedDashboard() {
  const role = localStorage.getItem('sms_user_role') || 'Admin';
  if (role === 'Student') return <StudentDashboard />;
  if (role === 'Faculty') return <FacultyDashboard />;
  return <Dashboard />;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introKey] = useState(() => Date.now().toString());

  useEffect(() => {
    // Apply Appearance Settings on Boot
    const savedTheme = localStorage.getItem('sms_theme') || 'dark';
    const savedAccent = localStorage.getItem('sms_accent') || '#6366f1';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.setProperty('--primary', savedAccent);
    document.documentElement.style.setProperty('--border-glow', `${savedAccent}80`);
    document.documentElement.style.setProperty('--shadow-glow', `0 0 30px ${savedAccent}4d`);
  }, []);

  return (
    <>
      {showIntro && (
        <IntroScreen key={introKey} onFinish={() => setShowIntro(false)} />
      )}
      {!showIntro && (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleBasedDashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="courses" element={<Courses />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="grades" element={<Grades />} />
              <Route path="fees" element={<Fees />} />
              <Route path="notices" element={<Notices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}
