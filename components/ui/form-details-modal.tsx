import React from 'react';
import { Button, Badge } from './index';
import {
  X,
  Type,
  Hash,
  CheckSquare,
  Square,
  Calendar,
  User,
  FileText,
  Settings,
} from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string;
  order: number;
  formId: string;
  createdAt: string;
  updatedAt: string;
}

interface FormDetailsModalProps {
  form: {
    id: string;
    title: string;
    description?: string;
    userName: string;
    isPublished: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    fields?: FormField[];
    _count: {
      submissions: number;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function FormDetailsModal({
  form,
  isOpen,
  onClose,
}: FormDetailsModalProps) {
  if (!isOpen) return null;

  const parseOptions = (options: string | null) => {
    if (!options) return [];
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text':
      case 'textarea':
        return <Type className="w-4 h-4 text-blue-500" />;
      case 'number':
        return <Hash className="w-4 h-4 text-green-500" />;
      case 'email':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'checkbox':
      case 'radio':
        return <CheckSquare className="w-4 h-4 text-orange-500" />;
      case 'select':
      case 'dropdown':
        return <Settings className="w-4 h-4 text-indigo-500" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Form Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {form.title}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Form Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-500">Form ID:</span>
                <p className="font-mono text-sm">{form.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created By:</span>
                <p className="text-sm">{form.userName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <div className="flex items-center space-x-2 mt-1">
                  {form.isPublished ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="warning">Draft</Badge>
                  )}
                  {!form.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submissions:</span>
                <p className="text-sm font-medium text-blue-600">{form._count.submissions}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <p className="text-sm">{new Date(form.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Updated:</span>
                <p className="text-sm">{new Date(form.updatedAt).toLocaleString()}</p>
              </div>
              {form.publishedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Published:</span>
                  <p className="text-sm">{new Date(form.publishedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Fields:</span>
                <p className="text-sm font-medium text-purple-600">{form.fields?.length || 0}</p>
              </div>
            </div>

            {/* Description */}
            {form.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {form.description}
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Form Fields ({form.fields?.length || 0})
              </h3>
              <div className="space-y-3">
                {form.fields
                  ?.sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getFieldTypeIcon(field.type)}
                          <span className="font-medium text-gray-900">
                            {field.label}
                          </span>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                          {field.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Order:</span>
                          <span className="ml-2 font-medium">{field.order}</span>
                        </div>

                        {field.placeholder && (
                          <div>
                            <span className="text-gray-500">Placeholder:</span>
                            <span className="ml-2 font-medium">{field.placeholder}</span>
                          </div>
                        )}

                        {field.options && parseOptions(field.options).length > 0 && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Options:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {parseOptions(field.options).map((option: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 