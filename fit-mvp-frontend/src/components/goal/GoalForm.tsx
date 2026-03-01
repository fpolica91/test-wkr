import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { GoalType } from '@fitness/api-client';
import { Target, Trash2 } from 'lucide-react';

interface GoalFormProps {
  initialData?: {
    goalType: GoalType;
    description?: string;
    targetValue?: number;
    currentValue?: number;
    targetDate?: string;
  };
  onSubmit: (data: { 
    goalType: GoalType; 
    description?: string;
    targetValue?: number; 
    currentValue?: number;
    targetDate?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const GoalForm: React.FC<GoalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
  isEditing = false,
}) => {
  const [goalType, setGoalType] = useState<GoalType>(initialData?.goalType || 'GENERAL_FITNESS');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [targetValue, setTargetValue] = useState<string>(initialData?.targetValue?.toString() || '');
  const [currentValue, setCurrentValue] = useState<string>(initialData?.currentValue?.toString() || '');
  const [targetDate, setTargetDate] = useState<string>(initialData?.targetDate?.split('T')[0] || ''); // YYYY-MM-DD format

  const goalTypes = [
    { value: 'BUILD_MUSCLE', label: 'Build Muscle', unit: 'lbs' },
    { value: 'LOSE_WEIGHT', label: 'Lose Weight', unit: 'lbs' },
    { value: 'BE_MORE_ATHLETIC', label: 'Be More Athletic', unit: null },
    { value: 'FLEXIBILITY', label: 'Improve Flexibility', unit: null },
    { value: 'GENERAL_FITNESS', label: 'General Fitness', unit: null },
  ];

  const selectedGoal = goalTypes.find(g => g.value === goalType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      goalType,
      description: description || undefined,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      currentValue: currentValue ? parseFloat(currentValue) : undefined,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goalType">Goal Type</Label>
          <Select 
            value={goalType} 
            onValueChange={(value: GoalType) => setGoalType(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a goal type" />
            </SelectTrigger>
            <SelectContent>
              {goalTypes.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{goal.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
           </Select>
        </div>

        {/* Description field - optional */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description
            <span className="text-gray-500 text-sm ml-2">Optional</span>
          </Label>
          <textarea
            id="description"
            placeholder="Be specific: e.g., 'Run 5k in under 30 minutes', 'Do 10 pull-ups', 'Lose 10 lbs in 3 months'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={500}
          />
          <p className="text-sm text-gray-500">
            Make your goal specific and measurable. This helps track progress.
          </p>
        </div>

        {/* Current progress - optional */}
        <div className="space-y-2">
          <Label htmlFor="currentValue">
            Current Progress
            <span className="text-gray-500 text-sm ml-2">Optional</span>
          </Label>
          <Input
            id="currentValue"
            type="number"
            placeholder="e.g., 5 (current weight lifted, miles run, etc.)"
            value={currentValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentValue(e.target.value)}
            disabled={isSubmitting}
            min="0"
            step="0.1"
          />
          <p className="text-sm text-gray-500">
            Where are you starting from? Leave blank if you don't know yet.
          </p>
        </div>

        {/* Target date - optional */}
        <div className="space-y-2">
          <Label htmlFor="targetDate">
            Target Date
            <span className="text-gray-500 text-sm ml-2">Optional</span>
          </Label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
            disabled={isSubmitting}

          />
          <p className="text-sm text-gray-500">
            Set a realistic deadline to stay motivated.
          </p>
        </div>

        {selectedGoal?.unit && (
          <div className="space-y-2">
            <Label htmlFor="targetValue">
              Target Value ({selectedGoal.unit})
              <span className="text-gray-500 text-sm ml-2">Optional</span>
            </Label>
            <Input
              id="targetValue"
              type="number"
              placeholder={`e.g., 10 ${selectedGoal.unit}`}
              value={targetValue}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetValue(e.target.value)}
              disabled={isSubmitting}
              min="0"
              step="0.1"
            />
            <p className="text-sm text-gray-500">
              Set a specific target to track your progress
            </p>
          </div>
        )}

        {!selectedGoal?.unit && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              This goal type doesn't require a specific numeric target. Focus on consistency and gradual improvement.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <div>
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        
        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Goal' : 'Create Goal')
            }
          </Button>
        </div>
      </div>
    </form>
  );
};

export default GoalForm;