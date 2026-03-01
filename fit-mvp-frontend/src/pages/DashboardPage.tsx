import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import { useGoals } from '../hooks/useGoals';
import { useUserStats } from '../hooks/useUserStats';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import WorkoutCard from '../components/workout/WorkoutCard';
import { 
  Dumbbell, 
  Target, 
  Trophy, 
  Flame, 
  Calendar, 
  TrendingUp,
  PlusCircle,
  Clock,
  Home,
  Building2,
  ChevronRight,
  Activity,
  Sparkles,
  DumbbellIcon,
  PersonStanding
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import type { LocationType, FocusArea } from '@fitness/api-client';

const DashboardPage = () => {
  const { user } = useAuth();
  const { 
    currentWorkout, 
    completedWorkouts, 
    generateWorkout, 
    completeWorkout,
    toggleExerciseCompletion,
    isGenerating 
  } = useWorkouts();
  const { stats: userStats } = useUserStats();
  const { activeGoals } = useGoals();
  
  const [_, setIsCompleting] = useState(false);
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

  const handleToggleExercise = async (workoutId: string, exerciseId: string, completed: boolean) => {
    try {
      await toggleExerciseCompletion({ workoutId, exerciseId, completed });
    } catch (error) {
      console.error('Failed to toggle exercise:', error);
    }
  };

  const dashboardStats = {
    completedWorkouts: userStats?.totalWorkouts ?? completedWorkouts.length,
    totalMinutes: userStats?.totalMinutes ?? completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    totalCalories: userStats?.totalCalories ?? completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    streakDays: userStats?.streakDays ?? 0,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header - Mobile Optimized */}
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          {currentWorkout 
            ? `You have a workout ready to go!` 
            : `Ready for your next workout?`
          }
        </p>
      </div>

      {/* Quick Stats - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="touch-manipulation">
          <CardContent className="pt-4 md:pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 truncate">Workouts</p>
                <p className="text-xl md:text-2xl font-bold">{dashboardStats.completedWorkouts}</p>
              </div>
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="touch-manipulation">
          <CardContent className="pt-4 md:pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 truncate">Minutes</p>
                <p className="text-xl md:text-2xl font-bold">{dashboardStats.totalMinutes}</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="touch-manipulation">
          <CardContent className="pt-4 md:pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 truncate">Calories</p>
                <p className="text-xl md:text-2xl font-bold">{dashboardStats.totalCalories}</p>
              </div>
              <Flame className="h-6 w-6 md:h-8 md:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="touch-manipulation">
          <CardContent className="pt-4 md:pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 truncate">Streak</p>
                <p className="text-xl md:text-2xl font-bold">{dashboardStats.streakDays}d</p>
              </div>
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Current Workout Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">
              {currentWorkout ? 'Current Workout' : 'No Active Workout'}
            </h2>
            {!currentWorkout && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="w-full sm:w-36">
                  <Label htmlFor="location" className="sr-only">Location</Label>
                  <Select 
                    value={locationType} 
                    onValueChange={(value: LocationType) => setLocationType(value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="h-10 md:h-11">
                      <SelectValue placeholder="Location" />
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
                </div>
                <div className="w-full sm:w-40">
                  <Label htmlFor="focus-area" className="sr-only">Focus Area</Label>
                  <Select 
                    value={focusArea} 
                    onValueChange={(value: FocusArea) => setFocusArea(value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="h-10 md:h-11">
                      <SelectValue placeholder="Focus (optional)" />
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
                </div>
                <Button 
                  onClick={handleGenerateWorkout} 
                  disabled={isGenerating}
                  className="flex items-center gap-2 h-10 md:h-11"
                >
                  <PlusCircle className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            )}
          </div>

          {currentWorkout ? (
            <WorkoutCard 
              workout={currentWorkout} 
              onComplete={handleCompleteWorkout}
              onStart={() => toast.info('Starting workout! (Feature in development)')}
              onToggleExercise={handleToggleExercise}
            />
          ) : (
            <Card className="touch-manipulation">
              <CardContent className="pt-6">
                <div className="text-center py-8 md:py-12">
                  <Dumbbell className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    No active workout
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Generate a personalized workout based on your goals and fitness level.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-lg mx-auto">
                    <div className="w-full sm:w-40">
                      <Label htmlFor="location-mobile" className="sr-only">Location</Label>
                      <Select 
                        value={locationType} 
                        onValueChange={(value: LocationType) => setLocationType(value)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Location" />
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
                    </div>
                    <div className="w-full sm:w-44">
                      <Label htmlFor="focus-area-mobile" className="sr-only">Focus Area</Label>
                      <Select 
                        value={focusArea} 
                        onValueChange={(value: FocusArea) => setFocusArea(value)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Focus (optional)" />
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
                    </div>
                    <Button 
                      onClick={handleGenerateWorkout} 
                      disabled={isGenerating}
                      size="lg"
                      className="flex items-center gap-2 w-full sm:w-auto h-11"
                    >
                      <PlusCircle className="h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Generate Workout'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Stacks on mobile */}
        <div className="space-y-4 md:space-y-6">
          {/* Goals Summary */}
          <Card className="touch-manipulation">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Target className="h-4 w-4 md:h-5 md:w-5" />
                Your Goals
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGoals.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-sm md:text-base">{goal.goalType.replace('_', ' ')}</span>
                        {goal.targetValue && (
                          <span className="text-gray-600 text-sm">{goal.targetValue}</span>
                        )}
                      </div>
                      <Progress value={goal.targetValue ? 40 : 0} className="h-2" />
                    </div>
                  ))}
                  {activeGoals.length > 3 && (
                    <Link to="/goals" className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 pt-2">
                      +{activeGoals.length - 3} more goals
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4 text-sm md:text-base">No active goals set</p>
                  <Link to="/goals">
                    <Button variant="outline" size="sm" className="w-full md:w-auto">
                      Set Goals
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="touch-manipulation">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs md:text-sm">Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              <Link to="/workout" className="block">
                <Button variant="outline" className="w-full justify-start h-10 md:h-11 text-sm md:text-base">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Generate New Workout
                </Button>
              </Link>
              <Link to="/goals" className="block">
                <Button variant="outline" className="w-full justify-start h-10 md:h-11 text-sm md:text-base">
                  <Target className="h-4 w-4 mr-2" />
                  Manage Goals
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start h-10 md:h-11 text-sm md:text-base"
                onClick={() => toast.info('Workout history coming soon!')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>

          {/* Fitness Level */}
          <Card className="touch-manipulation">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Fitness Level</CardTitle>
              <CardDescription className="text-xs md:text-sm">Your current level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xl md:text-2xl font-bold capitalize">{user?.fitnessLevel.toLowerCase()}</p>
                  <p className="text-xs md:text-sm text-gray-600">
                    {user?.fitnessLevel === 'BEGINNER' && 'Great start! Keep going!'}
                    {user?.fitnessLevel === 'INTERMEDIATE' && 'You\'re making progress!'}
                    {user?.fitnessLevel === 'ADVANCED' && 'Impressive dedication!'}
                  </p>
                </div>
                <div className="relative flex-shrink-0 ml-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
