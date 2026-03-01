import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Flame, CheckCircle, PlayCircle, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import type { WorkoutResponse as Workout, ExerciseResponse as Exercise } from '@fitness/api-client';
import { useState } from 'react';

interface WorkoutCardProps {
  workout: Workout;
  onComplete?: (workoutId: string) => void;
  onStart?: (workoutId: string) => void;
  onToggleExercise: (workoutId: string, exerciseId: string, completed: boolean) => void;
  compact?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onComplete, 
  onStart, 
  onToggleExercise,
  compact = false 
}) => {
  const [showExercises, setShowExercises] = useState(!compact);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const completedExercisesCount = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const allExercisesCompleted = completedExercisesCount === totalExercises && totalExercises > 0;

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow touch-manipulation">
        <CardContent className="p-3 md:p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
               <h3 className="font-semibold text-base md:text-lg break-words leading-tight">{workout.name}</h3>
               <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs md:text-sm text-gray-600">
                 <div className="flex items-center gap-1">
                   <Clock className="h-3.5 w-3.5" />
                   <span>{workout.duration || 45} min</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Flame className="h-3.5 w-3.5" />
                   <span>{workout.caloriesBurned || 250} cal</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Dumbbell className="h-3.5 w-3.5" />
                   <span>{completedExercisesCount}/{totalExercises}</span>
                 </div>
               </div>
               {!workout.completed && totalExercises > 0 && (
                 <div className="mt-2 text-xs md:text-sm">
                   <span className={`font-medium ${allExercisesCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                     {allExercisesCompleted ? 'All exercises done!' : `${completedExercisesCount} of ${totalExercises} completed`}
                   </span>
                 </div>
               )}
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <Badge variant={workout.completed ? "default" : "outline"} className="text-xs">
                {workout.completed ? 'Done' : 'Pending'}
              </Badge>
              {!workout.completed && onStart && (
                <Button size="sm" onClick={() => onStart(workout.id)} className="mt-2 h-8 text-xs">
                  Start
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow touch-manipulation">
      <CardHeader className="pb-3">
         <div className="flex flex-wrap justify-between items-start gap-2">
           <div className="min-w-0 flex-1">
             <CardTitle className="text-lg md:text-xl break-words leading-tight">{workout.name}</CardTitle>
             <CardDescription className="flex items-center gap-2 mt-1 text-xs md:text-sm">
               <Calendar className="h-3.5 w-3.5" />
               {formatDate(workout.workoutDate)}
             </CardDescription>
           </div>
           <Badge variant={workout.completed ? "default" : "outline"} className="shrink-0 text-xs">
             {workout.completed ? 'Completed' : 'Pending'}
           </Badge>
         </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <div className="flex items-center gap-1.5 text-gray-600 mb-0.5 md:mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Duration</span>
            </div>
            <div className="font-semibold text-sm md:text-base">{workout.duration || 45} min</div>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <div className="flex items-center gap-1.5 text-gray-600 mb-0.5 md:mb-1">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs">Calories</span>
            </div>
            <div className="font-semibold text-sm md:text-base">{workout.caloriesBurned || 250} cal</div>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <div className="text-gray-600 text-xs mb-0.5 md:mb-1">Exercises</div>
            <div className="font-semibold text-sm md:text-base">{completedExercisesCount}/{totalExercises}</div>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <div className="text-gray-600 text-xs mb-0.5 md:mb-1">Status</div>
            <div className="font-semibold text-xs md:text-sm">
              {workout.completed ? 'Done' : allExercisesCompleted ? 'Ready' : 'In Progress'}
            </div>
          </div>
        </div>

        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExercises(!showExercises)}
            className="mb-3 flex items-center gap-1.5 h-9 text-xs md:text-sm"
          >
            {showExercises ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show
              </>
            )}
            <span className="ml-1">({completedExercisesCount}/{totalExercises})</span>
          </Button>
          
          {showExercises && (
            <div className="space-y-2 md:space-y-3">
              {workout.exercises.map((exercise: Exercise, index: number) => (
                <ExerciseItem 
                  key={exercise.id || index} 
                  exercise={exercise}
                  workoutId={workout.id}
                  onToggle={onToggleExercise}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      {!workout.completed && (
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => onStart && onStart(workout.id)}
            className="flex items-center gap-2 w-full sm:w-auto h-10 md:h-11"
          >
            <PlayCircle className="h-4 w-4" />
            Start Workout
          </Button>
          <Button 
            onClick={() => onComplete && onComplete(workout.id)}
            className="flex items-center gap-2 w-full sm:w-auto h-10 md:h-11"
            disabled={!allExercisesCompleted}
          >
            <CheckCircle className="h-4 w-4" />
            Mark Complete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

interface ExerciseItemProps {
  exercise: Exercise;
  workoutId: string;
  onToggle?: (workoutId: string, exerciseId: string, completed: boolean) => void;
  disabled?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, workoutId, onToggle, disabled }) => {
  const handleToggle = (checked: boolean) => {
    if (onToggle && !disabled) {
      onToggle(workoutId, exercise.id, checked);
    }
  };

  return (
    <div className={`border-l-4 pl-3 md:pl-4 py-2 md:py-3 rounded-r-lg ${exercise.completed ? 'border-green-500 bg-green-50/50' : 'border-blue-500 bg-white'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2.5 md:gap-3 flex-1 min-w-0">
          <Checkbox 
            id={`exercise-${exercise.id}`}
            checked={exercise.completed}
            onCheckedChange={handleToggle}
            className="mt-1"
          />
          <div className="min-w-0 flex-1">
            <label 
              htmlFor={`exercise-${exercise.id}`}
              className={`font-medium text-sm md:text-base break-words cursor-pointer ${exercise.completed ? 'line-through text-gray-500' : ''}`}
            >
              {exercise.name}
            </label>
            {exercise.description && (
              <p className={`text-xs md:text-sm mt-1 break-words ${exercise.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                {exercise.description}
              </p>
            )}
            {exercise.completed && exercise.completedAt && (
              <p className="text-xs text-green-600 mt-1">
                Completed {new Date(exercise.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {exercise.locationType}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs md:text-sm ml-7 md:ml-8">
        <div className={`text-center py-1.5 md:py-2 rounded ${exercise.completed ? 'bg-green-100' : 'bg-gray-50'}`}>
          <div className={`font-semibold ${exercise.completed ? 'text-green-700' : ''}`}>{exercise.sets}</div>
          <div className={`text-xs ${exercise.completed ? 'text-green-600' : 'text-gray-600'}`}>Sets</div>
        </div>
        <div className={`text-center py-1.5 md:py-2 rounded ${exercise.completed ? 'bg-green-100' : 'bg-gray-50'}`}>
          <div className={`font-semibold ${exercise.completed ? 'text-green-700' : ''}`}>{exercise.reps}</div>
          <div className={`text-xs ${exercise.completed ? 'text-green-600' : 'text-gray-600'}`}>Reps</div>
        </div>
        <div className={`text-center py-1.5 md:py-2 rounded ${exercise.completed ? 'bg-green-100' : 'bg-gray-50'}`}>
          <div className={`font-semibold truncate px-1 ${exercise.completed ? 'text-green-700' : ''}`}>{exercise.weight || '—'}</div>
          <div className={`text-xs ${exercise.completed ? 'text-green-600' : 'text-gray-600'}`}>Weight</div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
