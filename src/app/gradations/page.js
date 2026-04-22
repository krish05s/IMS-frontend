"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";

export default function Gradations() {
  useRoleCheck(["admin"]);
  const [gradations, setGradations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGradation, setCurrentGradation] = useState(null);
  const [formData, setFormData] = useState({ gradationName: "", thickness: "" });

  const fetchGradations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/gradation/read", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setGradations(data.data);
      }
    } catch (error) {
      console.error("Error fetching gradations:", error);
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
    const combinedGradation = `${formData.gradationName} ${formData.thickness}`.trim();
    const payload = { gradation: combinedGradation };

    const url = currentGradation
      ? `http://localhost:5000/api/gradation/update/${currentGradation.id}`
      : "http://localhost:5000/api/gradation/create";
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
        fetchGradations();
        handleCloseModal();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving gradation:", error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await fetch(`http://localhost:5000/api/gradation/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchGradations();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-auto">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gradations</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and organize product gradations</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
          >
            + Add Gradation
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold">ID</th>
                <th className="py-4 px-6 font-semibold">Gradation Name</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gradations.map((g, index) => (
                <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-slate-600 font-medium">{index + 1}</td>
                  <td className="py-4 px-6 text-slate-800 font-medium">{g.gradation}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(g.id, g.status)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        g.status === 1 ? "bg-green-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          g.status === 1 ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenModal(g)}
                      className="text-orange-500 hover:text-orange-600 font-medium mr-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {gradations.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No gradations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {currentGradation ? "Edit Gradation" : "Add Gradation"}
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gradation Name</label>
                  <input
                    type="text"
                    required
                    value={formData.gradationName}
                    onChange={(e) => setFormData({ ...formData, gradationName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 bg-slate-50"
                    placeholder="e.g. SF"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thickness</label>
                  <input
                    type="text"
                    required
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 bg-slate-50"
                    placeholder="e.g. 1mm"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
                  >
                    Save
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
