
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, CloudUpload, X, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTimestamp, setUploadTimestamp] = useState<Date | null>(null);

  // Clear input value when file is reset to null
  useEffect(() => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.value = '';
      setUploadTimestamp(null);
    }
  }, [file]);

  // Set upload timestamp when file is uploaded
  useEffect(() => {
    if (file && !uploadTimestamp) {
      setUploadTimestamp(new Date());
    }
  }, [file, uploadTimestamp]);

  // Simulate upload progress when processing
  useEffect(() => {
    if (isProcessing) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setUploadProgress(0);
    }
  }, [isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].name.toLowerCase().endsWith('.csv')) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
      // Clear the input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!file || hasErrors) {
      fileInputRef.current?.click();
    }
  }, [file]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // This would need to be handled by parent component
    // For now, we'll just clear the input
  }, []);

  const handleReplaceFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const hasErrors = errors.length > 0;
  const isUploaded = file !== null && !hasErrors;
  const showSuccess = isUploaded && !isProcessing;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCardClasses = () => {
    if (hasErrors) return 'border-red-300 bg-red-50/80 dark:bg-red-950/20 dark:border-red-800';
    if (showSuccess) return 'border-green-300 bg-green-50/80 dark:bg-green-950/20 dark:border-green-800';
    if (isDragOver) return 'border-primary bg-primary/5 dark:bg-primary/10 border-2 border-dashed';
    return 'border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-muted/50';
  };

  const getIconAndContent = () => {
    if (showSuccess) {
      return {
        icon: <CheckCircle className="mx-auto h-12 w-12 text-green-500" />,
        message: '✅ Upload successful'
      };
    }
    
    if (hasErrors) {
      return {
        icon: <AlertCircle className="mx-auto h-12 w-12 text-red-500" />,
        message: '❌ Validation failed'
      };
    }
    
    if (isDragOver) {
      return {
        icon: <CloudUpload className="mx-auto h-12 w-12 text-primary animate-bounce" />,
        message: '📁 Drop your CSV file here'
      };
    }
    
    return {
      icon: <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />,
      message: null
    };
  };

  const { icon, message } = getIconAndContent();

  return (
    <Card className={`transition-all duration-200 ${getCardClasses()}`}>
      <CardContent className="p-6">
        <div
          className="text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {!showSuccess ? (
            <>
              <div className="mb-4">
                {icon}
              </div>
              
              <h3 className="text-lg font-semibold mb-2 dark:text-foreground">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
              
              {message && (
                <p className="text-sm font-medium mb-4 text-center">
                  {message}
                </p>
              )}
              
              {!hasErrors && !isDragOver && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <p>Drag and drop your CSV file here, or click to browse</p>
                  <p className="mt-1">Maximum file size: 10MB</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                {icon}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-foreground">{file.name}</span>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Size: {formatFileSize(file.size)}</p>
                  {uploadTimestamp && (
                    <p>Uploaded: {formatTimestamp(uploadTimestamp)}</p>
                  )}
                </div>
                
                <div className="flex justify-center space-x-2 pt-2">
                  <Button
                    onClick={handleReplaceFile}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Replace</span>
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {isProcessing && (
            <div className="mt-4 space-y-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-blue-600">Processing file...</p>
              <div className="max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>
          )}
          
          {hasErrors && (
            <div className="mt-4 text-left">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400 mb-1">
                  • {error.message}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
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
