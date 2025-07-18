
import React, { useCallback, useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFUploadZoneProps {
  onFilesUpload: (files: File[]) => void;
  isCompact?: boolean;
}

export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({ onFilesUpload, isCompact = false }) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type === 'application/pdf');
    const invalidCount = files.length - validFiles.length;
    
    if (invalidCount > 0) {
      toast({
        title: "Some files skipped",
        description: `${invalidCount} non-PDF file${invalidCount > 1 ? 's' : ''} were skipped. Only PDF files are allowed.`,
        variant: "destructive",
      });
    }
    
    return validFiles;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsUploading(true);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      onFilesUpload(validFiles);
    }
    
    setIsUploading(false);
  }, [onFilesUpload, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        onFilesUpload(validFiles);
      }
      
      // Reset input value to allow selecting the same files again
      e.target.value = '';
      setIsUploading(false);
    }
  }, [onFilesUpload, toast]);

  if (isCompact) {
    return (
      <div className="relative">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <Button variant="outline" disabled={isUploading}>
          <Plus className="h-4 w-4 mr-2" />
          Add PDFs
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
        ${isDragOver 
          ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }
        ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      <div className="space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
          isDragOver ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className={`h-8 w-8 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragOver ? 'Drop your PDFs here' : 'Upload PDF Documents'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop your PDF files here, or click to browse
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <FileText className="h-4 w-4" />
            <span>Supports multiple PDF files</span>
          </div>
        </div>
        
        {!isUploading && (
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        )}
      </div>
    </div>
  );
};
