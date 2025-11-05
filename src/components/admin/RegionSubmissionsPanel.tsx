import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Check, X, Clock, Loader2, MapPin, Edit, Trash2, Save, Upload, FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { useHikingRegions } from '@/hooks/useHikingRegions';

interface RegionSubmission {
  id: string;
  country: string;
  region: string | null;
  subregion: string;
  description: string;
  key_features: string[];
  verification_status: string;
  submitted_by: string;
  created_at: string;
  declined_reason: string | null;
  reviewed_at: string | null;
  ticket_number?: string;
  profiles: {
    name: string;
    email: string;
  };
}

export const RegionSubmissionsPanel = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<RegionSubmission | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showEditRegionsDialog, setShowEditRegionsDialog] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [editedRegion, setEditedRegion] = useState<any>({});
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);
  const queryClient = useQueryClient();
  const { data: allRegions } = useHikingRegions();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['region-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_submitted_regions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data and ticket info for each submission
      const submissionsWithProfiles = await Promise.all(
        (data || []).map(async (submission) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', submission.submitted_by)
            .single();

          // Find associated ticket
          const regionDisplayName = submission.region
            ? `${submission.country} - ${submission.region} - ${submission.subregion}`
            : `${submission.country} - ${submission.subregion}`;

          const { data: ticket } = await supabase
            .from('tickets')
            .select('ticket_number')
            .eq('title', `Region Submission: ${regionDisplayName}`)
            .eq('category', 'region_submission')
            .single();

          return {
            ...submission,
            profiles: profile || { name: 'Unknown', email: 'unknown@example.com' },
            ticket_number: ticket?.ticket_number,
          };
        })
      );

      return submissionsWithProfiles as RegionSubmission[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ 
      submissionId, 
      action, 
      reason 
    }: { 
      submissionId: string; 
      action: 'approve' | 'decline'; 
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('review-region-submission', {
        body: {
          submission_id: submissionId,
          action,
          declined_reason: reason,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['region-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['hiking-regions'] });
      toast.success(data.message);
      setShowDeclineDialog(false);
      setSelectedSubmission(null);
      setDeclineReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process submission');
    },
  });

  const handleApprove = (submission: RegionSubmission) => {
    if (confirm(`Approve region: ${getRegionDisplayName(submission)}?`)) {
      reviewMutation.mutate({
        submissionId: submission.id,
        action: 'approve',
      });
    }
  };

  const handleDecline = (submission: RegionSubmission) => {
    setSelectedSubmission(submission);
    setShowDeclineDialog(true);
  };

  const handleDeclineConfirm = () => {
    if (!selectedSubmission || !declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    reviewMutation.mutate({
      submissionId: selectedSubmission.id,
      action: 'decline',
      reason: declineReason,
    });
  };

  const getRegionDisplayName = (submission: RegionSubmission) => {
    return submission.region
      ? `${submission.country} - ${submission.region} - ${submission.subregion}`
      : `${submission.country} - ${submission.subregion}`;
  };

  const updateRegionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('hiking_regions')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hiking-regions'] });
      toast.success('Region updated successfully');
      setEditingRegionId(null);
      setEditedRegion({});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update region');
    },
  });

  const deleteRegionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hiking_regions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hiking-regions'] });
      toast.success('Region deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete region');
    },
  });

  const handleEditRegion = (region: any) => {
    setEditingRegionId(region.id);
    setEditedRegion({ ...region });
  };

  const handleSaveRegion = () => {
    if (!editingRegionId) return;
    updateRegionMutation.mutate({
      id: editingRegionId,
      updates: {
        country: editedRegion.country,
        region: editedRegion.region,
        subregion: editedRegion.subregion,
        description: editedRegion.description,
      },
    });
  };

  const handleDeleteRegion = (id: string) => {
    if (confirm('Are you sure you want to delete this region? This action cannot be undone.')) {
      deleteRegionMutation.mutate(id);
    }
  };

  const readCsvFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const importRegionsMutation = useMutation({
    mutationFn: async (csvData: string) => {
      const { data, error } = await supabase.functions.invoke('import-hiking-regions', {
        body: { csvData }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hiking-regions'] });
      setImportResults({
        successCount: data.successCount,
        errorCount: data.errorCount,
        errors: data.errors || []
      });
      toast.success(`Import complete: ${data.successCount} regions added/updated`);
      if (data.errorCount > 0) {
        toast.warning(`${data.errorCount} errors occurred. Check details below.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import regions');
      setImportResults(null);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    try {
      const csvData = await readCsvFile(selectedFile);
      importRegionsMutation.mutate(csvData);
    } catch (error: any) {
      toast.error('Failed to read CSV file');
    }
  };

  const downloadTemplate = () => {
    const template = `Country,Region,Subregion,Description,Key Features
Austria,Tirol (Tyrol),Stubai Alps,Kingdom of Glaciers with 80+ glaciers,Stubai High Trail | Mountain hut network | Alpine terrain | Glaciers
Switzerland,,Jungfrau Region,UNESCO World Heritage alpine wonderland,Eiger North Face | Historic railways | High-altitude hiking | Mountain villages`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hiking_regions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><X className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingSubmissions = submissions?.filter(s => s.verification_status === 'pending') || [];
  const reviewedSubmissions = submissions?.filter(s => s.verification_status !== 'pending') || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Pending Region Submissions ({pendingSubmissions.length})
                  </CardTitle>
                  <CardDescription>
                    Review and approve or decline region submissions from guides
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditRegionsDialog(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit All Regions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{getRegionDisplayName(submission)}</h4>
                          {getStatusBadge(submission.verification_status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{submission.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {submission.key_features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Submitted by: <span className="font-medium">{submission.profiles?.name}</span> ({submission.profiles?.email})</div>
                          <div>Submitted: {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}</div>
                          {submission.ticket_number && (
                            <div>
                              <Badge variant="outline" className="text-xs">
                                Ticket: {submission.ticket_number}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(submission)}
                          disabled={reviewMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDecline(submission)}
                          disabled={reviewMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviewed Submissions */}
        {reviewedSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Submissions ({reviewedSubmissions.length})</CardTitle>
              <CardDescription>Previously reviewed region submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewedSubmissions.map((submission) => (
                <Card key={submission.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getRegionDisplayName(submission)}</h4>
                        {getStatusBadge(submission.verification_status)}
                      </div>
                      
                      {submission.declined_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                          <strong>Decline Reason:</strong> {submission.declined_reason}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Reviewed: {submission.reviewed_at ? formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true }) : 'Unknown'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {submissions?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No region submissions yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit All Regions Dialog */}
      <Dialog open={showEditRegionsDialog} onOpenChange={setShowEditRegionsDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit All Regions</DialogTitle>
            <DialogDescription>
              Manage all hiking regions in the database
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Subregion</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRegions?.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell>
                      {editingRegionId === region.id ? (
                        <Input
                          value={editedRegion.country}
                          onChange={(e) => setEditedRegion({ ...editedRegion, country: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        region.country
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRegionId === region.id ? (
                        <Input
                          value={editedRegion.region || ''}
                          onChange={(e) => setEditedRegion({ ...editedRegion, region: e.target.value || null })}
                          className="h-8"
                          placeholder="Optional"
                        />
                      ) : (
                        region.region || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRegionId === region.id ? (
                        <Input
                          value={editedRegion.subregion}
                          onChange={(e) => setEditedRegion({ ...editedRegion, subregion: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        region.subregion
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {editingRegionId === region.id ? (
                        <Textarea
                          value={editedRegion.description}
                          onChange={(e) => setEditedRegion({ ...editedRegion, description: e.target.value })}
                          className="min-h-[60px]"
                        />
                      ) : (
                        <span className="text-sm line-clamp-2">{region.description}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingRegionId === region.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSaveRegion}
                              disabled={updateRegionMutation.isPending}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingRegionId(null);
                                setEditedRegion({});
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRegion(region)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteRegion(region.id)}
                              disabled={deleteRegionMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRegionsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Hiking Regions from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import multiple hiking regions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* CSV Format Instructions */}
            <Alert>
              <FileUp className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Expected CSV format:</p>
                  <code className="block text-xs bg-muted p-2 rounded">
                    Country,Region,Subregion,Description,Key Features
                  </code>
                  <ul className="text-xs space-y-1 mt-2">
                    <li>• <strong>Region</strong> column can be empty for regions without a parent</li>
                    <li>• Separate <strong>Key Features</strong> with pipe symbol: <code>Feature 1 | Feature 2 | Feature 3</code></li>
                    <li>• Duplicate regions (same country+region+subregion) will be updated</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Template Download */}
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : 'Click to upload CSV file'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFile 
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
                    : 'Maximum file size: 5MB'}
                </p>
              </label>
            </div>

            {/* Import Results */}
            {importResults && (
              <Alert className={importResults.errorCount > 0 ? "border-yellow-500" : "border-green-500"}>
                {importResults.errorCount > 0 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Import completed: {importResults.successCount} regions added/updated
                    </p>
                    {importResults.errorCount > 0 && (
                      <div className="text-xs space-y-1">
                        <p className="font-medium text-red-600">
                          {importResults.errorCount} errors occurred:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                          {importResults.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setSelectedFile(null);
                setImportResults(null);
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importRegionsMutation.isPending}
            >
              {importRegionsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Regions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Region Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this submission
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter reason for declining..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineConfirm}
              disabled={!declineReason.trim() || reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                'Confirm Decline'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};