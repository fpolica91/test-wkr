import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import { useGoals } from '../hooks/useGoals';
import { useUserStats } from '../hooks/useUserStats';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import WorkoutCard from '../components/workout/WorkoutCard';
import { 
  Dumbbell, 
  Target, 
  Trophy, 
  Flame, 
  Calendar, 
  TrendingUp,
  PlusCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { 
    currentWorkout, 
    completedWorkouts, 
    generateWorkout, 
    completeWorkout,
    isGenerating 
  } = useWorkouts();
  const { stats: userStats } = useUserStats();
  const { activeGoals } = useGoals();
  
  const [, setIsCompleting] = useState(false);

  const handleGenerateWorkout = async () => {
    try {
      await generateWorkout(undefined);
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

  const dashboardStats = {
    completedWorkouts: userStats?.totalWorkouts ?? completedWorkouts.length,
    totalMinutes: userStats?.totalMinutes ?? completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    totalCalories: userStats?.totalCalories ?? completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    streakDays: userStats?.streakDays ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          {currentWorkout 
            ? `You have a workout ready to go!` 
            : `Ready for your next workout?`
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workouts</p>
                 <p className="text-2xl font-bold">{dashboardStats.completedWorkouts}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Minutes</p>
                 <p className="text-2xl font-bold">{dashboardStats.totalMinutes}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calories</p>
                 <p className="text-2xl font-bold">{dashboardStats.totalCalories}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                 <p className="text-2xl font-bold">{dashboardStats.streakDays} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Workout Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentWorkout ? 'Current Workout' : 'No Active Workout'}
            </h2>
            {!currentWorkout && (
              <Button 
                onClick={handleGenerateWorkout} 
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Workout'}
              </Button>
            )}
          </div>

          {currentWorkout ? (
            <WorkoutCard 
              workout={currentWorkout} 
              onComplete={handleCompleteWorkout}
              onStart={() => toast.info('Starting workout! (Feature in development)')}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No active workout
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Generate a personalized workout based on your goals and fitness level.
                  </p>
                  <Button 
                    onClick={handleGenerateWorkout} 
                    disabled={isGenerating}
                    size="lg"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Workout'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Goals Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Goals
              </CardTitle>
              <CardDescription>
                {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGoals.length > 0 ? (
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{goal.goalType.replace('_', ' ')}</span>
                        {goal.targetValue && (
                          <span className="text-gray-600">{goal.targetValue}</span>
                        )}
                      </div>
                      <Progress value={goal.targetValue ? 40 : 0} className="h-2" />
                    </div>
                  ))}
                  {activeGoals.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{activeGoals.length - 3} more goals
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No active goals set</p>
                  <Link to="/goals">
                    <Button variant="outline" size="sm">
                      Set Goals
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/workout">
                <Button variant="outline" className="w-full justify-start">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Generate New Workout
                </Button>
              </Link>
              <Link to="/goals">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Manage Goals
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info('Workout history coming soon!')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>

          {/* Fitness Level */}
          <Card>
            <CardHeader>
              <CardTitle>Fitness Level</CardTitle>
              <CardDescription>Your current level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">{user?.fitnessLevel.toLowerCase()}</p>
                  <p className="text-sm text-gray-600">
                    {user?.fitnessLevel === 'BEGINNER' && 'Great start! Keep going!'}
                    {user?.fitnessLevel === 'INTERMEDIATE' && 'You\'re making progress!'}
                    {user?.fitnessLevel === 'ADVANCED' && 'Impressive dedication!'}
                  </p>
                </div>
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
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