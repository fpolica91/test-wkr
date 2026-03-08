import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import type { UpdateUserRequest, UpdateFitnessLevelRequest, FitnessLevel } from '@fitness/api-client';
import { User, Calendar, Shield, Info } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user?.email || '');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(user?.fitnessLevel || 'BEGINNER');

  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      return api.updateUser(data);
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    },
  });

  const updateFitnessLevelMutation = useMutation({
    mutationFn: async (data: UpdateFitnessLevelRequest) => {
      return api.updateFitnessLevel(data);
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success('Fitness level updated');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error('Failed to update fitness level');
      console.error('Fitness level update error:', error);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: UpdateUserRequest = {};
    if (email !== user?.email) {
      updates.email = email || undefined;
    }
    if (fitnessLevel !== user?.fitnessLevel) {
      updates.fitnessLevel = fitnessLevel;
    }
    if (Object.keys(updates).length > 0) {
      updateUserMutation.mutate(updates);
    } else {
      toast.info('No changes to save');
    }
  };

  const handleFitnessLevelChange = (newLevel: string) => {
    setFitnessLevel(newLevel as FitnessLevel);
    updateFitnessLevelMutation.mutate({ fitnessLevel: newLevel as FitnessLevel });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - Mobile Optimized */}
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Manage your account information and fitness preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Profile Information */}
        <Card className="touch-manipulation">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <User className="h-5 w-5 text-blue-500" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Update your email and fitness level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm md:text-base">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ''}
                  disabled
                  readOnly
                  aria-readonly="true"
                  className="bg-gray-50 h-10 md:h-11"
                />
                <p className="text-xs md:text-sm text-gray-500">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-10 md:h-11"
                />
                <p className="text-xs md:text-sm text-gray-500">
                  We'll use this for notifications (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessLevel" className="text-sm md:text-base">Fitness Level</Label>
                <Select
                  value={fitnessLevel}
                  onValueChange={handleFitnessLevelChange}
                  disabled={updateFitnessLevelMutation.isPending}
                >
                  <SelectTrigger className="h-10 md:h-11">
                    <SelectValue placeholder="Select fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs md:text-sm text-gray-500">
                  This affects your workout recommendations
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateUserMutation.isPending || updateFitnessLevelMutation.isPending}
                className="w-full h-11"
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <div className="space-y-4">
          <Card className="touch-manipulation">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Shield className="h-5 w-5 text-green-500" />
                Account Information
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Your account details and statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm md:text-base">Member Since</span>
                  </div>
                  <span className="font-medium text-sm md:text-base">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm md:text-base">Last Updated</span>
                  </div>
                  <span className="font-medium text-sm md:text-base">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm md:text-base">Fitness Level</span>
                  <span className="font-medium capitalize text-sm md:text-base">
                    {user?.fitnessLevel.toLowerCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm md:text-base">User ID</span>
                  <span className="font-mono text-xs md:text-sm text-gray-500">
                    {user?.id?.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Info className="h-5 w-5 text-blue-500" />
                Workout Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Changing your fitness level will affect the intensity and complexity
                of generated workouts. Intermediate and advanced levels will include
                more challenging exercises and higher volume.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm">
                  <div className="font-semibold text-blue-600 text-sm md:text-base">Beginner</div>
                  <div className="text-xs text-gray-500">3-4 exercises</div>
                </div>
                <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm">
                  <div className="font-semibold text-blue-600 text-sm md:text-base">Intermediate</div>
                  <div className="text-xs text-gray-500">4-5 exercises</div>
                </div>
                <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm">
                  <div className="font-semibold text-blue-600 text-sm md:text-base">Advanced</div>
                  <div className="text-xs text-gray-500">5-6 exercises</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
