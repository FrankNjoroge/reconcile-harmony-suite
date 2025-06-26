
import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './FileUploader';
import ReconciliationSummary from './ReconciliationSummary';
import TransactionTable from './TransactionTable';
import { FileUploadState, ValidationError, ReconciliationResult, Transaction } from '@/types/reconciliation';
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
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
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
        title: "Reconciliation completed",
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Transaction Reconciliation Tool</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upload your internal system export and payment provider statement to automatically identify 
          discrepancies and reconcile transactions.
        </p>
      </div>
      
      {/* File Upload Section */}
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
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={processReconciliation}
          disabled={!files.internal || !files.provider || isProcessing || validationErrors.length > 0}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Start Reconciliation'
          )}
        </Button>
        
        {(files.internal || files.provider || results) && (
          <Button
            onClick={resetTool}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Reset Tool
          </Button>
        )}
      </div>
      
      {/* Results Section */}
      {results && (
        <div className="space-y-8">
          <ReconciliationSummary results={results} />
          
          <Tabs defaultValue="matched" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="matched" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Matched ({results.summary.matched})</span>
              </TabsTrigger>
              <TabsTrigger value="internalOnly" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Internal Only ({results.summary.internalOnly})</span>
              </TabsTrigger>
              <TabsTrigger value="providerOnly" className="flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Provider Only ({results.summary.providerOnly})</span>
              </TabsTrigger>
              <TabsTrigger value="mismatched" className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
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
        </div>
      )}
    </div>
  );
};

export default ReconciliationTool;
