"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import TruckLoader from "../components/TruckLoader";
import { toast } from "react-toastify";

function Members() {
  useRoleCheck(["admin"]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Modal State
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addUser, setAddUser] = useState({
    name: "", email: "", mobile: "", date_of_birth: "", password: "", role: "user",
  });

  // Edit Modal State
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState({ name: "", email: "", role: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/user`;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/read`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else setError(data.message);
    } catch {
      setError("Server સાથે connection નથી");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  // ── Add User ──
  const handleAddChange = (e) => {
    setAddUser({ ...addUser, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addUser),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New user successfully added! ✅");
        setAddModal(false);
        setAddUser({ name: "", email: "", mobile: "", date_of_birth: "", password: "", role: "user" });
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Add failed");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Toggle Status ──
  const handleToggleStatus = async (user) => {
    const newStatus = user.status == 1 ? 0 : 1;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/update/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newStatus === 1 ? `${user.name} Active ✅` : `${user.name} Inactive ⛔`);
        fetchUsers();
      } else toast.error(data.message);
    } catch {
      toast.error("Status update failed");
    }
  };

  const openEdit = (user) => {
    setEditUser({ ...user, password: "" });
    setShowPassword(false);
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { status, ...payload } = editUser;
      if (!payload.password || payload.password.trim() === "") delete payload.password;
      const res = await fetch(`${API_BASE}/update/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated successfully!");
        setEditModal(false);
        fetchUsers();
      } else toast.error(data.message);
    } catch {
      toast.error("Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (user) => {
    setDeleteUser(user);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/delete/${deleteUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User deleted successfully!");
        setDeleteModal(false);
        fetchUsers();
      } else toast.error(data.message);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reusable input class
  const inputCls = "w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition placeholder:text-slate-400";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(filters.name.toLowerCase()) &&
    u.email?.toLowerCase().includes(filters.email.toLowerCase()) &&
    u.role?.toLowerCase().includes(filters.role.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-auto scrollbar-hide">
        {loading ? (
          <TruckLoader />
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Members</h1>
                {/* <p className="text-sm text-slate-500 mt-1">All users list</p> */}
              </div>
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => { setAddModal(true); setShowAddPassword(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-200 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Member
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
              <input type="text" placeholder="Filter by Name..." value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              <input type="text" placeholder="Filter by Email..." value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              <input type="text" placeholder="Filter by Role..." value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      {["#", "Name", "Email", "Mobile", "Role", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs whitespace-nowrap">{indexOfFirstItem + idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex items-center justify-center uppercase">
                              {user.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{user.email}</td>
                        <td className="px-5 py-4 text-slate-500">{user.mobile}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${user.status == 1 ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                              <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${user.status == 1 ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                            <span className={`text-xs font-semibold ${user.status == 1 ? "text-emerald-600" : "text-slate-400"}`}>
                              {user.status == 1 ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(user)} title="Edit" className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => openDelete(user)} title="Delete" className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-16 text-slate-400">No users found</div>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white border-t border-slate-200 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Rows per page:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      &lt;
                    </button>
                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === i + 1 ? "bg-emerald-500 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      &gt;
                    </button>
                  </div>
                )}
            </div>
          </div>
        </>
        )}
      </div>

      {/* ═══════════ ADD MODAL ═══════════ */}
      {addModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-white">Add New Member</h2>
              </div>
              <button onClick={() => setAddModal(false)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name <span className="text-rose-400">*</span></label>
                  <input type="text" name="name" value={addUser.name} onChange={handleAddChange} required placeholder="Full name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email <span className="text-rose-400">*</span></label>
                  <input type="email" name="email" value={addUser.email} onChange={handleAddChange} required placeholder="email@example.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mobile <span className="text-rose-400">*</span></label>
                  <input type="text" name="mobile" value={addUser.mobile} onChange={handleAddChange} required placeholder="9876543210" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={addUser.date_of_birth} onChange={handleAddChange} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Role</label>
                  <select name="role" value={addUser.role} onChange={handleAddChange} className={inputCls}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelCls}>Password <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    name="password"
                    value={addUser.password}
                    onChange={handleAddChange}
                    required
                    placeholder="Enter password..."
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                    {showAddPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                💡 <span className="text-rose-400 font-semibold">*</span> marked fields are required. New user will be Active by default.
              </p>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center gap-2 shadow-md shadow-emerald-200">
                  {addLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {addLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ EDIT MODAL ═══════════ */}
      {editModal && editUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm uppercase">
                  {editUser.name?.charAt(0)}
                </div>
                <h2 className="text-base font-semibold text-white">Edit Member</h2>
              </div>
              <button onClick={() => setEditModal(false)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name</label>
                  <input type="text" name="name" value={editUser.name || ""} onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" name="email" value={editUser.email || ""} onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mobile</label>
                  <input type="text" name="mobile" value={editUser.mobile || ""} onChange={handleEditChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={editUser.date_of_birth?.split("T")[0] || ""} onChange={handleEditChange} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Role</label>
                  <select name="role" value={editUser.role || "user"} onChange={handleEditChange} className={inputCls}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Password <span className="text-slate-400 font-normal text-xs">(leave blank to keep unchanged)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={editUser.password || ""}
                    onChange={handleEditChange}
                    placeholder="Enter new password..."
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                💡 Change <span className="font-semibold text-slate-500">Status</span> from the toggle button in the table.
              </p>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setEditModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center gap-2 shadow-md shadow-emerald-200">
                  {editLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ DELETE MODAL ═══════════ */}
      {deleteModal && deleteUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-500 px-6 py-5 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Delete User</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">{deleteUser.name}</span>?
                <br />
                <span className="text-rose-400 text-xs">This action cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-rose-200">
                  {deleteLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Members;