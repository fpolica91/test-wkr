import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import WorkoutCard from '../components/workout/WorkoutCard';
import { useWorkouts } from '../hooks/useWorkouts';
import type { LocationType } from '@fitness/api-client';
import { Dumbbell, History, Sparkles, Home, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const WorkoutPage = () => {
  const { 
    currentWorkout, 
    completedWorkouts, 
    generateWorkout, 
    completeWorkout,
    isGenerating 
  } = useWorkouts();
  
  const [locationType, setLocationType] = useState<LocationType | 'ANY'>('ANY');
  const [isCompleting, setIsCompleting] = useState(false);

  const locationOptions = [
    { value: 'ANY', label: 'Any Location', icon: MapPin },
    { value: 'HOME', label: 'Home', icon: Home },
    { value: 'GYM', label: 'Gym', icon: Building2 },
    { value: 'BOTH', label: 'Home or Gym', icon: MapPin },
  ];

  const handleGenerateWorkout = async () => {
    const selectedLocation = locationType === 'ANY' ? undefined : locationType;
    
    try {
      await generateWorkout(selectedLocation);
    } catch (error) {
      console.error('Failed to generate workout:', error);
    }
  };

  const handleCompleteWorkout = async (workoutId: string) => {
    setIsCompleting(true);
    try {
      await completeWorkout(workoutId);
    } catch (error) {
      console.error('Failed to complete workout:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStartWorkout = (_workoutId: string) => {
    toast.info('Starting workout timer! (Feature in development)');
    // In a real app, you would navigate to a workout timer/session page
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
        <p className="text-gray-600 mt-2">
          Generate personalized workouts and track your progress
        </p>
      </div>

      {/* Generate Workout Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate New Workout
              </CardTitle>
              <CardDescription>
                Get a personalized workout based on your goals and fitness level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location Preference</Label>
                  <Select 
                    value={locationType} 
                    onValueChange={(value: LocationType | 'ANY') => setLocationType(value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Choose where you'll be working out for equipment-specific exercises
                  </p>
                </div>

                <Separator />

                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xs">1</span>
                      </div>
                      <span>Our AI analyzes your fitness level and goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xs">2</span>
                      </div>
                      <span>Generates a balanced workout with 3-5 exercises</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xs">3</span>
                      </div>
                      <span>Provides sets, reps, and rest times</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={handleGenerateWorkout} 
                disabled={isGenerating}
                size="lg"
                className="w-full flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Workout'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Workout Sidebar */}
        <div className="space-y-6">
          {currentWorkout ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Current Workout
                </CardTitle>
                <CardDescription>
                  Ready to start
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutCard 
                  workout={currentWorkout} 
                  compact
                  onComplete={handleCompleteWorkout}
                  onStart={handleStartWorkout}
                />
                <div className="mt-4 space-y-3">
                  <Button 
                    onClick={() => handleStartWorkout(currentWorkout.id)}
                    className="w-full"
                  >
                    Start Workout
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCompleteWorkout(currentWorkout.id)}
                    disabled={isCompleting}
                    className="w-full"
                  >
                    {isCompleting ? 'Marking Complete...' : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Workout</CardTitle>
                <CardDescription>
                  Generate a workout to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    You don't have an active workout. Generate one to get started!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Workouts</span>
                  <span className="font-semibold">{completedWorkouts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Minutes</span>
                  <span className="font-semibold">
                    {completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calories</span>
                  <span className="font-semibold">
                    {completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout History */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Workout History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-6">
          {completedWorkouts.length > 0 ? (
            <div className="space-y-6">
              {completedWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout}
                  onStart={handleStartWorkout}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No workout history yet
                  </h3>
                  <p className="text-gray-600">
                    Complete your first workout to see it here!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPage;