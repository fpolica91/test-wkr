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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and fitness preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your email and fitness level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <p className="text-sm text-gray-500">
                  We'll use this for notifications (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessLevel">Fitness Level</Label>
                <Select
                  value={fitnessLevel}
                  onValueChange={handleFitnessLevelChange}
                  disabled={updateFitnessLevelMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  This affects your workout recommendations
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateUserMutation.isPending || updateFitnessLevelMutation.isPending}
                className="w-full"
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Fitness Level</span>
                <span className="font-medium capitalize">
                  {user?.fitnessLevel.toLowerCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">User ID</span>
                <span className="font-mono text-sm text-gray-500">
                  {user?.id?.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Workout Impact</h3>
              <p className="text-sm text-gray-600">
                Changing your fitness level will affect the intensity and complexity
                of generated workouts. Intermediate and advanced levels will include
                more challenging exercises and higher volume.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;