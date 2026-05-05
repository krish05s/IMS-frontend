"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import { toast } from "react-toastify";
import Topbar from "../components/Topbar";
export default function Gradations() {
  useRoleCheck(["admin"]);
  const [gradations, setGradations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGradation, setCurrentGradation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ gradation: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    gradationName: "",
    thickness: "",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  // const [addModal, setAddModal] = useState(false);  // 👈 aa add karo

  const fetchGradations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/read`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setGradations(data.data);
      }
    } catch (error) {
      console.error("Error fetching gradations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradations();
  }, []);

  const handleOpenModal = (gradation = null) => {
    setCurrentGradation(gradation);
    if (gradation) {
      const parts = gradation.gradation.trim().split(" ");
      const thickness = parts.length > 1 ? parts.pop() : "";
      const gradationName = parts.join(" ");
      setFormData({ gradationName, thickness });
    } else {
      setFormData({ gradationName: "", thickness: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGradation(null);
    setFormData({ gradationName: "", thickness: "" });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // 👈 start spinner
    const combinedGradation =
      `${formData.gradationName} ${formData.thickness}`.trim();
    const payload = { gradation: combinedGradation };

    const url = currentGradation
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/update/${currentGradation.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/create`;
    const method = currentGradation ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(
          currentGradation
            ? "Gradation updated successfully!"
            : "Gradation added successfully!",
        );
        fetchGradations();
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving gradation:", error);
      toast.error("Failed to save gradation");
    } finally {
      setIsSaving(false); // 👈 stop spinner
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const combinedGradation =
  //     `${formData.gradationName} ${formData.thickness}`.trim();
  //   const payload = { gradation: combinedGradation };

  //   const url = currentGradation
  //     ? `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/update/${currentGradation.id}`
  //     : `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/create`;
  //   const method = currentGradation ? "PUT" : "POST";

  //   try {
  //     const response = await fetch(url, {
  //       method,
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //     const data = await response.json();
  //     if (data.success) {
  //       toast.success(
  //         currentGradation
  //           ? "Gradation updated successfully!"
  //           : "Gradation added successfully!",
  //       );
  //       fetchGradations();
  //       handleCloseModal();
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error saving gradation:", error);
  //     toast.error("Failed to save gradation");
  //   }
  // };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success(
          newStatus === 1 ? "Gradation activated!" : "Gradation deactivated!",
        );
        fetchGradations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredGradations = gradations.filter((g) =>
    g.gradation.toLowerCase().includes(filters.gradation.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentGradations = filteredGradations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    filteredGradations.length / itemsPerPage
  );

  const getSlidingPages = () => {
    const visibleCount = 5;

    // ✅ If total pages less than visible count
    if (totalPages <= visibleCount) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = currentPage - Math.floor(visibleCount / 2);
    let end = currentPage + Math.floor(visibleCount / 2);

    if (start < 1) {
      start = 1;
      end = visibleCount;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - visibleCount + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] flex">
      <Sidebar />
      <div className="flex-1 md:ml-64  overflow-x-auto scrollbar-hide">
        {/* <Topbar /> */}
        <Topbar
          actions={
            <button
              onClick={() => {
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl shadow-md whitespace-nowrap"
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
              Add Gradation
            </button>
          }
        />
        <div className="p-4 md:p-8 topbar-offset mt-4">
         
            <>
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
                <input
                  type="text"
                  placeholder="Filter by Gradation Name..."
                  value={filters.gradation}
                  onChange={(e) =>
                    setFilters({ ...filters, gradation: e.target.value })
                  }
                  className="w-full md:w-1/3 px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 font-semibold whitespace-nowrap">
                          ID
                        </th>
                        <th className="py-3 px-4 font-semibold whitespace-nowrap">
                          Gradation Name
                        </th>
                        <th className="py-3 px-4 font-semibold whitespace-nowrap">
                          Status
                        </th>
                        <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGradations.map((g, index) => (
                        <tr
                          key={g.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                        >
                          <td className="py-1.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="py-1.5 px-4 text-slate-800 font-medium">
                            {g.gradation}
                          </td>
                          <td className="py-1.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(g.id, g.status)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${g.status === 1 ? "bg-green-500" : "bg-slate-300"
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${g.status === 1
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                  }`}
                              />
                            </button>
                          </td>
                          <td className="py-1.5 px-4 text-right whitespace-nowrap">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleOpenModal(g)}
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
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentGradations.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-8 text-center text-slate-500"
                          >
                            No gradations found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white border-t border-slate-200 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      Rows per page:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {/* Prev */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors"
                      >
                        &lt;
                      </button>

                      {/* Sliding Pages */}
                      {getSlidingPages().map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === page
                            ? "bg-[#212121] text-white"
                            : "border border-slate-200 text-slate-600"
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Next */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
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
          

          {/* edit add model */}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#212121] to-[#555555]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>

                    <h2 className="text-base font-semibold text-white">
                      {currentGradation ? "Edit Gradation" : "Add Gradation"}
                    </h2>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white transition"
                  >
                    ✕
                  </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Gradation Name
                    </label>
<<<<<<< Updated upstream
                    <input
                      type="text"
                      required
                      value={formData.gradationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gradationName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D2A185] bg-white focus:outline-none"
                    />
=======
                 <input
  type="text"
  required
  value={formData.gradationName}
  onChange={(e) =>
    setFormData({ ...formData, gradationName: e.target.value })
  }
  placeholder="Enter gradation name"
  className="w-full px-4 py-2.5 rounded-xl border border-[#D2A185] bg-white focus:outline-none text-black placeholder-slate-400"
/>
>>>>>>> Stashed changes
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Thickness
                    </label>
                   <input
  type="text"
  required
  value={formData.thickness}
  onChange={(e) =>
    setFormData({ ...formData, thickness: e.target.value })
  }
  placeholder="Enter thickness"
  className="w-full px-4 py-2.5 rounded-xl border border-[#D2A185] bg-white focus:outline-none text-black placeholder-slate-400"
/>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl hover:bg-[#444] flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
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
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                   
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
