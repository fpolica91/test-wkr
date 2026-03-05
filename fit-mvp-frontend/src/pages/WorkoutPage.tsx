import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import WorkoutCard from '../components/workout/WorkoutCard';
import { useWorkouts } from '../hooks/useWorkouts';
import { Dumbbell, History, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const WorkoutPage = () => {
  const { 
    currentWorkout, 
    completedWorkouts, 
    completeWorkout,
    toggleExerciseCompletion,
    swapExercise,
    regenerateWorkout,
    voteWorkout,
    isRegenerating,
  } = useWorkouts();
  const [isCompleting, setIsCompleting] = useState(false);

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

  const handleSwapExercise = async (workoutId: string, exerciseId: string) => {
    try {
      await swapExercise({ workoutId, exerciseId });
    } catch (error) {
      console.error('Failed to swap exercise:', error);
    }
  };

  const handleRegenerateWorkout = async (workoutId: string, feedback: string, locationTypeParam?: string, focusAreaParam?: string) => {
    try {
      await regenerateWorkout({ workoutId, feedback, locationType: locationTypeParam, focusArea: focusAreaParam });
    } catch (error) {
      console.error('Failed to regenerate workout:', error);
    }
  };

  const handleVoteWorkout = async (workoutId: string, vote: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      await voteWorkout({ workoutId, vote });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Workouts</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          View your workout history and manage your current workout
        </p>
      </div>

      {currentWorkout && (
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
              onSwapExercise={handleSwapExercise}
              onRegenerate={handleRegenerateWorkout}
              onVote={handleVoteWorkout}
              isRegenerating={isRegenerating}
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
      )}

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
                  onVote={handleVoteWorkout}
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
