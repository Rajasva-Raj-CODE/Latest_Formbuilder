"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from "@/components/ui";
import {
  RefreshCw,
  Database,
  FileText,
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronDown,
  ChevronRight,
  Type,
  Hash,
  CheckSquare,
  Square,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";

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
      }

      // Fetch submissions
      try {
        const submissionsResponse = await fetch("/api/submissions");
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.log("Submissions API not implemented yet");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
      } else {
        const error = await response.json();
        alert(`Failed to delete form: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please try again.');
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
      } else {
        const error = await response.json();
        alert(`Failed to delete submission: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
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
          <Button onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
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

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search ${
                  activeTab === "forms" ? "forms" : "submissions"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {activeTab === "forms" && (
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>

                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="userName">Sort by User</option>
                  <option value="submissions">Sort by Submissions</option>
                </Select>
              </div>
            )}

            {activeTab === "submissions" && (
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Sort by Date</option>
                <option value="formTitle">Sort by Form</option>
                <option value="userName">Sort by User</option>
              </Select>
            )}

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "forms" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("title")}
                  >
                    Title <SortIcon field="title" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("userName")}
                  >
                    Created By <SortIcon field="userName" />
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("submissions")}
                  >
                    Submissions <SortIcon field="submissions" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created <SortIcon field="createdAt" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No forms found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedForms.map((form) => (
                    <React.Fragment key={form.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => toggleRowExpansion(form.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {expandedRows.has(form.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span>{form.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{form.userName}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {form.description || "No description"}
                        </TableCell>
                        <TableCell>
                          {form.isPublished ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="warning">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {form._count.submissions}
                        </TableCell>
                        <TableCell>{formatDate(form.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
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
                        </TableCell>
                      </TableRow>

                      {/* Expanded row with form details */}
                      {expandedRows.has(form.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Form ID:</span>{" "}
                                  {form.id}
                                </div>
                                <div>
                                  <span className="font-medium">Updated:</span>{" "}
                                  {formatDate(form.updatedAt)}
                                </div>
                                {form.publishedAt && (
                                  <div>
                                    <span className="font-medium">
                                      Published:
                                    </span>{" "}
                                    {formatDate(form.publishedAt)}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Active:</span>{" "}
                                  {form.isActive ? "Yes" : "No"}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">
                                  Form Fields ({form.fields.length})
                                </h4>
                                <div className="space-y-3">
                                  {form.fields
                                    .sort((a, b) => a.order - b.order)
                                    .map((field) => (
                                      <div
                                        key={field.id}
                                        className="bg-white p-4 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900">
                                              {field.label}
                                            </span>
                                            {field.required && (
                                              <Badge
                                                variant="destructive"
                                                className="text-xs"
                                              >
                                                Required
                                              </Badge>
                                            )}
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="text-xs font-mono"
                                          >
                                            {field.type}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-gray-500">
                                              Order:
                                            </span>
                                            <span className="ml-2 font-medium">
                                              {field.order}
                                            </span>
                                          </div>

                                          {field.placeholder && (
                                            <div>
                                              <span className="text-gray-500">
                                                Placeholder:
                                              </span>
                                              <span className="ml-2 font-medium">
                                                {field.placeholder}
                                              </span>
                                            </div>
                                          )}

                                          {field.options &&
                                            parseOptions(field.options).length >
                                              0 && (
                                              <div className="md:col-span-2">
                                                <span className="text-gray-500">
                                                  Options:
                                                </span>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                  {parseOptions(
                                                    field.options
                                                  ).map(
                                                    (
                                                      option: string,
                                                      index: number
                                                    ) => (
                                                      <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="text-xs"
                                                      >
                                                        {option}
                                                      </Badge>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination for Forms */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredForms.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("formTitle")}
                  >
                    Form Title <SortIcon field="formTitle" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("userName")}
                  >
                    User <SortIcon field="userName" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("createdAt")}
                  >
                    Submitted <SortIcon field="createdAt" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No submissions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubmissions.map((submission) => (
                    <React.Fragment key={submission.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => toggleRowExpansion(submission.id)}
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center space-x-2">
                            {expandedRows.has(submission.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span>{submission.id.slice(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {submission.form.title}
                        </TableCell>
                        <TableCell>
                          {submission.userName || "Anonymous"}
                        </TableCell>
                        <TableCell>
                          {formatDate(submission.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
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
                        </TableCell>
                      </TableRow>

                      {/* Expanded row with submission details */}
                      {expandedRows.has(submission.id) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Submission ID:
                                  </span>{" "}
                                  {submission.id}
                                </div>
                                <div>
                                  <span className="font-medium">Form ID:</span>{" "}
                                  {submission.formId}
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">
                                    Submission Data
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRawDataView(submission.id);
                                    }}
                                    className="text-xs"
                                  >
                                    {rawDataView.has(submission.id)
                                      ? "Show Formatted"
                                      : "Show Raw JSON"}
                                  </Button>
                                </div>
                                <div className="bg-white p-4 rounded-md border">
                                  {rawDataView.has(submission.id) ? (
                                    <div className="overflow-x-auto">
                                      <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded border">
                                        {JSON.stringify(
                                          JSON.parse(submission.data),
                                          null,
                                          2
                                        )}
                                      </pre>
                                    </div>
                                  ) : (
                                    <SubmissionDataDisplay
                                      data={submission.data}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination for Submissions */}
            {submissionsTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={submissionsTotalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredSubmissions.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
}
