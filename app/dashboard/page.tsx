"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardContent, AdvancedTable, type Column, FormDetailsModal, ExportMenu } from "@/components/ui";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Copy,
  User,
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
  _count: {
    submissions: number;
  };
}

interface Submission {
  id: string;
  formId: string;
  data: string;
  createdAt: string;
  userName?: string;
  form: {
    title: string;
  };
}

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);


  useEffect(() => {
    fetchForms();
    fetchSubmissions();
  }, []);



  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms");
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        console.error("Failed to fetch forms");
        toast.error("Failed to fetch forms", "Please refresh the page to try again.");
      }
    } catch (err) {
      console.error("Error fetching forms:", err);
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        console.error("Failed to fetch submissions");
        toast.error("Failed to fetch submissions", "Submissions data may not be up to date.");
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      toast.error("Network error", "Could not load submissions data.");
    }
  };

  // Filter and search forms
  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description &&
        form.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      form.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && form.isPublished) ||
      (statusFilter === "draft" && !form.isPublished);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedForms = filteredForms.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    setCurrentPage(page);
    // Simulate a small delay for better UX
    setTimeout(() => setIsChangingPage(false), 100);
  };

  const deleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setForms(forms.filter((form) => form.id !== formId));
        toast.success("Form deleted successfully!", "The form has been permanently removed.");
      } else {
        toast.error("Failed to delete form", "Please try again or contact support.");
      }
    } catch (err) {
      console.error("Error deleting form:", err);
      toast.error("Network error", "Please check your connection and try again.");
    }
  };

  const copyFormLink = async (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
        toast.success("Link copied!", "Form link has been copied to your clipboard.");
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          toast.success("Link copied!", "Form link has been copied to your clipboard.");
        } catch (err) {
          console.error("Fallback copy failed:", err);
          // Show the link for manual copy
          const manualLink = prompt("Copy this link manually:", link);
          if (manualLink) {
            toast.info("Manual copy", "Please copy the link from the prompt.");
          }
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      // Show the link for manual copy
      const manualLink = prompt("Copy this link manually:", link);
      if (manualLink) {
        toast.info("Manual copy", "Please copy the link from the prompt.");
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  const totalForms = forms.length;
  const publishedForms = forms.filter((form) => form.isPublished).length;
  const draftForms = forms.filter((form) => !form.isPublished).length;
  const totalSubmissions = forms.reduce(
    (sum, form) => sum + form._count.submissions,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your forms and view submissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ExportMenu />
            <Link href="/builder">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Forms
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalForms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {publishedForms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Edit className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {draftForms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalSubmissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Forms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Forms</h2>
          </div>

          {filteredForms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {searchTerm || statusFilter !== "all" ? (
                  <>
                    <p className="text-lg font-medium mb-2">
                      No forms match your filters
                    </p>
                    <p className="text-sm mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      No forms created yet
                    </p>
                    <p className="text-sm mb-4">
                      Start building your first form to see it here
                    </p>
                    <Link href="/builder">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Form
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
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
                      <span className="font-medium">{value}</span>
                      <div className="flex items-center space-x-1">
                        {form.isPublished ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        )}
                        {!form.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
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
                  render: (value) => value.toLocaleDateString(),
                },
                {
                  key: 'updatedAt',
                  header: 'Updated',
                  accessor: (form) => new Date(form.updatedAt),
                  sortable: true,
                  width: '120px',
                  render: (value, form) => {
                    const created = new Date(form.createdAt);
                    return value.getTime() === created.getTime() 
                      ? <span className="text-gray-400">-</span>
                      : value.toLocaleDateString();
                  },
                },
                {
                  key: 'publishedAt',
                  header: 'Published',
                  accessor: (form) => form.publishedAt ? new Date(form.publishedAt) : null,
                  sortable: true,
                  width: '120px',
                  render: (value) => value ? value.toLocaleDateString() : <span className="text-gray-400">-</span>,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  accessor: () => null,
                  width: '300px',
                  align: 'center',
                  render: (_, form) => (
                    <div className="flex items-center justify-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedForm(form);
                          setShowFormModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Link href={`/form/${form.id}`}>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/builder?edit=${form.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFormLink(form.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <ExportMenu 
                        showFormSpecific={true}
                        formId={form.id}
                        formTitle={form.title}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteForm(form.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
              loading={isChangingPage}
              pagination={{
                currentPage,
                totalPages,
                totalItems: filteredForms.length,
                itemsPerPage,
                onPageChange: handlePageChange,
                onItemsPerPageChange: handleItemsPerPageChange,
              }}
              search={{
                value: searchTerm,
                onChange: setSearchTerm,
                placeholder: "Search forms by title, description, or creator...",
              }}
              sorting={{
                sortBy: "createdAt",
                sortOrder: "desc",
                onSort: (key) => {
                  // Simple sorting implementation
                  const sorted = [...filteredForms].sort((a, b) => {
                    let aValue: any, bValue: any;
                    
                    switch (key) {
                      case 'title':
                        aValue = a.title.toLowerCase();
                        bValue = b.title.toLowerCase();
                        break;
                      case 'userName':
                        aValue = a.userName.toLowerCase();
                        bValue = b.userName.toLowerCase();
                        break;
                      case 'submissions':
                        aValue = a._count.submissions;
                        bValue = b._count.submissions;
                        break;
                      case 'createdAt':
                      default:
                        aValue = new Date(a.createdAt).getTime();
                        bValue = new Date(b.createdAt).getTime();
                        break;
                    }
                    
                    return aValue > bValue ? 1 : -1;
                  });
                  
                  // Update the forms state with sorted data
                  setForms(sorted);
                },
              }}

              actions={{
                onRefresh: fetchForms,
                customActions: (
                  <div className="flex items-center space-x-4">
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
                    <span className="text-sm text-gray-600">
                      {startIndex + 1} to {Math.min(endIndex, filteredForms.length)} of {filteredForms.length} forms
                    </span>
                  </div>
                ),
              }}
              emptyMessage={
                searchTerm || statusFilter !== "all" 
                  ? "No forms match your filters. Try adjusting your search or filter criteria."
                  : "No forms created yet. Start building your first form to see it here."
              }
              showColumnVisibility={true}
              showSearch={true}
              showFilters={false}
              showPagination={true}
              virtualScroll={true}
              maxHeight="600px"
            />
          )}
        </div>

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
