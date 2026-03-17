import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Shield, UserCheck, AlertCircle, MoreVertical, CheckCircle, XCircle, MapPin, Calendar, Phone, FileText, Star, Award, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from 'react-toastify';

export function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");

    // Real DB User Data
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', status: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Mobile Dropdown State
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.action-menu-container')) {
                setActiveDropdown(null);
            }
        };

        if (activeDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    // View Details Modal State
    const [viewingUser, setViewingUser] = useState<any | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close modals on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setViewingUser(null);
                setEditingUser(null);
            }
        };

        if (viewingUser || editingUser) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [viewingUser, editingUser]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setUsers(data);
            } else if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem('crewup_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/admin/login';
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Server error connecting to database');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
                toast.success(`User status changed to ${newStatus}`);
            } else if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem('crewup_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/admin/login';
            } else {
                toast.error('Failed to update status.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server error updating status');
        }
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsSaving(true);
        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
                setEditingUser(null);
                toast.success(`User updated successfully!`);
            } else if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem('crewup_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/admin/login';
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to update user.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server error updating user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewDetails = async (userId: string) => {
        setIsFetchingDetails(true);
        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setViewingUser(data);
            } else if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem('crewup_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/admin/login';
            } else {
                toast.error(data.message || 'Failed to fetch user details.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server error fetching details.');
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you absolutely sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
                toast.success('User permanently deleted.');
            } else if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem('crewup_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/admin/login';
            } else {
                toast.error('Failed to delete user.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server error deleting user');
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

    // Pagination Calculations
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
                    <p className="text-muted-foreground">View, filter, and manage all platform users below.</p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 text-sm md:text-base rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all bg-white hover:bg-gray-50"
                        />
                    </div>
                    {/* Mobile-optimized Filter Tabs */}
                    <div className="flex gap-1.5 md:gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar self-start bg-gray-100 p-1 md:bg-transparent md:p-0 rounded-lg md:rounded-none">
                        {["all", "volunteer", "organizer"].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`flex-1 md:flex-none px-3 md:px-6 py-1.5 md:py-2 rounded-md md:rounded-full capitalize whitespace-nowrap transition-all text-[11px] md:text-sm font-semibold md:font-medium text-center
                                    ${filterRole === role
                                        ? "bg-white md:bg-gradient-to-r md:from-violet-500 md:to-fuchsia-500 text-gray-900 md:text-white shadow-sm md:shadow-md md:shadow-fuchsia-500/20 md:border-transparent"
                                        : "md:bg-white border-transparent md:border-gray-200 text-gray-500 md:text-gray-600 hover:text-gray-700 md:hover:bg-gray-50 bg-transparent"
                                    }`}
                            >
                                {role === 'all' ? 'All' : `${role}s`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Table */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible"
                >
                    {error && <div className="p-4 bg-red-50 text-red-600 font-medium text-center">{error}</div>}
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-400 font-medium">Loading Database Users...</div>
                    ) : (
                        <div className="w-full">
                            <table className="w-full text-left border-collapse block md:table">
                                <thead className="hidden md:table-header-group">
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
                                        <th className="p-4 font-medium pl-6 rounded-tl-3xl">User</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium hidden md:table-cell">Joined</th>
                                        <th className="p-4 font-medium text-right pr-6 rounded-tr-3xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group divide-y divide-gray-100 md:divide-y-0">
                                    {currentUsers.map((user, index) => {
                                        const isLastItems = currentUsers.length > 4 && index >= currentUsers.length - 2;
                                        return (
                                            <tr key={user.id} className="group flex items-center justify-between md:table-row hover:bg-gray-50/50 transition-colors bg-white md:bg-transparent border-b border-gray-100 last:border-none p-4 md:p-0">
                                                <td className="flex-1 min-w-0 md:table-cell p-0 md:p-4 md:pl-6 focus:outline-none">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-gray-900 truncate pr-2 flex items-center gap-2">
                                                                {user.name}
                                                                {/* Mobile-only Role Badge */}
                                                                <span className={`md:hidden shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'Volunteer' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                                                                    }`}>
                                                                    {user.role}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Desktop Role Column (Hidden on Mobile) */}
                                                <td className="hidden md:table-cell p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Volunteer' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                                                        }`}>
                                                        {user.role === 'Volunteer' ? <UserCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                {/* Status Column (Icon only on mobile, full badge on desktop) */}
                                                <td className="shrink-0 md:table-cell p-0 md:p-4 pr-2 md:pr-4 flex items-center">
                                                    {/* Mobile Status Dot */}
                                                    <div className="md:hidden flex items-center justify-center" title={`Status: ${user.status}`}>
                                                        <div className={`w-3 h-3 rounded-full ${user.status === 'Active' ? 'bg-green-500' :
                                                            user.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} />
                                                    </div>
                                                    {/* Desktop Status Badge */}
                                                    <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                        user.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                        {user.status === 'Active' && <CheckCircle className="w-3.5 h-3.5" />}
                                                        {user.status === 'Pending' && <AlertCircle className="w-3.5 h-3.5" />}
                                                        {user.status === 'Suspended' && <XCircle className="w-3.5 h-3.5" />}
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="hidden md:table-cell p-4 text-gray-500">{user.joined}</td>
                                                <td className="shrink-0 md:table-cell p-0 md:p-4 md:pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-1 md:gap-2">
                                                        {/* Quick Actions Hidden on Mobile */}
                                                        <div className="hidden md:flex items-center gap-2">
                                                            {user.status !== 'Active' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(user.id, "Active")}
                                                                    className="text-sm text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                                                >
                                                                    Activate
                                                                </button>
                                                            )}
                                                            {user.status === 'Active' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(user.id, "Suspended")}
                                                                    className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                                >
                                                                    Suspend
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="relative action-menu-container">
                                                            <button
                                                                onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                                className="p-2 md:p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors bg-gray-50 md:bg-transparent"
                                                            >
                                                                <MoreVertical className="w-5 h-5 md:w-5 md:h-5" />
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            <div className={`absolute right-0 md:right-8 w-48 md:w-36 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 transition-all z-[100] ${isLastItems ? 'bottom-full mb-2' : 'top-full mt-2'} ${activeDropdown === user.id ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                                                <div className="py-2">
                                                                    <button
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors border-b border-gray-50 flex items-center justify-between"
                                                                        onClick={() => {
                                                                            handleViewDetails(user.id);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                    >
                                                                        View Details <ChevronRight className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                                                                        onClick={() => {
                                                                            openEditModal(user);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                    >
                                                                        Edit User
                                                                    </button>
                                                                    <button
                                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                        onClick={() => {
                                                                            handleDeleteUser(user.id);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {currentUsers.length === 0 && (
                                        <tr className="block md:table-row">
                                            <td colSpan={5} className="block md:table-cell p-8 text-center text-gray-500">
                                                No users found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
                                    <div className="text-sm text-gray-500 font-medium">
                                        Showing <span className="text-gray-900">{indexOfFirstUser + 1}</span> to <span className="text-gray-900">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="text-gray-900">{filteredUsers.length}</span> users
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${currentPage === page
                                                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div >

            {/* Edit User Modal */}
            {
                editingUser && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setEditingUser(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl md:rounded-3xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">Edit User</h2>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XCircle className="w-5 h-5 md:w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEditUser} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
                                        >
                                            <option value="Volunteer">Volunteer</option>
                                            <option value="Organizer">Organizer</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 p-6 bg-gray-50/50">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium shadow-md shadow-fuchsia-500/20 hover:shadow-lg disabled:opacity-70 transition-all"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }

            {/* View Details Modal */}
            <AnimatePresence>
                {viewingUser && (
                    <div
                        className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center p-4 pt-10 md:p-6 pb-28 md:pb-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
                        onClick={() => setViewingUser(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-none md:max-h-[95vh] flex flex-col my-auto md:my-0 shrink-0 overflow-hidden"
                        >
                            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white relative shrink-0">
                                <div className="flex gap-3 md:gap-4 items-center relative z-10 w-full pr-8">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center text-xl md:text-2xl font-bold shadow-inner overflow-hidden shrink-0">
                                        {viewingUser.volunteerDetails?.profilePhoto ? (
                                            <img src={`http://${window.location.hostname}:3000${viewingUser.volunteerDetails.profilePhoto}`} className="w-full h-full object-cover" alt="Avatar" />
                                        ) : (
                                            viewingUser.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl md:text-2xl font-extrabold truncate">{viewingUser.name}</h2>
                                        <div className="flex flex-wrap gap-1.5 md:gap-2 items-center text-xs md:text-sm font-medium text-white/90">
                                            <span className="truncate max-w-full">{viewingUser.email}</span>
                                            <span className="hidden md:inline opacity-50">•</span>
                                            <span className="uppercase tracking-wider text-[10px] md:text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">{viewingUser.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingUser(null)}
                                    className="absolute top-4 right-4 md:static md:p-2 text-white/70 hover:text-white md:hover:bg-white/20 rounded-full transition-colors z-20"
                                >
                                    <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                            </div>

                            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
                                {/* Base Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</div>
                                        <div className={`font-bold ${viewingUser.status === 'Active' ? 'text-green-600' : viewingUser.status === 'Suspended' ? 'text-red-600' : 'text-yellow-600'}`}>{viewingUser.status}</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Joined</div>
                                        <div className="font-bold text-gray-900">{viewingUser.joined}</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Profile Setup</div>
                                        <div className="font-bold text-gray-900">{viewingUser.hasCompletedProfile ? 'Complete' : 'Pending'}</div>
                                    </div>
                                    {viewingUser.volunteerDetails && (
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">XP Level</div>
                                            <div className="font-bold text-violet-600">Lv {viewingUser.volunteerDetails.level}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Deep Volunteer Metrics */}
                                {viewingUser.volunteerDetails ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-500" /> Biography</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed bg-white p-4 rounded-2xl border border-gray-100">{viewingUser.volunteerDetails.bio}</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center gap-3 mb-2 text-gray-700">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium">{viewingUser.volunteerDetails.city}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mb-2 text-gray-700">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium">{viewingUser.volunteerDetails.phone || "Not Provided"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium">{viewingUser.volunteerDetails.dob}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Availability</h4>
                                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-2">
                                                        <span className="text-sm font-bold text-gray-700">Schedule</span>
                                                        <span className="text-sm font-medium text-violet-600">{viewingUser.volunteerDetails.availability}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                        <span className="text-sm font-bold text-gray-700">Environment</span>
                                                        <span className="text-sm font-medium text-fuchsia-600 capitalize">{viewingUser.volunteerDetails.preferredVolunteeringType}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-white p-4 rounded-2xl border border-gray-100 h-full">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Tracked Skills</h4>
                                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                                        {viewingUser.volunteerDetails.skills.map((skill: string, i: number) => (
                                                            <span key={i} className="bg-fuchsia-50 text-fuchsia-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-fuchsia-100">{skill}</span>
                                                        ))}
                                                    </div>

                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Causes & Interests</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {viewingUser.volunteerDetails.interests.map((interest: string, i: number) => (
                                                            <span key={i} className="bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-violet-100">{interest}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Shield className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Extended Profile</h3>
                                        <p className="text-gray-500 text-sm max-w-sm">This user is an {viewingUser.role} and does not have an extended Volunteer metrics profile attached to their identity.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
