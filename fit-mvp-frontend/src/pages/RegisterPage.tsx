import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';
import { TurnstileGate } from '../components/TurnstileGate';
import type { FitnessLevel } from '@fitness/api-client';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('BEGINNER');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(username, password, fitnessLevel, email || undefined);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fitnessLevels = [
    { value: 'BEGINNER', label: 'Beginner', description: 'New to fitness or returning after a break' },
    { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Some experience with regular exercise' },
    { value: 'ADVANCED', label: 'Advanced', description: 'Consistent training experience' },
  ];

  return (
    <TurnstileGate>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4 py-8">
        <Card className="w-full max-w-md touch-manipulation">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl">Join FitCoach</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Create your account to start your fitness journey
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm md:text-base">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 text-base"
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 md:h-12 text-base"
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm md:text-base">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 text-base"
                  autoComplete="new-password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 text-base"
                  autoComplete="new-password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fitnessLevel" className="text-sm md:text-base">Fitness Level *</Label>
                <Select 
                  value={fitnessLevel} 
                  onValueChange={(value: FitnessLevel) => setFitnessLevel(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 md:h-12">
                    <SelectValue placeholder="Select your fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    {fitnessLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="py-1">
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 md:space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 md:h-12 text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </TurnstileGate>
  );
};

export default RegisterPage;
