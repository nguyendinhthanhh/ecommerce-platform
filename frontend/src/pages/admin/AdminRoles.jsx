import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { TableRowSkeleton } from "../../components/common/LoadingSpinner";
import roleService from "../../services/roleService";

const AdminRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // Toast notification
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const loadData = useCallback(async () => {
        const isInitial = roles.length === 0;
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const rolesData = await roleService.getAllRoles();
            setRoles(rolesData.data || []);
        } catch (error) {
            console.error("Error loading roles:", error);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [roles.length]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetFormData = () => {
        setFormData({
            name: "",
            description: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setSaving(true);
            await roleService.createRole(formData);
            showToast("Role created successfully!");
            setShowCreateModal(false);
            resetFormData();
            loadData();
        } catch (error) {
            console.error("Error creating role:", error);
            showToast(
                error.response?.data?.message || "Failed to create role",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            await roleService.updateRole(selectedRole.id, {
                description: formData.description,
            });
            showToast("Role updated successfully!");
            setShowEditModal(false);
            resetFormData();
            setSelectedRole(null);
            loadData();
        } catch (error) {
            console.error("Error updating role:", error);
            showToast(
                error.response?.data?.message || "Failed to update role",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        try {
            setSaving(true);
            await roleService.deleteRole(selectedRole.id);
            showToast("Role deleted successfully!");
            setShowDeleteModal(false);
            setSelectedRole(null);
            loadData();
        } catch (error) {
            console.error("Error deleting role:", error);
            showToast(
                error.response?.data?.message || "Failed to delete role",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || "",
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (role) => {
        setSelectedRole(role);
        setShowDeleteModal(true);
    };

    const isSystemRole = (roleName) => {
        return ["ADMIN", "STAFF", "CUSTOMER"].includes(roleName);
    };

    return (
        <AdminLayout>
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Roles & Permissions
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Manage system roles and access rights
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                resetFormData();
                                setShowCreateModal(true);
                            }}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                add_moderator
                            </span>
                            Create Role
                        </button>

                        <button
                            onClick={() => {
                                roleService.getAllRoles(); // Just to refresh cache/trigger effect eventually if we manually managed it
                                loadData();
                            }}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            <span
                                className={`material-symbols-outlined text-[18px] ${loading || refreshing ? "animate-spin" : ""
                                    }`}
                            >
                                refresh
                            </span>
                            {loading || refreshing ? "Loading..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse"
                            >
                                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        ))
                        : roles.map((role) => (
                            <div
                                key={role.id}
                                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {role.name}
                                            {isSystemRole(role.name) && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">
                                                    System
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {role.description || "No description"}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">
                                            {role.name === "ADMIN"
                                                ? "verified_user"
                                                : role.name === "STAFF"
                                                    ? "support_agent"
                                                    : "person"}
                                        </span>
                                    </div>
                                </div>



                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEditClick(role)}
                                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    >
                                        Edit Role
                                    </button>
                                    {!isSystemRole(role.name) && (
                                        <button
                                            onClick={() => handleDeleteClick(role)}
                                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>

                {/* Create/Edit Modal */}
                {
                    (showCreateModal || showEditModal) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                }}
                            ></div>
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
                                {/* Modal Header */}
                                <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold">
                                            {showCreateModal ? "Create Role" : "Edit Role"}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setShowEditModal(false);
                                            }}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-slate-400">
                                                close
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <form
                                    onSubmit={showCreateModal ? handleCreateRole : handleUpdateRole}
                                    className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]"
                                >
                                    <div className="space-y-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Role Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={showEditModal} // Name immutable on edit for simplicity/safety
                                                className={`w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${showEditModal ? "opacity-60 cursor-not-allowed" : ""
                                                    }`}
                                                placeholder="e.g., MANAGER"
                                            />
                                            {showEditModal && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Role name cannot be changed.
                                                </p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                placeholder="Role description..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setShowEditModal(false);
                                            }}
                                            className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {saving && (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            )}
                                            {showCreateModal ? "Create Role" : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Delete Confirmation Modal */}
                {
                    showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setShowDeleteModal(false)}
                            ></div>
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">
                                            warning
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Delete Role?
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                            Are you sure you want to delete the role{" "}
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {selectedRole?.name}
                                            </span>
                                            ? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex w-full gap-3 mt-2">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteRole}
                                            disabled={saving}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving && (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Toast Notification */}
                {
                    toast.show && (
                        <div
                            className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 z-[60] flex items-center gap-3 ${toast.type === "error"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-green-50 text-green-600 border border-green-200"
                                }`}
                        >
                            <span className="material-symbols-outlined">
                                {toast.type === "error" ? "error" : "check_circle"}
                            </span>
                            <span className="font-medium">{toast.message}</span>
                        </div>
                    )
                }
            </div >
        </AdminLayout >
    );
};

export default AdminRoles;
