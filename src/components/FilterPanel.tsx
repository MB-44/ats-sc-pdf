
import React, { useState } from 'react';
import { Plus, X, Filter, Calendar, Hash, FileText, Tag, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomFilter, PDFDocument } from '@/pages/Index';

interface FilterPanelProps {
  customFilters: CustomFilter[];
  setCustomFilters: React.Dispatch<React.SetStateAction<CustomFilter[]>>;
  documents: PDFDocument[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  customFilters,
  setCustomFilters,
  documents
}) => {
  const [newFilter, setNewFilter] = useState<Partial<CustomFilter>>({
    type: 'text',
    operator: 'contains'
  });

  const filterTypes = [
    { value: 'text', label: 'File Name', icon: FileText },
    { value: 'date', label: 'Upload Date', icon: Calendar },
    { value: 'size', label: 'File Size', icon: Hash },
    { value: 'tags', label: 'Tags', icon: Tag },
    { value: 'content', label: 'Content', icon: Search },
  ];

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' }
    ],
    date: [
      { value: 'equals', label: 'On date' },
      { value: 'greater', label: 'After' },
      { value: 'less', label: 'Before' }
    ],
    size: [
      { value: 'greater', label: 'Larger than' },
      { value: 'less', label: 'Smaller than' }
    ],
    tags: [
      { value: 'contains', label: 'Contains' }
    ],
    content: [
      { value: 'contains', label: 'Contains' }
    ]
  };

  const addFilter = () => {
    if (!newFilter.name || !newFilter.value || !newFilter.type || !newFilter.operator) {
      return;
    }

    const filter: CustomFilter = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFilter.name,
      type: newFilter.type as CustomFilter['type'],
      value: newFilter.value,
      operator: newFilter.operator as CustomFilter['operator']
    };

    setCustomFilters(prev => [...prev, filter]);
    setNewFilter({ type: 'text', operator: 'contains' });
  };

  const removeFilter = (filterId: string) => {
    setCustomFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const getInputType = (type: string) => {
    switch (type) {
      case 'date':
        return 'date';
      case 'size':
        return 'number';
      default:
        return 'text';
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'text':
        return 'Enter file name...';
      case 'date':
        return '';
      case 'size':
        return 'Size in MB...';
      case 'tags':
        return 'Enter tag...';
      case 'content':
        return 'Search content...';
      default:
        return '';
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="h-5 w-5 mr-2" />
          Custom Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Filter */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Add New Filter</Label>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Filter Name</Label>
            <Input
              placeholder="Enter filter name..."
              value={newFilter.name || ''}
              onChange={(e) => setNewFilter(prev => ({ ...prev, name: e.target.value }))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Filter Type</Label>
            <Select
              value={newFilter.type}
              onValueChange={(value) => setNewFilter(prev => ({ 
                ...prev, 
                type: value as CustomFilter['type'],
                operator: operators[value as keyof typeof operators][0].value as CustomFilter['operator']
              }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value} className="text-sm">
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Condition</Label>
            <Select
              value={newFilter.operator}
              onValueChange={(value) => setNewFilter(prev => ({ 
                ...prev, 
                operator: value as CustomFilter['operator']
              }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {newFilter.type && operators[newFilter.type as keyof typeof operators]?.map(op => (
                  <SelectItem key={op.value} value={op.value} className="text-sm">
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Value</Label>
            <Input
              type={getInputType(newFilter.type || 'text')}
              placeholder={getPlaceholder(newFilter.type || 'text')}
              value={newFilter.value || ''}
              onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
              className="text-sm"
            />
          </div>

          <Button 
            onClick={addFilter}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!newFilter.name || !newFilter.value}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>

        {/* Active Filters */}
        {customFilters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters ({customFilters.length})</Label>
            {customFilters.map(filter => (
              <div key={filter.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-blue-900 truncate">
                    {filter.name}
                  </div>
                  <div className="text-xs text-blue-700">
                    {filterTypes.find(t => t.value === filter.type)?.label} {' '}
                    {operators[filter.type]?.find(op => op.value === filter.operator)?.label.toLowerCase()} {' '}
                    "{filter.value}"
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t space-y-2">
          <Label className="text-sm font-medium">Statistics</Label>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Total PDFs: {documents.length}</div>
            <div>Total Size: {Math.round(documents.reduce((acc, doc) => acc + doc.size, 0) / (1024 * 1024))} MB</div>
            <div>Uploaded Today: {documents.filter(doc => 
              doc.uploadDate.toDateString() === new Date().toDateString()
            ).length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
