import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import RoomLoader from './components/Loader'; // Loader import

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AuthProvider>
        {loading ? <RoomLoader /> : <AppRoutes />}
      </AuthProvider>
    </Router>
  );
}

export default App;
