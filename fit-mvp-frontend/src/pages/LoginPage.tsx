import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';
import { TurnstileGate } from '../components/TurnstileGate';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(username, password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TurnstileGate>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
        <Card className="w-full max-w-md touch-manipulation">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl">Welcome to FitCoach</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Sign in to continue your fitness journey
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm md:text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 text-base"
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm md:text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 text-base"
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 md:space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 md:h-12 text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </TurnstileGate>
  );
};

export default LoginPage;
