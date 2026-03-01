import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import WorkoutCard from '../components/workout/WorkoutCard';
import { useWorkouts } from '../hooks/useWorkouts';
import type { LocationType, FocusArea } from '@fitness/api-client';
import { Dumbbell, History, Sparkles, Home, Building2, ChevronRight, Target, Flame, Activity, DumbbellIcon, PersonStanding } from 'lucide-react';
import { toast } from 'sonner';

const WorkoutPage = () => {
  const { 
    currentWorkout, 
    completedWorkouts, 
    generateWorkout, 
    completeWorkout,
    toggleExerciseCompletion,
    isGenerating 
  } = useWorkouts();
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [locationType, setLocationType] = useState<LocationType>('GYM');
  const [focusArea, setFocusArea] = useState<FocusArea>('BASE_ON_GOALS_AND_LATEST_WORKOUTS');

  const locationOptions = [
    { value: 'GYM', label: 'Gym', icon: Building2 },
    { value: 'HOME', label: 'Home', icon: Home },
  ];

  const focusAreaOptions = [
    { value: 'BASE_ON_GOALS_AND_LATEST_WORKOUTS', label: 'Auto (Based on Goals)', icon: Sparkles },
    { value: 'FULL_BODY', label: 'Full Body', icon: Activity },
    { value: 'CORE', label: 'Core', icon: Target },
    { value: 'STAMINA', label: 'Stamina', icon: Flame },
    { value: 'UPPER_BODY', label: 'Upper Body', icon: DumbbellIcon },
    { value: 'LEGS', label: 'Legs', icon: PersonStanding },
    { value: 'FLEXIBILITY', label: 'Flexibility', icon: Activity },
  ];

  const handleGenerateWorkout = async () => {
    try {
      await generateWorkout({ 
        locationType, 
        focusArea 
      });
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
  };

  const handleToggleExercise = async (workoutId: string, exerciseId: string, completed: boolean) => {
    try {
      await toggleExerciseCompletion({ workoutId, exerciseId, completed });
    } catch (error) {
      console.error('Failed to toggle exercise:', error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - Mobile Optimized */}
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Workouts</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Generate personalized workouts and track your progress
        </p>
      </div>

      {/* Generate Workout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2">
          <Card className="touch-manipulation">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Generate New Workout
              </CardTitle>
              <CardDescription className="text-sm">
                Get a personalized workout based on your goals and fitness level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm md:text-base">Location Preference</Label>
                  <Select 
                    value={locationType} 
                    onValueChange={(value: LocationType) => setLocationType(value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="h-10 md:h-11">
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
                  <p className="text-xs md:text-sm text-gray-500">
                    Choose where you'll be working out for equipment-specific exercises
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focus-area" className="text-sm md:text-base">Focus Area (Optional)</Label>
                  <Select 
                    value={focusArea} 
                    onValueChange={(value: FocusArea) => setFocusArea(value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="h-10 md:h-11">
                      <SelectValue placeholder="Select focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      {focusAreaOptions.map((option) => {
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
                  <p className="text-xs md:text-sm text-gray-500">
                    Target a specific area or let AI decide based on your goals
                  </p>
                </div>

              </div>

              <Button 
                onClick={handleGenerateWorkout} 
                disabled={isGenerating}
                size="lg"
                className="w-full flex items-center gap-2 h-12 text-base"
              >
                <Sparkles className="h-5 w-5" />
                {isGenerating ? 'Generating...' : 'Generate Workout'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Workout Sidebar */}
        <div className="space-y-4">
          {currentWorkout ? (
            <Card className="touch-manipulation">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Dumbbell className="h-4 w-4 md:h-5 md:w-5" />
                  Current Workout
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Ready to start
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutCard 
                  workout={currentWorkout} 
                  compact
                  onComplete={handleCompleteWorkout}
                  onStart={handleStartWorkout}
                  onToggleExercise={handleToggleExercise}
                />
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={() => handleStartWorkout(currentWorkout.id)}
                    className="w-full h-11"
                  >
                    Start Workout
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCompleteWorkout(currentWorkout.id)}
                    disabled={isCompleting}
                    className="w-full h-11"
                  >
                    {isCompleting ? 'Marking Complete...' : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="touch-manipulation">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">No Active Workout</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Generate a workout to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Dumbbell className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm md:text-base">
                    You don't have an active workout. Generate one to get started!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="touch-manipulation">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Workout Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm md:text-base">Completed</span>
                  <span className="font-semibold text-base md:text-lg">{completedWorkouts.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm md:text-base">Total Minutes</span>
                  <span className="font-semibold text-base md:text-lg">
                    {completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm md:text-base">Total Calories</span>
                  <span className="font-semibold text-base md:text-lg">
                    {completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout History */}
      <Tabs defaultValue="history" className="space-y-4 md:space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="history" className="flex items-center gap-2 flex-1 md:flex-initial justify-center">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Workout History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          {completedWorkouts.length > 0 ? (
            <div className="space-y-4">
              {completedWorkouts.slice(0, 5).map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout}
                  onStart={handleStartWorkout}
                  onToggleExercise={handleToggleExercise}
                />
              ))}
              {completedWorkouts.length > 5 && (
                <button 
                  onClick={() => toast.info('Full workout history coming soon!')}
                  className="w-full py-3 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
                >
                  View all {completedWorkouts.length} workouts
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <Card className="touch-manipulation">
              <CardContent className="pt-6">
                <div className="text-center py-10 md:py-12">
                  <History className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    No workout history yet
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
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
