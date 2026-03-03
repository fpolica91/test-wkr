import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, Home, Target, Dumbbell, User, Menu, X, Scale } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/workout', label: 'Workout', icon: Dumbbell },
    { path: '/weight', label: 'Weight', icon: Scale },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FitForge" className="h-8 w-8 rounded-lg" />
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">FitForge</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.path) 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.username}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors ${
                      isActive(item.path) 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t pt-3 mt-3">
                <div className="px-3 py-2 text-sm text-gray-600">
                  Signed in as <span className="font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
