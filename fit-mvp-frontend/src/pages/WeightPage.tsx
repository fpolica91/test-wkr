import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Scale, PlusCircle, TrendingUp, Calendar, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useWeight } from '../hooks/useWeight';
import type { WeightEntryResponse, WeightUnit } from '@fitness/api-client';
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatDateForInput = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WeightPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntryResponse | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [date, setDate] = useState<string>(formatDateForInput(new Date()));
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch weight entries
  const { data: weightEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ['weightEntries'],
    queryFn: () => api.getWeightEntries(),
  });

  // Fetch weight stats
  const { data: weightStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['weightStats'],
    queryFn: () => api.getWeightStats(),
  });

  // Create weight entry mutation
  const createMutation = useMutation({
    mutationFn: (data: { weight: number; bodyFat?: number; date?: string; notes?: string }) =>
      api.createWeightEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weightStats'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Weight entry added successfully!');
    },
    onError: (error) => {
      console.error('Failed to add weight entry:', error);
      toast.error('Failed to add weight entry. Please try again.');
    },
  });

  // Update weight entry mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { weight?: number; bodyFat?: number; date?: string; notes?: string } }) =>
      api.updateWeightEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weightStats'] });
      setEditingEntry(null);
      resetForm();
      toast.success('Weight entry updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update weight entry:', error);
      toast.error('Failed to update weight entry. Please try again.');
    },
  });

  // Delete weight entry mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteWeightEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weightStats'] });
      toast.success('Weight entry deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete weight entry:', error);
      toast.error('Failed to delete weight entry. Please try again.');
    },
  });

  const resetForm = () => {
    setWeight('');
    setBodyFat('');
    setDate(formatDateForInput(new Date()));
    setNotes('');
    setEditingEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    const data: any = {
      weight: weightNum,
      date: date || undefined,
      notes: notes || undefined,
    };

    if (bodyFat.trim() !== '') {
      const bodyFatNum = parseFloat(bodyFat);
      if (!isNaN(bodyFatNum) && bodyFatNum >= 0 && bodyFatNum <= 100) {
        data.bodyFat = bodyFatNum;
      }
    }

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry: WeightEntryResponse) => {
    setEditingEntry(entry);
    setWeight(entry.weight.toString());
    setBodyFat(entry.bodyFat?.toString() || '');
    setDate(formatDateForInput(new Date(entry.date)));
    setNotes(entry.notes || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this weight entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const sortedEntries = [...weightEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const isLoading = isLoadingEntries || isLoadingStats;
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Scale className="h-7 w-7 text-orange-500" />
            Weight Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Track your weight progress over time and monitor trends
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => resetForm()}>
              <PlusCircle className="h-4 w-4" />
              Log Weight
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Weight Entry' : 'Log Weight'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)*</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    disabled={isMutating}
                  />
                  <p className="text-xs text-gray-500">Weight is stored in kilograms</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 18.5"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    disabled={isMutating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isMutating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="e.g., 'After workout', 'Morning weight'"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isMutating}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isMutating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isMutating}>
                  {editingEntry ? 'Update Entry' : 'Log Weight'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {weightStats?.currentWeight ? `${weightStats.currentWeight.toFixed(1)} kg` : '--'}
                </div>
                <p className="text-sm text-gray-600">Current Weight</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {weightStats?.weightChange 
                    ? `${weightStats.weightChange > 0 ? '+' : ''}${weightStats.weightChange.toFixed(1)} kg`
                    : '--'
                  }
                </div>
                <p className="text-sm text-gray-600">Change from Previous</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {weightStats?.sevenDayAverage ? `${weightStats.sevenDayAverage.toFixed(1)} kg` : '--'}
                </div>
                <p className="text-sm text-gray-600">7-Day Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{weightStats?.totalEntries || 0}</div>
                <p className="text-sm text-gray-600">Total Entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
              <CardDescription>Your weight progression over time</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chart will be implemented with a graphing library</p>
                <p className="text-sm">For now, see the history tab for your entries</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weight History</CardTitle>
              <CardDescription>Your past weight entries</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No weight entries yet</p>
                  <p className="text-sm mt-1">Log your first weight to start tracking!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <Scale className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{entry.weight.toFixed(1)} kg</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(new Date(entry.date))}
                            {entry.bodyFat && ` • ${entry.bodyFat.toFixed(1)}% body fat`}
                            {entry.notes && ` • ${entry.notes}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          disabled={isMutating}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          disabled={isMutating}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeightPage;