import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GoalsPage from './pages/GoalsPage';
import WorkoutPage from './pages/WorkoutPage';
import ProfilePage from './pages/ProfilePage';
import WeightPage from './pages/WeightPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route element={<ProtectedRoute />}>
               <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/workout" element={<WorkoutPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/weight" element={<WeightPage />} />
               </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
