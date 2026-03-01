import type { GoalResponse as Goal, GoalType } from '@fitness/api-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Target, Edit, Trash2, TrendingUp, CalendarDays, CheckCircle2 } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onToggleActive: (goalId: string, isActive: boolean) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onToggleActive }) => {
  const getGoalLabel = (goalType: GoalType) => {
     const labels: Record<GoalType, string> = {
       ['BUILD_MUSCLE']: 'Build Muscle',
       ['LOSE_WEIGHT']: 'Lose Weight',
       ['BE_MORE_ATHLETIC']: 'Be More Athletic',
       ['FLEXIBILITY']: 'Improve Flexibility',
       ['GENERAL_FITNESS']: 'General Fitness',
     };
    return labels[goalType];
  };

  const getGoalIcon = (goalType: GoalType) => {
     const icons: Record<GoalType, string> = {
       ['BUILD_MUSCLE']: '💪',
       ['LOSE_WEIGHT']: '⚖️',
       ['BE_MORE_ATHLETIC']: '🏃',
       ['FLEXIBILITY']: '🧘',
       ['GENERAL_FITNESS']: '🌟',
     };
    return icons[goalType];
  };

  const getGoalUnit = (goalType: GoalType) => {
     const units: Record<GoalType, string | null> = {
       ['BUILD_MUSCLE']: 'lbs',
       ['LOSE_WEIGHT']: 'lbs',
       ['BE_MORE_ATHLETIC']: null,
       ['FLEXIBILITY']: null,
       ['GENERAL_FITNESS']: null,
     };
    return units[goalType];
  };

  const unit = getGoalUnit(goal.goalType);
  
  // Calculate real progress percentage
  const calculateProgress = () => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    if (goal.currentValue === undefined || goal.currentValue === null) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };
  const progressValue = calculateProgress();
  
  // Format target date if present
  const formatTargetDate = () => {
    if (!goal.targetDate) return null;
    const date = new Date(goal.targetDate);
    return date.toLocaleDateString();
  };
  const targetDateFormatted = formatTargetDate();
  
  // Calculate days remaining if target date exists
  const calculateDaysRemaining = () => {
    if (!goal.targetDate) return null;
    const today = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysRemaining = calculateDaysRemaining();

  return (
    <Card className="hover:shadow-md transition-shadow touch-manipulation h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl md:text-2xl">{getGoalIcon(goal.goalType)}</span>
              <CardTitle className="text-base md:text-lg leading-tight">{getGoalLabel(goal.goalType)}</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
              Created {new Date(goal.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={goal.isActive ? "default" : "outline"} className="shrink-0 text-xs">
            {goal.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 md:space-y-4 flex-1">
        {/* Description */}
        {goal.description && (
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-gray-700 line-clamp-2">{goal.description}</p>
          </div>
        )}

        {/* Target Date Badge */}
        {targetDateFormatted && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <CalendarDays className="h-3 w-3" />
              {targetDateFormatted}
              {daysRemaining !== null && (
                <span className="ml-1">
                  ({daysRemaining > 0 ? `${daysRemaining}d left` : daysRemaining === 0 ? 'Today' : 'Overdue'})
                </span>
              )}
            </Badge>
          </div>
        )}

        {/* Progress Section */}
        {goal.targetValue && unit ? (
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-xs md:text-sm truncate">Target: {goal.targetValue} {unit}</span>
                </div>
                {goal.currentValue !== undefined && goal.currentValue !== null && (
                  <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 ml-5">
                    <span>Current: {goal.currentValue} {unit}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-gray-700 flex-shrink-0 ml-2">
                {progressValue >= 100 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {progressValue}%
              </div>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600 py-2">
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs md:text-sm">Focus on consistency and gradual improvement</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleActive(goal.id, !goal.isActive)}
          className="w-full sm:w-auto h-9 text-xs md:text-sm order-2 sm:order-1"
        >
          {goal.isActive ? 'Pause' : 'Activate'}
        </Button>
        
        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(goal)}
            className="flex-1 sm:flex-initial items-center gap-1 h-9 text-xs md:text-sm"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(goal.id)}
            className="flex-1 sm:flex-initial items-center gap-1 h-9 text-xs md:text-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
