
import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './FileUploader';
import ReconciliationSummary from './ReconciliationSummary';
import TransactionTable from './TransactionTable';
import LoadingSpinner from './LoadingSpinner';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { TableSkeleton, SummarySkeleton } from './LoadingSkeleton';
import { FileUploadState, ValidationError, ReconciliationResult } from '@/types/reconciliation';
import { parseCSV, validateFile } from '@/utils/csvParser';
import { ReconciliationEngine } from '@/utils/reconciliationEngine';

const ReconciliationTool: React.FC = () => {
  const [files, setFiles] = useState<FileUploadState>({ internal: null, provider: null });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ReconciliationResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  const handleFileSelect = useCallback(async (fileType: 'internal' | 'provider', file: File) => {
    console.log(`File selected for ${fileType}:`, file.name);
    
    // Validate file
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      const updatedErrors = fileErrors.map(error => ({ ...error, file: fileType }));
      setValidationErrors(prev => [
        ...prev.filter(e => e.file !== fileType),
        ...updatedErrors
      ]);
      
      toast({
        title: "File validation failed",
        description: `${file.name} contains validation errors. Please check the file format.`,
        variant: "destructive"
      });
      return;
    }
    
    // Clear previous errors for this file type
    setValidationErrors(prev => prev.filter(e => e.file !== fileType));
    
    // Update file state
    setFiles(prev => ({ ...prev, [fileType]: file }));
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been uploaded and validated.`,
    });
  }, [toast]);
  
  const processReconciliation = useCallback(async () => {
    if (!files.internal || !files.provider) {
      toast({
        title: "Missing files",
        description: "Please upload both internal and provider CSV files.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    console.log('Starting reconciliation process...');
    
    try {
      // Parse both CSV files
      const internalResult = await parseCSV(files.internal);
      const providerResult = await parseCSV(files.provider);
      
      // Update errors
      const allErrors = [
        ...internalResult.errors.map(e => ({ ...e, file: 'internal' as const })),
        ...providerResult.errors.map(e => ({ ...e, file: 'provider' as const }))
      ];
      
      setValidationErrors(allErrors);
      
      if (allErrors.length > 0) {
        toast({
          title: "Processing errors detected",
          description: `Found ${allErrors.length} error(s) during file processing. Results may be incomplete.`,
          variant: "destructive"
        });
      }
      
      console.log(`Parsed ${internalResult.data.length} internal transactions and ${providerResult.data.length} provider transactions`);
      
      // Perform reconciliation
      const reconciliationResults = ReconciliationEngine.reconcile(
        internalResult.data,
        providerResult.data
      );
      
      console.log('Reconciliation completed:', reconciliationResults.summary);
      
      setResults(reconciliationResults);
      
      toast({
        title: "Reconciliation completed successfully",
        description: `Processed ${reconciliationResults.summary.totalInternal} internal transactions. Found ${reconciliationResults.summary.matched} matches.`,
      });
      
    } catch (error) {
      console.error('Error during reconciliation:', error);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred while processing the files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [files, toast]);
  
  const resetTool = useCallback(() => {
    setFiles({ internal: null, provider: null });
    setValidationErrors([]);
    setResults(null);
    toast({
      title: "Workspace cleared",
      description: "All data has been cleared. Ready for new files.",
    });
  }, [toast]);
  
  const internalErrors = validationErrors.filter(e => e.file === 'internal');
  const providerErrors = validationErrors.filter(e => e.file === 'provider');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppHeader 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex">
        <AppSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 p-6 space-y-8 min-h-screen">
          {/* File Upload Section */}
          <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-center text-xl font-semibold flex items-center justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>File Upload Center</span>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FileUploader
                  title="Internal System Export"
                  description="Upload your internal transaction export CSV file"
                  file={files.internal}
                  onFileSelect={(file) => handleFileSelect('internal', file)}
                  errors={internalErrors}
                  isProcessing={isProcessing}
                />
                
                <FileUploader
                  title="Payment Provider Statement"
                  description="Upload your payment provider statement CSV file"
                  file={files.provider}
                  onFileSelect={(file) => handleFileSelect('provider', file)}
                  errors={providerErrors}
                  isProcessing={isProcessing}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              onClick={processReconciliation}
              disabled={!files.internal || !files.provider || isProcessing || validationErrors.length > 0}
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-base bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-3" />
                  <span className="relative z-10">Processing Reconciliation...</span>
                </>
              ) : (
                <span className="relative z-10 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Reconciliation
                </span>
              )}
            </Button>
            
            {(files.internal || files.provider || results) && (
              <Button
                onClick={resetTool}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 py-4 text-base shadow-md hover:shadow-lg backdrop-blur-sm bg-background/50 border-border/50 hover:bg-background/80 hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset Workspace
              </Button>
            )}
          </div>
          
          {/* Results Section */}
          {isProcessing && (
            <div className="space-y-6">
              <SummarySkeleton />
              <TableSkeleton />
            </div>
          )}
          
          {results && !isProcessing && (
            <div className="space-y-6">
              <ReconciliationSummary results={results} />
              
              <Card className="shadow-xl backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="text-xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Transaction Analysis Center
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Tabs defaultValue="matched" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/30 backdrop-blur-sm rounded-xl p-2 mb-6">
                      <TabsTrigger 
                        value="matched" 
                        className="flex items-center space-x-1 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm"
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="hidden sm:inline">Matched</span>
                        <span className="sm:hidden">M</span>
                        <span>({results.summary.matched})</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="internalOnly" 
                        className="flex items-center space-x-1 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm"
                      >
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                        <span className="hidden sm:inline">Internal</span>
                        <span className="sm:hidden">I</span>
                        <span>({results.summary.internalOnly})</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="providerOnly" 
                        className="flex items-center space-x-1 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm"
                      >
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        <span className="hidden sm:inline">Provider</span>
                        <span className="sm:hidden">P</span>
                        <span>({results.summary.providerOnly})</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="mismatched" 
                        className="flex items-center space-x-1 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm"
                      >
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="hidden sm:inline">Mismatched</span>
                        <span className="sm:hidden">X</span>
                        <span>({results.summary.mismatched})</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="matched" className="mt-6">
                      <TransactionTable
                        title="Matched Transactions"
                        transactions={results.categories.matched}
                        type="matched"
                        results={results}
                        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                        colorClass="text-green-600"
                      />
                    </TabsContent>
                    
                    <TabsContent value="internalOnly" className="mt-6">
                      <TransactionTable
                        title="Internal Only Transactions"
                        transactions={results.categories.internalOnly}
                        type="internalOnly"
                        results={results}
                        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
                        colorClass="text-amber-600"
                      />
                    </TabsContent>
                    
                    <TabsContent value="providerOnly" className="mt-6">
                      <TransactionTable
                        title="Provider Only Transactions"
                        transactions={results.categories.providerOnly}
                        type="providerOnly"
                        results={results}
                        icon={<XCircle className="h-5 w-5 text-red-600" />}
                        colorClass="text-red-600"
                      />
                    </TabsContent>
                    
                    <TabsContent value="mismatched" className="mt-6">
                      <TransactionTable
                        title="Mismatched Transactions"
                        transactions={results.categories.mismatched}
                        type="mismatched"
                        results={results}
                        icon={<RotateCcw className="h-5 w-5 text-blue-600" />}
                        colorClass="text-blue-600"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReconciliationTool;
