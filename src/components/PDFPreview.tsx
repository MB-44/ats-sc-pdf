import React from 'react';
import { X, Download, Calendar, Hash, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PDFDocument } from '@/pages/Index';

interface PDFPreviewProps {
  document: PDFDocument;
  onClose: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ document: pdfDocument, onClose }) => {
  const downloadDocument = () => {
    const url = URL.createObjectURL(pdfDocument.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfDocument.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    const url = URL.createObjectURL(pdfDocument.file);
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {pdfDocument.name}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDocument}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {pdfDocument.uploadDate.toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Hash className="h-4 w-4 mr-1" />
              {formatFileSize(pdfDocument.size)}
            </div>
            {pdfDocument.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pdfDocument.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview</h3>
              <p className="text-gray-600 mb-4">
                PDF preview is not available in this demo. In a real application, you would use a PDF viewer library like react-pdf or pdf.js.
              </p>
              <div className="flex justify-center space-x-2">
                <Button onClick={openInNewTab} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button onClick={downloadDocument}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
