import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Flame, CheckCircle, PlayCircle, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import type { WorkoutResponse as Workout } from '@fitness/api-client';
import { useState } from 'react';

interface WorkoutCardProps {
  workout: Workout;
  onComplete?: (workoutId: string) => void;
  onStart?: (workoutId: string) => void;
  compact?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onComplete, 
  onStart, 
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

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
               <h3 className="font-semibold text-lg break-words">{workout.name}</h3>
               <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                 <div className="flex items-center gap-1">
                   <Clock className="h-4 w-4" />
                   <span>{workout.duration || 45} min</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Flame className="h-4 w-4" />
                   <span>{workout.caloriesBurned || 250} cal</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Dumbbell className="h-4 w-4" />
                   <span>{workout.exercises.length} ex</span>
                 </div>
               </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant={workout.completed ? "default" : "outline"} className="mb-2">
                {workout.completed ? 'Completed' : 'Pending'}
              </Badge>
              {!workout.completed && onStart && (
                <Button size="sm" onClick={() => onStart(workout.id)}>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
         <div className="flex flex-wrap justify-between items-center gap-2">
           <div className="min-w-0 flex-1">
             <CardTitle className="text-xl break-words">{workout.name}</CardTitle>
             <CardDescription className="flex items-center gap-2 mt-1">
               <Calendar className="h-4 w-4" />
               {formatDate(workout.workoutDate)}
             </CardDescription>
           </div>
           <Badge variant={workout.completed ? "default" : "outline"} className="shrink-0">
             {workout.completed ? 'Completed' : 'Pending'}
           </Badge>
         </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <div className="font-semibold">{workout.duration || 45} min</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-sm">Calories</span>
            </div>
            <div className="font-semibold">{workout.caloriesBurned || 250} cal</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600 text-sm mb-1">Exercises</div>
            <div className="font-semibold">{workout.exercises.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600 text-sm mb-1">Status</div>
            <div className="font-semibold">{workout.completed ? 'Done' : 'Ready'}</div>
          </div>
        </div>

        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExercises(!showExercises)}
            className="mb-4 flex items-center gap-2"
          >
            {showExercises ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Exercises
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Exercises
              </>
            )}
            <span className="ml-1">({workout.exercises.length})</span>
          </Button>
          
          {showExercises && (
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                       <h4 className="font-medium break-words">{exercise.name}</h4>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 mt-1 break-words">{exercise.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {exercise.locationType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div className="text-center bg-gray-50 py-1 rounded">
                      <div className="font-semibold">{exercise.sets}</div>
                      <div className="text-gray-600 text-xs">Sets</div>
                    </div>
                    <div className="text-center bg-gray-50 py-1 rounded">
                      <div className="font-semibold">{exercise.reps}</div>
                      <div className="text-gray-600 text-xs">Reps</div>
                    </div>
                    <div className="text-center bg-gray-50 py-1 rounded">
                       <div className="font-semibold break-words px-1">{exercise.weight || '—'}</div>
                      <div className="text-gray-600 text-xs">Weight</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      {!workout.completed && (
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => onStart && onStart(workout.id)}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Start Workout
          </Button>
          <Button 
            onClick={() => onComplete && onComplete(workout.id)}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Complete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WorkoutCard;