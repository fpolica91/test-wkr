import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, Home, Target, Dumbbell, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Dumbbell className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">FitCoach</span>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/goals" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Target className="h-4 w-4" />
                  <span>Goals</span>
                </Link>
                <Link 
                  to="/workout" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Workout</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-3">
          <Link 
            to="/" 
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link 
            to="/goals" 
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Target className="h-5 w-5" />
            <span className="text-xs mt-1">Goals</span>
          </Link>
          <Link 
            to="/workout" 
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-xs mt-1">Workout</span>
          </Link>
          <Link 
            to="/profile" 
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;