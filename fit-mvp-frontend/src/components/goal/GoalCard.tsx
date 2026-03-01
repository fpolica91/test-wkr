import type { GoalResponse as Goal, GoalType } from '@fitness/api-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Target, Edit, Trash2, TrendingUp, CalendarDays } from 'lucide-react';

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getGoalIcon(goal.goalType)}</span>
              <CardTitle className="text-lg">{getGoalLabel(goal.goalType)}</CardTitle>
            </div>
            <CardDescription>
              Created {new Date(goal.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={goal.isActive ? "default" : "outline"}>
            {goal.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {goal.description && (
          <div className="space-y-1">
            <p className="text-sm text-gray-700">{goal.description}</p>
          </div>
        )}

        {/* Target Date Badge */}
        {targetDateFormatted && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {targetDateFormatted}
              {daysRemaining !== null && (
                <span className="ml-1">
                  ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'})
                </span>
              )}
            </Badge>
          </div>
        )}

        {/* Progress Section */}
        {goal.targetValue && unit ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Target: {goal.targetValue} {unit}</span>
                </div>
                {goal.currentValue !== undefined && goal.currentValue !== null && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                    <span>Current: {goal.currentValue} {unit}</span>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Progress: {progressValue}%
              </div>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>Focus on consistency and gradual improvement</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleActive(goal.id, !goal.isActive)}
        >
          {goal.isActive ? 'Mark Inactive' : 'Mark Active'}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(goal)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(goal.id)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;