
import React, { useCallback, useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFUploadZoneProps {
  onFilesUpload: (filesWithContent: { file: File; content: string }[]) => void;
  isCompact?: boolean;
}

export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({ onFilesUpload, isCompact = false }) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    
    try {
      const filesWithContent = await Promise.all(
        files.map(async (file) => {
          const content = await extractTextFromPDF(file);
          return { file, content };
        })
      );
      
      onFilesUpload(filesWithContent);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process some PDF files",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      );
      
      if (files.length === 0) {
        toast({
          title: "Invalid files",
          description: "Please upload only PDF files",
          variant: "destructive",
        });
        return;
      }
      
      processFiles(files);
    },
    [onFilesUpload, toast]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(
        file => file.type === 'application/pdf'
      );
      
      if (files.length === 0) {
        toast({
          title: "Invalid files",
          description: "Please upload only PDF files",
          variant: "destructive",
        });
        return;
      }
      
      processFiles(files);
      
      // Reset input
      e.target.value = '';
    },
    [onFilesUpload, toast]
  );

  if (isCompact) {
    return (
      <div className="relative">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        <Button variant="outline" disabled={isProcessing}>
          <Plus className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Add More'}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <div className="relative">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              {isProcessing ? (
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
              ) : (
                <Upload className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processing PDFs...' : 'Upload PDF Documents'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isProcessing 
                ? 'Extracting text content from PDFs for searchability'
                : 'Drag and drop your PDF files here, or click to browse'
              }
            </p>
            
            {!isProcessing && (
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  PDF files only
                </div>
                <div>Multiple files supported</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
