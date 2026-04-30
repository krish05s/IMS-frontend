"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import useRoleCheck from "../../hooks/useRoleCheck";
import TruckLoader from "../../components/TruckLoader";
import { toast } from "react-toastify";
import Topbar from "../../components/Topbar";

export default function SetupParties() {
  useRoleCheck(["admin"]); // Only admin can access setup

  const [activeTab, setActiveTab] = useState("purchase"); // "purchase" or "sales"
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState(null);
  const [partyToDelete, setPartyToDelete] = useState(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const fetchParties = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/party/read?type=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setParties(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
      toast.error("Failed to load parties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [activeTab]);

  const handleOpenModal = (party = null) => {
    if (party) {
      setCurrentPartyId(party.id);
      setFormData({
        name: party.name,
        phone: party.phone || "",
        address: party.address || "",
      });
    } else {
      setCurrentPartyId(null);
      setFormData({ name: "", phone: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPartyId(null);
    setFormData({ name: "", phone: "", address: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = { ...formData, type: activeTab };
      const url = currentPartyId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/party/update/${currentPartyId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/party/create`;
      const method = currentPartyId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          currentPartyId
            ? "Party updated successfully!"
            : "Party added successfully!",
        );
        fetchParties();
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving party:", error);
      toast.error("Failed to save party.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (party) => {
    setPartyToDelete(party);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!partyToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/party/delete/${partyToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Party deleted successfully!");
        fetchParties();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Error deleting party:", e);
      toast.error("Failed to delete party.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPartyToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 overflow-x-auto scrollbar-hide">
        {/* <Topbar /> */}
        <Topbar
          actions={
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap"
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
              Add {activeTab === "purchase" ? "Supplier" : "Customer"}
            </button>
          }
        />
        <div className="p-4 md:p-8 topbar-offset mt-4">
          {/* 
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Party Setup</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            Add {activeTab === "purchase" ? "Supplier" : "Customer"}
          </button>
        </div> */}

          {/* Custom Tab Switcher */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-6 inline-flex w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("purchase")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "purchase"
                  ? "bg-[#212121] text-white "
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Purchase Party
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "sales"
                  ? "bg-[#212121] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sales Party
            </button>
          </div>

          {loading ? (
            <TruckLoader />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-w-full overflow-hidden flex flex-col">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 font-semibold w-16 text-center whitespace-nowrap">
                        ID
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Name
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Phone
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Address
                      </th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((p, index) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                      >
                        <td className="py-3 px-4 text-center text-slate-600 font-medium whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-bold">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {p.phone || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                          {p.address || "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(p)}
                              title="Edit"
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
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
                              onClick={() => confirmDelete(p)}
                              title="Delete"
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {parties.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 text-center text-slate-500"
                        >
                          No{" "}
                          {activeTab === "purchase" ? "suppliers" : "customers"}{" "}
                          found. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
              <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  {currentPartyId ? "Edit" : "Add"}{" "}
                  {activeTab === "purchase" ? "Supplier" : "Customer"}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                      placeholder="e.g. +1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white resize-none"
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#212121] text-white px-6 py-2.5 rounded-lg font-bold  transition  flex items-center"
                    >
                      {isSubmitting && (
                        <svg
                          className="animate-spin h-4 w-4 mr-2 inline"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                      )}
                      {isSubmitting
                        ? "Saving..."
                        : currentPartyId
                          ? "Update"
                          : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Delete {activeTab === "purchase" ? "Supplier" : "Customer"}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Are you sure you want to delete{" "}
                  <strong>{partyToDelete?.name}</strong>? This action cannot be
                  undone.
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold transition disabled:opacity-50 w-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg bg-[#212121] text-white font-bold  transition  disabled:opacity-70 flex items-center justify-center w-full"
                  >
                    {isDeleting && (
                      <svg
                        className="animate-spin h-4 w-4 mr-2 inline"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                    )}
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
