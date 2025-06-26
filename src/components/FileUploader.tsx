
import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ValidationError } from '@/types/reconciliation';

interface FileUploaderProps {
  title: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  errors: ValidationError[];
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  title,
  description,
  file,
  onFileSelect,
  errors,
  isProcessing
}) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].name.toLowerCase().endsWith('.csv')) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const hasErrors = errors.length > 0;
  const isUploaded = file !== null;

  return (
    <Card className={`transition-all duration-200 ${hasErrors ? 'border-red-300 bg-red-50' : isUploaded ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-300 hover:border-gray-400'}`}>
      <CardContent className="p-6">
        <div
          className="text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-input-${title}`)?.click()}
        >
          <div className="mb-4">
            {isUploaded && !hasErrors ? (
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            ) : hasErrors ? (
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          
          {isUploaded ? (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <p>Drag and drop your CSV file here, or click to browse</p>
              <p className="mt-1">Maximum file size: 10MB</p>
            </div>
          )}
          
          {hasErrors && (
            <div className="mt-4 text-left">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 mb-1">
                  • {error.message}
                </div>
              ))}
            </div>
          )}
          
          {isProcessing && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-blue-600 mt-2">Processing...</p>
            </div>
          )}
        </div>
        
        <input
          id={`file-input-${title}`}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default FileUploader;
