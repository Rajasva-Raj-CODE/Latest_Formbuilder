import React, { useState } from 'react';
import { Button } from './index';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  ChevronDown,
  Check,
} from 'lucide-react';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  url: string;
}

interface ExportMenuProps {
  className?: string;
  showFormSpecific?: boolean;
  formId?: string;
  formTitle?: string;
}

export function ExportMenu({ 
  className = '', 
  showFormSpecific = false,
  formId,
  formTitle 
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const exportOptions: ExportOption[] = [
    {
      id: 'forms-overview',
      label: 'Forms Overview',
      description: 'Export all forms with basic information',
      icon: <FileText className="w-4 h-4" />,
      url: '/api/export?type=forms&format=overview'
    },
    {
      id: 'forms-detailed',
      label: 'Forms Detailed',
      description: 'Export forms with field details and statistics',
      icon: <Database className="w-4 h-4" />,
      url: '/api/export?type=forms&format=detailed'
    },
    {
      id: 'submissions-all',
      label: 'All Submissions',
      description: 'Export all form submissions across all forms',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      url: '/api/export?type=submissions&format=all'
    },
    {
      id: 'submissions-form',
      label: `Submissions - ${formTitle || 'This Form'}`,
      description: `Export submissions for ${formTitle || 'this specific form'}`,
      icon: <FileSpreadsheet className="w-4 h-4" />,
      url: `/api/export?type=submissions&format=form&formId=${formId}`
    }
  ];

  // Filter options based on context
  const availableOptions = showFormSpecific 
    ? exportOptions 
    : exportOptions.filter(option => !option.id.includes('form'));

  const handleExport = async (option: ExportOption) => {
    try {
      setExporting(option.id);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = option.url;
      link.download = `${option.label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success feedback
      setTimeout(() => {
        setExporting(null);
        setIsOpen(false);
      }, 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExporting(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Export Data</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Choose Export Type
            </h3>
            
            <div className="space-y-2">
              {availableOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleExport(option)}
                  disabled={exporting === option.id}
                  className="w-full flex items-start space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {exporting === option.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      option.icon
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {option.label}
                      </p>
                      {exporting === option.id && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Files will be downloaded as CSV format, compatible with Excel and other spreadsheet applications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 