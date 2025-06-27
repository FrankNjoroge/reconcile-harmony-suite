import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './FileUploader';
import ReconciliationSummary from './ReconciliationSummary';
import TransactionTable from './TransactionTable';
import ThemeToggle from './ThemeToggle';
import LoadingSpinner from './LoadingSpinner';
import { FileUploadState, ValidationError, ReconciliationResult } from '@/types/reconciliation';
import { parseCSV, validateFile } from '@/utils/csvParser';
import { ReconciliationEngine } from '@/utils/reconciliationEngine';

const ReconciliationTool: React.FC = () => {
  const [files, setFiles] = useState<FileUploadState>({ internal: null, provider: null });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ReconciliationResult | null>(null);
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
          title: "Validation errors found",
          description: `Found ${allErrors.length} validation error(s). Please fix them and try again.`,
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
      
      toast({
        title: "Reconciliation completed successfully",
        description: `Processed ${reconciliationResults.summary.totalInternal} internal transactions. Found ${reconciliationResults.summary.matched} matches.`,
      });
      
    } catch (error) {
      console.error('Error during reconciliation:', error);
      toast({
        title: "Processing error",
        description: "An error occurred while processing the files. Please try again.",
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
      title: "Tool reset",
      description: "All data has been cleared. You can now upload new files.",
    });
  }, [toast]);
  
  const internalErrors = validationErrors.filter(e => e.file === 'internal');
  const providerErrors = validationErrors.filter(e => e.file === 'provider');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Enhanced Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Reconciliation Suite
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Advanced transaction reconciliation with intelligent matching algorithms, 
              real-time analytics, and comprehensive reporting capabilities.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 backdrop-blur-sm bg-background/50 border-border/50 hover:bg-background/80 hover:scale-105 transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
        
        {/* Enhanced File Upload Section */}
        <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-center text-2xl font-semibold flex items-center justify-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>File Upload Center</span>
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        
        {/* Enhanced Action Buttons */}
        <div className="flex justify-center space-x-6">
          <Button
            onClick={processReconciliation}
            disabled={!files.internal || !files.provider || isProcessing || validationErrors.length > 0}
            size="lg"
            className="px-12 py-6 text-lg bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
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
              className="px-8 py-6 text-lg shadow-lg hover:shadow-xl backdrop-blur-sm bg-background/50 border-border/50 hover:bg-background/80 hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset Tool
            </Button>
          )}
        </div>
        
        {/* Enhanced Results Section */}
        {results && (
          <div className="space-y-8">
            <ReconciliationSummary results={results} />
            
            <Card className="shadow-2xl backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-2xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Transaction Analysis Center
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="matched" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/30 backdrop-blur-sm rounded-xl p-2">
                    <TabsTrigger 
                      value="matched" 
                      className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Matched ({results.summary.matched})</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="internalOnly" 
                      className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Internal Only ({results.summary.internalOnly})</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="providerOnly" 
                      className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Provider Only ({results.summary.providerOnly})</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="mismatched" 
                      className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                      <span>Mismatched ({results.summary.mismatched})</span>
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
      </div>
    </div>
  );
};

export default ReconciliationTool;
