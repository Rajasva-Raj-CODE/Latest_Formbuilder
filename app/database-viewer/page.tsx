"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, Button, Badge, AdvancedTable, type Column, SubmissionDetailsModal, FormDetailsModal, ExportMenu } from "@/components/ui";
import {
  RefreshCw,
  Database,
  FileText,
  Users,
  Eye,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  CheckSquare,
  Square,
  Type,
} from "lucide-react";
import { toast } from "@/lib/toast";

interface Form {
  id: string;
  title: string;
  description?: string;
  userName: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  fields: FormField[];
  _count: {
    submissions: number;
  };
}

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

interface FormSubmission {
  id: string;
  formId: string;
  userName?: string;
  data: string;
  createdAt: string;
  form: {
    title: string;
  };
}

export default function DatabaseViewerPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"forms" | "submissions">("forms");


  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [rawDataView, setRawDataView] = useState<Set<string>>(new Set());
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: 'form' | 'submission';
    id: string;
    title: string;
  } | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch forms
      const formsResponse = await fetch("/api/forms");
      if (formsResponse.ok) {
        const formsData = await formsResponse.json();
        setForms(formsData);
      } else {
        toast.error("Failed to fetch forms", "Please refresh the page to try again.");
      }

      // Fetch submissions
      try {
        const submissionsResponse = await fetch("/api/submissions");
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          setSubmissions(submissionsData);
        } else {
          toast.warning("Failed to fetch submissions", "Submissions data may not be up to date.");
        }
      } catch (err) {
        console.log("Submissions API not implemented yet");
        toast.info("Submissions API", "Submissions API is not yet implemented.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseOptions = (options: string | null) => {
    if (!options) return [];
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  };

  // Filtered and sorted forms
  const filteredForms = useMemo(() => {
    let filtered = forms.filter((form) => {
      const matchesSearch =
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && form.isPublished) ||
        (statusFilter === "draft" && !form.isPublished);

      return matchesSearch && matchesStatus;
    });

    // Sort forms
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "userName":
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case "submissions":
          aValue = a._count.submissions;
          bValue = b._count.submissions;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [forms, searchTerm, statusFilter, sortBy, sortOrder]);

  // Filtered and sorted submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions.filter((submission) => {
      const matchesSearch =
        submission.form.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        submission.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "formTitle":
          aValue = a.form.title.toLowerCase();
          bValue = b.form.title.toLowerCase();
          break;
        case "userName":
          aValue = (a.userName || "").toLowerCase();
          bValue = (b.userName || "").toLowerCase();
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [submissions, searchTerm, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const submissionsTotalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedForms = filteredForms.slice(startIndex, endIndex);
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="ml-1 text-gray-400">↕</span>;
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setExpandedRows(new Set());
    setRawDataView(new Set());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleRawDataView = (id: string) => {
    const newRawDataView = new Set(rawDataView);
    if (newRawDataView.has(id)) {
      newRawDataView.delete(id);
    } else {
      newRawDataView.add(id);
    }
    setRawDataView(newRawDataView);
  };

  const handleDeleteForm = async (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const form = forms.find(f => f.id === formId);
    if (form) {
      setDeleteConfirm({
        show: true,
        type: 'form',
        id: formId,
        title: form.title
      });
    }
  };

  const confirmDeleteForm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setDeletingItem(deleteConfirm.id);
      const response = await fetch(`/api/forms/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the form from state
        setForms(forms.filter(form => form.id !== deleteConfirm.id));
        // Remove from expanded rows if it was expanded
        const newExpandedRows = new Set(expandedRows);
        newExpandedRows.delete(deleteConfirm.id);
        setExpandedRows(newExpandedRows);
        setDeleteConfirm(null);
        toast.success("Form deleted successfully!", "The form and all its data have been permanently removed.");
      } else {
        const errorData = await response.json();
        toast.error("Failed to delete form", errorData.error || 'Please try again.');
      }
    } catch (err) {
      console.error('Error deleting form:', err);
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setDeletingItem(null);
    }
  };

  const handleDeleteSubmission = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
      setDeleteConfirm({
        show: true,
        type: 'submission',
        id: submissionId,
        title: `Submission from ${submission.form.title}`
      });
    }
  };

  const confirmDeleteSubmission = async () => {
    if (!deleteConfirm) return;
    
    try {
      setDeletingItem(deleteConfirm.id);
      const response = await fetch(`/api/submissions/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the submission from state
        setSubmissions(submissions.filter(submission => submission.id !== deleteConfirm.id));
        // Remove from expanded rows if it was expanded
        const newExpandedRows = new Set(expandedRows);
        newExpandedRows.delete(deleteConfirm.id);
        setExpandedRows(newExpandedRows);
        setDeleteConfirm(null);
        toast.success("Submission deleted successfully!", "The submission has been permanently removed.");
      } else {
        const errorData = await response.json();
        toast.error("Failed to delete submission", errorData.error || 'Please try again.');
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setDeletingItem(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Database Viewer
            </h1>
            <p className="text-gray-600 mt-2">
              View all data stored in your database
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <ExportMenu />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Forms
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Database className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Fields
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.reduce((sum, form) => sum + form.fields.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.reduce(
                      (sum, form) => sum + form._count.submissions,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("forms")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "forms"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Forms ({forms.length})
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "submissions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Submissions ({submissions.length})
              </button>
            </nav>
          </div>
        </div>



                {/* Content */}
        {activeTab === "forms" ? (
          <AdvancedTable
            data={paginatedForms}
            columns={[
              {
                key: 'title',
                header: 'Title',
                accessor: (form) => form.title,
                sortable: true,
                filterable: true,
                sticky: true,
                width: '250px',
                render: (value, form) => (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRowExpansion(form.id)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {expandedRows.has(form.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <span className="font-medium">{value}</span>
                  </div>
                ),
              },
              {
                key: 'userName',
                header: 'Created By',
                accessor: (form) => form.userName,
                sortable: true,
                filterable: true,
                width: '150px',
                render: (value) => (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{value}</span>
                  </div>
                ),
              },
              {
                key: 'description',
                header: 'Description',
                accessor: (form) => form.description,
                filterable: true,
                width: '300px',
                render: (value) => value || <span className="text-gray-400 italic">No description</span>,
              },
              {
                key: 'status',
                header: 'Status',
                accessor: (form) => form.isPublished,
                sortable: true,
                width: '120px',
                render: (value, form) => (
                  <div className="flex items-center space-x-1">
                    {form.isPublished ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Draft</Badge>
                    )}
                    {!form.isActive && (
                      <Badge variant="destructive" className="ml-1">Inactive</Badge>
                    )}
                  </div>
                ),
              },
              {
                key: 'submissions',
                header: 'Submissions',
                accessor: (form) => form._count.submissions,
                sortable: true,
                align: 'center',
                width: '120px',
                render: (value) => (
                  <span className="font-mono font-medium text-blue-600">{value}</span>
                ),
              },
              {
                key: 'createdAt',
                header: 'Created',
                accessor: (form) => new Date(form.createdAt),
                sortable: true,
                width: '120px',
                render: (value) => formatDate(value.toISOString()),
              },
              {
                key: 'updatedAt',
                header: 'Updated',
                accessor: (form) => new Date(form.updatedAt),
                sortable: true,
                width: '120px',
                render: (value) => formatDate(value.toISOString()),
              },
              {
                key: 'publishedAt',
                header: 'Published',
                accessor: (form) => form.publishedAt ? new Date(form.publishedAt) : null,
                sortable: true,
                width: '120px',
                render: (value) => value ? formatDate(value.toISOString()) : <span className="text-gray-400">-</span>,
              },
              {
                key: 'fields',
                header: 'Fields',
                accessor: (form) => form.fields.length,
                sortable: true,
                align: 'center',
                width: '100px',
                render: (value) => (
                  <span className="font-mono font-medium text-purple-600">{value}</span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                accessor: () => null,
                width: '150px',
                align: 'center',
                render: (_, form) => (
                  <div className="flex items-center justify-center space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedForm(form);
                        setShowFormModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => handleDeleteForm(form.id, e)}
                      disabled={deletingItem === form.id}
                    >
                      {deletingItem === form.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ),
              },
            ]}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredForms.length,
              itemsPerPage,
              onPageChange: handlePageChange,
              onItemsPerPageChange: (newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              },
            }}
            search={{
              value: searchTerm,
              onChange: setSearchTerm,
              placeholder: "Search forms...",
            }}
            sorting={{
              sortBy,
              sortOrder,
              onSort: handleSort,
            }}

            actions={{
              onRefresh: fetchData,
              customActions: (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              ),
            }}
            emptyMessage="No forms found matching your criteria"
            showColumnVisibility={true}
            showFilters={false}
            virtualScroll={true}
            maxHeight="600px"
          />
        ) : (
          <AdvancedTable
            data={paginatedSubmissions}
            columns={[
              {
                key: 'id',
                header: 'ID',
                accessor: (submission) => submission.id,
                sortable: true,
                filterable: true,
                sticky: true,
                width: '150px',
                render: (value, submission) => (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRowExpansion(submission.id)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {expandedRows.has(submission.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <span className="font-mono text-sm">{value.slice(0, 8)}...</span>
                  </div>
                ),
              },
              {
                key: 'formTitle',
                header: 'Form Title',
                accessor: (submission) => submission.form.title,
                sortable: true,
                filterable: true,
                width: '250px',
                render: (value) => <span className="font-medium">{value}</span>,
              },
              {
                key: 'userName',
                header: 'User',
                accessor: (submission) => submission.userName,
                sortable: true,
                filterable: true,
                width: '150px',
                render: (value) => (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{value || "Anonymous"}</span>
                  </div>
                ),
              },
              {
                key: 'createdAt',
                header: 'Submitted',
                accessor: (submission) => new Date(submission.createdAt),
                sortable: true,
                width: '150px',
                render: (value) => formatDate(value.toISOString()),
              },
              {
                key: 'formId',
                header: 'Form ID',
                accessor: (submission) => submission.formId,
                sortable: true,
                filterable: true,
                width: '150px',
                render: (value) => <span className="font-mono text-sm">{value.slice(0, 8)}...</span>,
              },
              {
                key: 'actions',
                header: 'Actions',
                accessor: () => null,
                width: '150px',
                align: 'center',
                render: (_, submission) => (
                  <div className="flex items-center justify-center space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowSubmissionModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => handleDeleteSubmission(submission.id, e)}
                      disabled={deletingItem === submission.id}
                    >
                      {deletingItem === submission.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ),
              },
            ]}
            loading={loading}
            pagination={{
              currentPage,
              totalPages: submissionsTotalPages,
              totalItems: filteredSubmissions.length,
              itemsPerPage,
              onPageChange: handlePageChange,
              onItemsPerPageChange: (newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              },
            }}
            search={{
              value: searchTerm,
              onChange: setSearchTerm,
              placeholder: "Search submissions...",
            }}
            sorting={{
              sortBy,
              sortOrder,
              onSort: handleSort,
            }}

            actions={{
              onRefresh: fetchData,
            }}
            emptyMessage="No submissions found matching your criteria"
            showColumnVisibility={true}
            showFilters={false}
            virtualScroll={true}
            maxHeight="600px"
          />
        )}

        {/* Results Summary */}
        <div className="mt-6 text-sm text-gray-600 text-center">
          Showing{" "}
          {activeTab === "forms"
            ? `${startIndex + 1} to ${Math.min(endIndex, filteredForms.length)}`
            : `${startIndex + 1} to ${Math.min(endIndex, filteredSubmissions.length)}`}{" "}
          of {activeTab === "forms" ? filteredForms.length : filteredSubmissions.length}{" "}
          {activeTab}
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                {deleteConfirm.type === 'form' 
                  ? `Are you sure you want to delete the form "${deleteConfirm.title}"? This will also delete all associated fields and submissions.`
                  : `Are you sure you want to delete this submission?`
                }
              </p>
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingItem === deleteConfirm.id}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteConfirm.type === 'form' ? confirmDeleteForm : confirmDeleteSubmission}
                  disabled={deletingItem === deleteConfirm.id}
                >
                  {deletingItem === deleteConfirm.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Submission Details Modal */}
        {selectedSubmission && (
          <SubmissionDetailsModal
            submission={selectedSubmission}
            isOpen={showSubmissionModal}
            onClose={() => {
              setShowSubmissionModal(false);
              setSelectedSubmission(null);
            }}
          />
        )}

        {/* Form Details Modal */}
        {selectedForm && (
          <FormDetailsModal
            form={selectedForm}
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setSelectedForm(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
