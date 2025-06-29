
import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, Sparkles, AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import FileUploader from './FileUploader';
import ReconciliationSummary from './ReconciliationSummary';
import TransactionTable from './TransactionTable';
import LoadingSpinner from './LoadingSpinner';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import ReconciliationHistory from './ReconciliationHistory';
import { TableSkeleton, SummarySkeleton } from './LoadingSkeleton';
import { FileUploadState, ValidationError, ReconciliationResult } from '@/types/reconciliation';
import { parseCSV, validateFile, validateCSVStructure } from '@/utils/csvParser';
import { ReconciliationEngine } from '@/utils/reconciliationEngine';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import { saveReconciliationSession, getReconciliationHistory } from '@/utils/localStorage';

const ReconciliationTool: React.FC = () => {
  const [files, setFiles] = useState<FileUploadState>({ internal: null, provider: null });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ReconciliationResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setCurrentResults, addToActivityLog } = useReconciliation();

  // Load history data on component mount
  useEffect(() => {
    const history = getReconciliationHistory();
    setHistoryData(history);
  }, []);
  
  const handleFileSelect = useCallback(async (fileType: 'internal' | 'provider', file: File) => {
    console.log(`File selected for ${fileType}:`, file.name);
    
    // Clear previous errors for this file type
    setValidationErrors(prev => prev.filter(e => e.file !== fileType));
    setFileValidationErrors([]);
    
    // Basic file validation
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      const updatedErrors = fileErrors.map(error => ({ ...error, file: fileType }));
      setValidationErrors(prev => [
        ...prev.filter(e => e.file !== fileType),
        ...updatedErrors
      ]);
      
      setFileValidationErrors([fileErrors[0].message]);
      
      toast({
        title: "File validation failed",
        description: `${file.name} contains validation errors. Please check the file format.`,
        variant: "destructive"
      });
      return;
    }
    
    // Set validating state
    setIsValidating(true);
    
    try {
      // Validate CSV structure
      const structureValidation = await validateCSVStructure(file);
      
      if (structureValidation.errors.length > 0) {
        const errorMessages = structureValidation.errors.map(error => error.message);
        setFileValidationErrors(errorMessages);
        
        toast({
          title: "CSV validation failed",
          description: `${file.name} has formatting issues. Please check the error messages below.`,
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }
      
      // If validation passes, update file state
      setFiles(prev => ({ ...prev, [fileType]: file }));
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded and validated.`,
      });
      
    } catch (error) {
      console.error('Error validating CSV structure:', error);
      setFileValidationErrors(['An error occurred while validating the file. Please try again.']);
      
      toast({
        title: "Validation error",
        description: "An unexpected error occurred while validating the file.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
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
    
    // Final validation check before processing
    if (fileValidationErrors.length > 0) {
      toast({
        title: "Cannot process files",
        description: "Please fix the validation errors before proceeding.",
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
      
      // Check for parsing errors
      const allErrors = [
        ...internalResult.errors.map(e => ({ ...e, file: 'internal' as const })),
        ...providerResult.errors.map(e => ({ ...e, file: 'provider' as const }))
      ];
      
      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        const errorMessages = allErrors.map(error => error.message);
        setFileValidationErrors(errorMessages);
        
        toast({
          title: "Processing errors detected",
          description: `Found ${allErrors.length} error(s) during file processing. Please fix these issues.`,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Validate that we have actual data
      if (internalResult.data.length === 0) {
        setFileValidationErrors(['Internal file contains no valid transaction data. Please check your file format.']);
        toast({
          title: "No data found",
          description: "Internal file contains no valid transactions.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      if (providerResult.data.length === 0) {
        setFileValidationErrors(['Provider file contains no valid transaction data. Please check your file format.']);
        toast({
          title: "No data found",
          description: "Provider file contains no valid transactions.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      console.log(`Parsed ${internalResult.data.length} internal transactions and ${providerResult.data.length} provider transactions`);
      
      // Perform reconciliation
      const reconciliationResults = ReconciliationEngine.reconcile(
        internalResult.data,
        providerResult.data
      );
      
      console.log('Reconciliation completed:', reconciliationResults.summary);
      
      setResults(reconciliationResults);
      setCurrentResults(reconciliationResults);
      
      // Save to localStorage
      saveReconciliationSession(
        files.internal.name,
        files.provider.name,
        reconciliationResults.summary
      );
      
      // Update history display
      const updatedHistory = getReconciliationHistory();
      setHistoryData(updatedHistory);
      
      // Add to activity log
      addToActivityLog({
        internalFileName: files.internal.name,
        providerFileName: files.provider.name,
        summary: reconciliationResults.summary
      });
      
      toast({
        title: "Reconciliation completed successfully",
        description: `Processed ${reconciliationResults.summary.totalInternal} internal transactions. Redirecting to insights...`,
      });
      
      // Redirect to insights page after successful reconciliation
      setTimeout(() => {
        navigate('/insights');
      }, 1500);
      
    } catch (error) {
      console.error('Error during reconciliation:', error);
      setFileValidationErrors(['An unexpected error occurred while processing the files. Please try again.']);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred while processing the files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [files, toast, setCurrentResults, addToActivityLog, navigate, fileValidationErrors]);
  
  const resetTool = useCallback(() => {
    setFiles({ internal: null, provider: null });
    setValidationErrors([]);
    setFileValidationErrors([]);
    setResults(null);
    toast({
      title: "Workspace cleared",
      description: "All data has been cleared. Ready for new files.",
    });
  }, [toast]);
  
  const internalErrors = validationErrors.filter(e => e.file === 'internal');
  const providerErrors = validationErrors.filter(e => e.file === 'provider');
  const hasValidationErrors = fileValidationErrors.length > 0;
  const canProcess = files.internal && files.provider && !hasValidationErrors && !isValidating;
  
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
        
        <main className="flex-1 p-4 md:p-6 space-y-6 min-h-screen">
          {/* Shortened App Description Section */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 md:p-6 shadow-sm">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Upload your payment records and processor statements to quickly spot differences and missing transactions.
              </p>
            </div>
          </div>

          {/* Recent Sessions History */}
          {historyData.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <ReconciliationHistory sessions={historyData} />
            </div>
          )}

          {/* File Upload Section */}
          <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-xl max-w-4xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-center text-lg md:text-xl font-semibold flex items-center justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>File Upload Center</span>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <FileUploader
                  title="Internal System Export"
                  description="Upload your internal transaction export CSV file"
                  file={files.internal}
                  onFileSelect={(file) => handleFileSelect('internal', file)}
                  errors={internalErrors}
                  isProcessing={isValidating || isProcessing}
                />
                
                <FileUploader
                  title="Payment Provider Statement"
                  description="Upload your payment provider statement CSV file"
                  file={files.provider}
                  onFileSelect={(file) => handleFileSelect('provider', file)}
                  errors={providerErrors}
                  isProcessing={isValidating || isProcessing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Messages Display */}
          {hasValidationErrors && (
            <div className="max-w-4xl mx-auto">
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Please fix the following issues before proceeding:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {fileValidationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 max-w-4xl mx-auto">
            <Button
              onClick={processReconciliation}
              disabled={!canProcess || isProcessing}
              size="lg"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-3" />
                  <span className="relative z-10">Processing Reconciliation...</span>
                </>
              ) : (
                <span className="relative z-10 flex items-center">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Start Reconciliation
                </span>
              )}
            </Button>
            
            {(files.internal || files.provider || results) && (
              <Button
                onClick={resetTool}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-4 md:px-6 py-3 md:py-4 text-sm md:text-base shadow-md hover:shadow-lg backdrop-blur-sm bg-background/50 border-border/50 hover:bg-background/80 hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Reset Workspace
              </Button>
            )}
          </div>
          
          {/* Processing State */}
          {isProcessing && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 md:p-8 text-center">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Processing Reconciliation</h3>
                  <p className="text-muted-foreground">
                    Analyzing transactions and generating insights...
                  </p>
                </CardContent>
              </Card>
              <SummarySkeleton />
              <TableSkeleton />
            </div>
          )}
          
          {/* Results Section - Only show if not processing and not redirecting */}
          {results && !isProcessing && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">
                  Reconciliation completed! Redirecting to insights...
                </p>
              </div>
              
              <ReconciliationSummary results={results} />
              
              <Card className="shadow-xl backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="text-lg md:text-xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Transaction Analysis Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 md:p-6">
                  <Tabs defaultValue="matched" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/30 backdrop-blur-sm rounded-xl p-1 md:p-2 mb-4 md:mb-6">
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
                    
                    <TabsContent value="matched" className="mt-4 md:mt-6">
                      <TransactionTable
                        title="Matched Transactions"
                        transactions={results.categories.matched}
                        type="matched"
                        results={results}
                        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                        colorClass="text-green-600"
                      />
                    </TabsContent>
                    
                    <TabsContent value="internalOnly" className="mt-4 md:mt-6">
                      <TransactionTable
                        title="Internal Only Transactions"
                        transactions={results.categories.internalOnly}
                        type="internalOnly"
                        results={results}
                        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
                        colorClass="text-amber-600"
                      />
                    </TabsContent>
                    
                    <TabsContent value="providerOnly" className="mt-4 md:mt-6">
                      <TransactionTable
                        title="Provider Only Transactions"
                        transactions={results.categories.providerOnly}
                        type="providerOnly"
                        results={results}
                        icon={<XCircle className="h-5 w-5 text-red-600" />}
                        colorClass="text-red-600"
                      />
                    </TabsContent>
                    
                    <TabsContent value="mismatched" className="mt-4 md:mt-6">
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
