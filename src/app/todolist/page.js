"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Header from "../components/Sidebar";
import { toast } from "react-toastify";
import Link from "next/link";
import Topbar from "../components/Topbar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const API_base = `${API_BASE}/api/todos`;

export default function Page() {
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState({ id: null, title: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const router = useRouter();

  // Helper to get axios config with JWT
  const getConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // Redirect if no token
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch all todos
  const fetchTodos = useCallback(async () => {
    try {
      const config = getConfig();
      if (!config) return;

      const res = await axios.get(`${API_base}/read`, config);
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Open modal for add/edit
  const openModal = (todo = null) => {
    if (todo) {
      setIsEditing(true);
      setCurrentTodo({ id: todo.id, title: todo.title });
    } else {
      setIsEditing(false);
      setCurrentTodo({ id: null, title: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Add or update todo
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentTodo.title.trim()) return;

    try {
      setIsSubmitting(true); // ✅ START

      const config = getConfig();
      if (!config) return;

      if (isEditing) {
        await axios.put(
          `${API_base}/update/${currentTodo.id}`,
          { title: currentTodo.title },
          config,
        );
      } else {
        await axios.post(
          `${API_base}/insert`,
          { title: currentTodo.title },
          config,
        );
      }

      closeModal();
      fetchTodos();
    } catch (err) {
      console.error("Error saving todo:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setIsSubmitting(false); // ✅ STOP
    }
  };

  // Toggle finish/unfinish
  const handleToggle = async (id) => {
    try {
      const config = getConfig();
      if (!config) return;

      await axios.put(`${API_base}/finish/${id}`, {}, config);
      fetchTodos();
    } catch (err) {
      console.error("Error toggling todo:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  // Delete todo
  const handleDelete = async (id) => {
    // const confirmed = await Swal.fire({
    //   title: "Are you sure you want to delete this task?",
    //   showCancelButton: true,
    //   confirmButtonText: "Yes",
    //   cancelButtonText: "No",
    // }).then((result) => result.isConfirmed);

    const confirmed = await Swal.fire({
      html: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:12px; padding: 8px 0">
      <div style="width:56px; height:56px; background:#e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center;">
        <svg width="28" height="28" fill="none" stroke="#475569" stroke-width="1.8" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </div>
      <p style="font-size:17px; font-weight:600; color:#1f2937; margin:0;">Delete Task?</p>
      <p style="font-size:13px; color:#9ca3af; margin:0;">This action cannot be undone.</p>
    </div>
  `,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "swal-todo-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
        actions: "swal-actions",
      },
      didOpen: () => {
        const style = document.createElement("style");
        style.innerHTML = `
      .swal-todo-popup { border-radius: 20px !important; padding: 28px 24px !important; width: 340px !important; box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; }
      .swal-actions { gap: 10px !important; margin-top: 20px !important; }
      .swal-confirm-btn {
  background: #0f172a;
  color: white;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.swal-confirm-btn:hover {
  background: #1e293b;
}

.swal-cancel-btn {
  background: #e2e8f0;
  color: #475569;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.swal-cancel-btn:hover {
  background: #cbd5e1;
}
    `;
        document.head.appendChild(style);
      },
    }).then((result) => result.isConfirmed);

    if (!confirmed) return;

    try {
      const config = getConfig();
      if (!config) return;

      await axios.delete(`${API_base}/delete/${id}`, config);
      fetchTodos();
    } catch (err) {
      console.error("Error deleting todo:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  const unfinished = todos.filter((t) => !t.is_finished);
  const finished = todos.filter((t) => t.is_finished);

  const formatTime = (dateString) => {
    const localDate = new Date(dateString);
    return localDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex">
      <Header />

      <div className="flex-1 md:ml-64 overflow-x-auto scrollbar-hide">

        {/* <Topbar /> */}
        <Topbar
          actions={
            <button
              onClick={() => {
                openModal();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all  cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add To DO
            </button>
          }
        />

        {/* Topbar */}


        <div className="p-6 mt-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>

                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Pending Tasks
                  </h2>
                </div>

                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">
                  {unfinished.length}
                </span>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {unfinished.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <svg
                      className="w-12 h-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                      />
                    </svg>

                    <p className="text-sm font-medium">
                      No pending tasks
                    </p>
                  </div>
                ) : (
                  unfinished.map((t) => (
                    <div
                      key={t.id}
                      className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={t.is_finished}
                            onChange={() => handleToggle(t.id)}
                            className="w-4 h-4 mt-1 accent-indigo-600 cursor-pointer"
                          />

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                              {t.title}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(t.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 transition-all">
                          <button
                            onClick={() => openModal(t)}
                            className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(t.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>

                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Completed Tasks
                  </h2>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg">
                  {finished.length}
                </span>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {finished.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <svg
                      className="w-12 h-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>

                    <p className="text-sm font-medium">
                      No completed tasks
                    </p>
                  </div>
                ) : (
                  finished.map((t) => (
                    <div
                      key={t.id}
                      className="group bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100 rounded-2xl p-4 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={t.is_finished}
                            onChange={() => handleToggle(t.id)}
                            className="w-4 h-4 mt-1 accent-emerald-600 cursor-pointer"
                          />

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-400 line-through">
                              {t.title}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(t.created_at)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(t.id)}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                              />
                            </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#212121] to-[#555555]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
                      />
                    </svg>
                  </div>

                  <h2 className="text-base font-semibold text-white">
                    {isEditing ? "Edit Todo" : "Add Todo"}
                  </h2>
                </div>

                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Todo Title
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Enter task title..."
                    value={currentTodo.title}
                    onChange={(e) =>
                      setCurrentTodo({
                        ...currentTodo,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:outline-none text-sm text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer
                    ${isSubmitting
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                      }
                  `}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            opacity="0.25"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>

                        Saving...
                      </>
                    ) : isEditing ? (
                      "Update"
                    ) : (
                      "Save Todo"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
