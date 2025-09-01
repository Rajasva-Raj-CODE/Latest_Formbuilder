import React, { useState } from 'react';
import { Button, Badge } from './index';
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Hash,
  CheckSquare,
  Square,
  Type,
} from 'lucide-react';

interface SubmissionDetailsModalProps {
  submission: {
    id: string;
    formId: string;
    userName?: string;
    data: string;
    createdAt: string;
    form: {
      title: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionDetailsModal({
  submission,
  isOpen,
  onClose,
}: SubmissionDetailsModalProps) {
  const [showRawData, setShowRawData] = useState(false);

  if (!isOpen) return null;

  // Component to display submission data in a readable format
  const SubmissionDataDisplay = ({ data }: { data: string }) => {
    try {
      const parsedData = JSON.parse(data);

      if (typeof parsedData === "object" && parsedData !== null) {
        return (
          <div className="space-y-3">
            {Object.entries(parsedData).map(([key, value]) => (
              <div
                key={key}
                className="border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getFieldIcon(key, value)}
                      <span className="font-medium text-gray-900 capitalize">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-gray-700 ml-6">
                      {renderFieldValue(value, key)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        return <div className="text-gray-600 italic">{String(parsedData)}</div>;
      }
    } catch (error) {
      return (
        <div className="text-red-600 text-sm">
          Error parsing submission data: {String(data)}
        </div>
      );
    }
  };

  // Helper function to get appropriate icon for field types
  const getFieldIcon = (key: string, value: any) => {
    const keyLower = key.toLowerCase();

    // Check for common field names
    if (keyLower.includes("email") || keyLower.includes("mail")) {
      return <Mail className="w-4 h-4 text-blue-500" />;
    }
    if (
      keyLower.includes("phone") ||
      keyLower.includes("mobile") ||
      keyLower.includes("tel")
    ) {
      return <Phone className="w-4 h-4 text-green-500" />;
    }
    if (keyLower.includes("name") || keyLower.includes("user")) {
      return <User className="w-4 h-4 text-purple-500" />;
    }
    if (
      keyLower.includes("address") ||
      keyLower.includes("location") ||
      keyLower.includes("city")
    ) {
      return <MapPin className="w-4 h-4 text-red-500" />;
    }
    if (keyLower.includes("date") || keyLower.includes("time")) {
      return <Calendar className="w-4 h-4 text-orange-500" />;
    }
    if (
      keyLower.includes("number") ||
      keyLower.includes("age") ||
      keyLower.includes("count")
    ) {
      return <Hash className="w-4 h-4 text-indigo-500" />;
    }
    if (typeof value === "boolean") {
      return value ? (
        <CheckSquare className="w-4 h-4 text-green-500" />
      ) : (
        <Square className="w-4 h-4 text-gray-500" />
      );
    }

    // Default icon
    return <Type className="w-4 h-4 text-gray-500" />;
  };

  // Helper function to render different types of field values
  const renderFieldValue = (value: any, key?: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    if (typeof value === "string") {
      if (value.trim() === "") {
        return <span className="text-gray-400 italic">Empty</span>;
      }

      // Check if it's a date string
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && value.length > 10) {
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-sm">
              {dateValue.toLocaleDateString()}
            </span>
            <span className="text-gray-500 text-xs">
              ({dateValue.toLocaleTimeString()})
            </span>
          </div>
        );
      }

      // Check if it's an email
      if (value.includes("@") && value.includes(".")) {
        return (
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a
              href={`mailto:${value}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {value}
            </a>
          </div>
        );
      }

      // Check if it's a phone number
      if (/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ""))) {
        return (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <a
              href={`tel:${value}`}
              className="text-green-600 hover:text-green-800 underline"
            >
              {value}
            </a>
          </div>
        );
      }

      // Check if it's a URL
      if (value.startsWith("http://") || value.startsWith("https://")) {
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {value}
            </a>
          </div>
        );
      }

      return <span className="break-words">{value}</span>;
    }

    if (typeof value === "number") {
      // Check if it's a currency value
      if (
        key &&
        (key.toLowerCase().includes("price") ||
          key.toLowerCase().includes("cost") ||
          key.toLowerCase().includes("amount"))
      ) {
        return (
          <span className="font-mono font-medium text-green-600">
            ${value.toFixed(2)}
          </span>
        );
      }
      return <span className="font-mono">{value}</span>;
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "success" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">No items</span>;
      }
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="bg-gray-50 px-3 py-2 rounded-md">
              {renderFieldValue(item, `${key}[${index}]`)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="flex items-start space-x-2">
              <span className="font-medium text-gray-600 text-sm min-w-0 flex-shrink-0">
                {nestedKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                :
              </span>
              <span className="text-gray-700 flex-1">
                {renderFieldValue(nestedValue, nestedKey)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="break-words">{String(value)}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submission Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {submission.form.title}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Formatted
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Show Raw JSON
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-500">Submission ID:</span>
                <p className="font-mono text-sm">{submission.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Form ID:</span>
                <p className="font-mono text-sm">{submission.formId}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User:</span>
                <p className="text-sm">{submission.userName || "Anonymous"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <p className="text-sm">{new Date(submission.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Submission Data */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Submission Data
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg">
                {showRawData ? (
                  <div className="p-4">
                    <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded border overflow-x-auto">
                      {JSON.stringify(JSON.parse(submission.data), null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4">
                    <SubmissionDataDisplay data={submission.data} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 