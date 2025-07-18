
import React, { useState, useCallback } from 'react';
import { Upload, Search, Download, Filter, Plus, X, FileText, Calendar, Tag, Hash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PDFUploadZone } from '@/components/PDFUploadZone';
import { FilterPanel } from '@/components/FilterPanel';
import { PDFGrid } from '@/components/PDFGrid';
import { PDFPreview } from '@/components/PDFPreview';

export interface PDFDocument {
  id: string;
  name: string;
  file: File;
  uploadDate: Date;
  size: number;
  tags: string[];
  content?: string;
  thumbnail?: string;
}

export interface CustomFilter {
  id: string;
  name: string;
  type: 'text' | 'date' | 'size' | 'tags' | 'content';
  value: string;
  operator: 'contains' | 'equals' | 'greater' | 'less' | 'between';
}

const Index = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<PDFDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<PDFDocument | null>(null);

  const handleFilesUpload = useCallback((files: File[]) => {
    const newDocuments: PDFDocument[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      uploadDate: new Date(),
      size: file.size,
      tags: [],
      content: '', // In a real app, you'd extract text from PDF
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    setFilteredDocuments(prev => [...prev, ...newDocuments]);
    
    toast({
      title: "Success",
      description: `${files.length} PDF${files.length > 1 ? 's' : ''} uploaded successfully`,
    });
  }, [toast]);

  const applyFilters = useCallback(() => {
    let filtered = [...documents];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply custom filters
    customFilters.forEach(filter => {
      filtered = filtered.filter(doc => {
        switch (filter.type) {
          case 'text':
            return doc.name.toLowerCase().includes(filter.value.toLowerCase());
          case 'date':
            const docDate = doc.uploadDate.toDateString();
            const filterDate = new Date(filter.value).toDateString();
            return filter.operator === 'equals' ? docDate === filterDate : 
                   filter.operator === 'greater' ? doc.uploadDate > new Date(filter.value) :
                   doc.uploadDate < new Date(filter.value);
          case 'size':
            const sizeValue = parseInt(filter.value) * 1024 * 1024; // MB to bytes
            return filter.operator === 'greater' ? doc.size > sizeValue : doc.size < sizeValue;
          case 'tags':
            return doc.tags.some(tag => tag.toLowerCase().includes(filter.value.toLowerCase()));
          case 'content':
            return doc.content?.toLowerCase().includes(filter.value.toLowerCase()) || false;
          default:
            return true;
        }
      });
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, customFilters]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleBulkDownload = () => {
    const documentsToDownload = selectedDocuments.length > 0 
      ? filteredDocuments.filter(doc => selectedDocuments.includes(doc.id))
      : filteredDocuments;

    if (documentsToDownload.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select documents to download or ensure your filters return results",
        variant: "destructive",
      });
      return;
    }

    // Create and trigger downloads
    documentsToDownload.forEach(doc => {
      const url = URL.createObjectURL(doc.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Download started",
      description: `Downloading ${documentsToDownload.length} PDF${documentsToDownload.length > 1 ? 's' : ''}`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PDF Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {documents.length} PDF{documents.length !== 1 ? 's' : ''} uploaded
              </span>
              <Button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          {showFilterPanel && (
            <div className="lg:col-span-1">
              <FilterPanel
                customFilters={customFilters}
                setCustomFilters={setCustomFilters}
                documents={documents}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={`${showFilterPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Upload Zone */}
            {documents.length === 0 && (
              <div className="mb-8">
                <PDFUploadZone onFilesUpload={handleFilesUpload} />
              </div>
            )}

            {/* Search and Controls */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search PDFs by name, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkDownload}
                    disabled={filteredDocuments.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download {selectedDocuments.length > 0 ? 'Selected' : 'Filtered'}
                  </Button>
                  {documents.length > 0 && (
                    <PDFUploadZone onFilesUpload={handleFilesUpload} isCompact />
                  )}
                </div>
              </div>

              {/* Filter Summary */}
              {(searchQuery || customFilters.length > 0) && (
                <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Search: "{searchQuery}"
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}
                  {customFilters.map(filter => (
                    <Badge key={filter.id} variant="secondary" className="bg-blue-100 text-blue-800">
                      {filter.name}: {filter.value}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setCustomFilters(prev => prev.filter(f => f.id !== filter.id))}
                      />
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setCustomFilters([]);
                    }}
                    className="h-6 px-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Showing {filteredDocuments.length} of {documents.length} PDF{documents.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* PDF Grid */}
            <PDFGrid
              documents={filteredDocuments}
              selectedDocuments={selectedDocuments}
              setSelectedDocuments={setSelectedDocuments}
              onPreview={setPreviewDocument}
              formatFileSize={formatFileSize}
            />
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewDocument && (
        <PDFPreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};

export default Index;
