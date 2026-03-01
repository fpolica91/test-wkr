import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import GoalCard from '../components/goal/GoalCard';
import GoalForm from '../components/goal/GoalForm';
import { useGoals } from '../hooks/useGoals';
import type { GoalResponse as Goal, GoalType } from '@fitness/api-client';
import { Target, PlusCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const GoalsPage = () => {
  const { 
    activeGoals, 
    inactiveGoals, 
    createGoal, 
    updateGoal, 
    deleteGoal,
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useGoals();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreateGoal = async (data: { 
    goalType: GoalType; 
    description?: string;
    targetValue?: number; 
    currentValue?: number;
    targetDate?: string;
  }) => {
    try {
      await createGoal(data);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleEditGoal = async (data: { 
    goalType: GoalType; 
    description?: string;
    targetValue?: number; 
    currentValue?: number;
    targetDate?: string;
  }) => {
    if (!editingGoal) return;
    
    try {
      await updateGoal({ id: editingGoal.id, data });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await deleteGoal(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleToggleActive = async (goalId: string, isActive: boolean) => {
    try {
      await updateGoal({ id: goalId, data: { isActive } });
      toast.success(`Goal marked as ${isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Failed to toggle goal active state:', error);
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Set and track your fitness goals to stay motivated
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-10 md:h-11 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Goal</span>
              <span className="sm:hidden">Add Goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Create New Goal</DialogTitle>
            </DialogHeader>
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="space-y-4 md:space-y-6">
        <TabsList className="w-full grid grid-cols-2 h-11">
          <TabsTrigger value="active" className="flex items-center justify-center gap-2 text-sm md:text-base">
            <Target className="h-4 w-4" />
            <span>Active ({activeGoals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center justify-center gap-2 text-sm md:text-base">
            <Target className="h-4 w-4" />
            <span>Inactive ({inactiveGoals.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteGoal}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          ) : (
            <Card className="touch-manipulation">
              <CardContent className="pt-6">
                <div className="text-center py-10 md:py-12">
                  <Target className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    No active goals
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Create your first goal to start tracking your progress.
                  </p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 mx-auto h-11"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create First Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactiveGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteGoal}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          ) : (
            <Card className="touch-manipulation">
              <CardContent className="pt-6">
                <div className="text-center py-10 md:py-12">
                  <Target className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    No inactive goals
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    All your goals are currently active.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tips Card - Mobile Optimized */}
      <Card className="touch-manipulation">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Goal Setting Tips
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Make your goals more effective
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 md:space-y-4">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <span className="text-gray-700 text-sm md:text-base">
                <strong>Be Specific:</strong> Instead of "get fit," try "run 5k in under 30 minutes"
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <span className="text-gray-700 text-sm md:text-base">
                <strong>Make it Measurable:</strong> Track progress with numbers (weight, reps, time)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <span className="text-gray-700 text-sm md:text-base">
                <strong>Set Realistic Timeframes:</strong> Give yourself enough time to achieve goals
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">4</span>
              </div>
              <span className="text-gray-700 text-sm md:text-base">
                <strong>Focus on Consistency:</strong> Regular small efforts beat occasional big efforts
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
               initialData={{
                 goalType: editingGoal.goalType,
                 description: editingGoal.description,
                 targetValue: editingGoal.targetValue,
                 currentValue: editingGoal.currentValue,
                 targetDate: editingGoal.targetDate,
               }}
              onSubmit={handleEditGoal}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingGoal(null);
              }}
              onDelete={() => {
                if (editingGoal) {
                  handleDeleteGoal(editingGoal.id);
                  setIsEditDialogOpen(false);
                  setEditingGoal(null);
                }
              }}
              isSubmitting={isUpdating || isDeleting}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsPage;
