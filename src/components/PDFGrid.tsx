
import React from 'react';
import { FileText, Eye, Download, Calendar, Hash, Check } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PDFDocument } from '@/pages/Index';

interface PDFGridProps {
  documents: PDFDocument[];
  selectedDocuments: string[];
  setSelectedDocuments: React.Dispatch<React.SetStateAction<string[]>>;
  onPreview: (document: PDFDocument) => void;
  formatFileSize: (bytes: number) => string;
}

export const PDFGrid: React.FC<PDFGridProps> = ({
  documents,
  selectedDocuments,
  setSelectedDocuments,
  onPreview,
  formatFileSize
}) => {
  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const downloadDocument = (document: PDFDocument) => {
    const url = URL.createObjectURL(document.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No PDFs found</h3>
        <p className="text-gray-500">
          Try adjusting your search terms or filters, or upload some PDF documents to get started.
        </p>
      </div>
    );
  }

  const allSelected = documents.length > 0 && selectedDocuments.length === documents.length;
  const someSelected = selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  return (
    <div className="space-y-4">
      {/* Select All Control */}
      <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <span className="text-sm font-medium">
          {allSelected ? 'Deselect All' : someSelected ? `${selectedDocuments.length} selected` : 'Select All'}
        </span>
        {selectedDocuments.length > 0 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedDocuments.length} selected
          </Badge>
        )}
      </div>

      {/* PDF Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map(document => {
          const isSelected = selectedDocuments.includes(document.id);
          
          return (
            <Card 
              key={document.id} 
              className={`group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
              }`}
            >
              <CardContent className="p-4">
                {/* Header with checkbox */}
                <div className="flex items-start justify-between mb-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectDocument(document.id, checked as boolean)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <FileText className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                </div>

                {/* Document Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
                    {document.name}
                  </h3>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {document.uploadDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      {formatFileSize(document.size)}
                    </div>
                  </div>

                  {/* Tags */}
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {document.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{document.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(document)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(document)}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
