import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, RotateCcw, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useWorkouts } from '../hooks/useWorkouts';
import type { ExerciseResponse } from '@fitness/api-client';

const ExercisePage = () => {
  const { workoutId, exerciseId } = useParams<{ workoutId: string; exerciseId: string }>();
  const navigate = useNavigate();
  const { swapExercise, isSwappingExercise } = useWorkouts();
  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!workoutId || !exerciseId) {
        toast.error('Invalid exercise URL');
        navigate('/workout');
        return;
      }

      try {
        const data = await api.getExercise(workoutId, exerciseId);
        setExercise(data);
      } catch (error) {
        console.error('Failed to fetch exercise:', error);
        toast.error('Failed to load exercise');
        navigate('/workout');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [workoutId, exerciseId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-sm">Loading exercise...</div>
      </div>
    );
  }

  if (!exercise) {
    return null;
  }

  const handleSwap = async () => {
    if (!workoutId || !exerciseId) return;
    try {
      await swapExercise({ workoutId, exerciseId });
      navigate(-1);
    } catch (error) {
      console.error('Failed to swap exercise:', error);
    }
  };

  const handleToggle = () => {
    if (workoutId && exerciseId) {
      api.toggleExerciseCompletion(workoutId, exerciseId, !exercise.completed)
        .then((updated) => {
          setExercise(updated);
          toast.success(updated.completed ? 'Marked as complete!' : 'Marked as incomplete');
        })
        .catch(() => toast.error('Failed to update exercise'));
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] md:min-h-0 md:max-w-2xl md:mx-auto">
      {/* Top bar with back + status */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 active:text-gray-800 py-2 pr-3 -ml-1 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          exercise.completed
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {exercise.completed ? 'Completed' : 'Pending'}
        </span>
      </div>

      {/* Exercise name */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
        {exercise.name}
      </h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-5">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          <span>{exercise.locationType}</span>
        </div>
        {exercise.completed && exercise.completedAt && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{new Date(exercise.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{exercise.sets}</div>
          <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Sets</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{exercise.reps}</div>
          <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Reps</div>
        </div>
      </div>

      {/* Weight */}
      {exercise.weight && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-5">
          <div className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-1">Weight</div>
          <p className="text-sm text-orange-700 leading-relaxed">{exercise.weight}</p>
        </div>
      )}

      {/* Description */}
      {exercise.description && (
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{exercise.description}</p>
        </div>
      )}

      {/* Spacer pushes buttons to bottom on mobile */}
      <div className="flex-1" />

      {/* Action buttons - sticky bottom on mobile */}
      <div className="sticky bottom-20 md:static bg-white/95 backdrop-blur-sm pt-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:pt-4 md:pb-0">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 text-sm font-semibold touch-manipulation"
            onClick={handleSwap}
            disabled={isSwappingExercise}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${isSwappingExercise ? 'animate-spin' : ''}`} />
            {isSwappingExercise ? 'Swapping...' : 'Swap'}
          </Button>
          <Button
            className={`flex-1 h-12 text-sm font-semibold touch-manipulation ${
              exercise.completed
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={handleToggle}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {exercise.completed ? 'Undo' : 'Complete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;
