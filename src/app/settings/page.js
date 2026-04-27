"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import TruckLoader from "../components/TruckLoader";

export default function Settings() {
  useRoleCheck(["admin"]);
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({ vehicle_no: "", owner_name: "", status: 1 });

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle/read`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenModal = (vehicle = null) => {
    setCurrentVehicle(vehicle);
    setFormData(vehicle ? { vehicle_no: vehicle.vehicle_no, owner_name: vehicle.owner_name, status: vehicle.status } : { vehicle_no: "", owner_name: "", status: 1 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVehicle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentVehicle
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle/update/${encodeURIComponent(currentVehicle.vehicle_no)}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle/create`;
    const method = currentVehicle ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        fetchVehicles();
        handleCloseModal();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error saving vehicle details:", err);
    }
  };

  const handleToggle = async (vehicle) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle/update/${encodeURIComponent(vehicle.vehicle_no)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...vehicle, status: vehicle.status === 1 ? 0 : 1 })
      });
      const data = await response.json();
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error toggling vehicle:", err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-auto scrollbar-hide">
        {loading ? (
          <TruckLoader />
        ) : (
          <>
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Setup & Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage system configurations and data</p>
              </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicles Card container (can add more cards here like Company Info, etc) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Vehicles Directory</h2>
              <button onClick={() => handleOpenModal()} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20">
                + Add Vehicle
              </button>
            </div>
            <div className="p-0 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/50 text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-3 px-5 font-semibold whitespace-nowrap">Vehicle No</th>
                    <th className="py-3 px-5 font-semibold whitespace-nowrap">Owner Name</th>
                    <th className="py-3 px-5 font-semibold text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-5 font-semibold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVehicles.map((v) => (
                    <tr key={v.vehicle_no} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-5 font-medium text-slate-800 uppercase whitespace-nowrap">{v.vehicle_no}</td>
                      <td className="py-3 px-5 text-slate-600">{v.owner_name}</td>
                      <td className="py-3 px-5 text-center">
                        <button onClick={() => handleToggle(v)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${Number(v.status) === 1 ? 'bg-green-500' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${Number(v.status) === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleOpenModal(v)}
                            title="Edit"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && (
                    <tr><td colSpan="4" className="py-6 text-center text-slate-400">No vehicles saved yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col px-6 py-4 bg-white border-t border-slate-200">
              {totalPages > 1 && (
                <div className="flex justify-between items-center w-full">
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
        </div>
        </>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{currentVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle_no}
                    disabled={!!currentVehicle} // do not allow editing PK
                    onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="statusToggle"
                    checked={Number(formData.status) === 1}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-orange-500"
                  />
                  <label htmlFor="statusToggle" className="text-sm font-medium text-slate-700">Active Status</label>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition">
                    Cancel
                  </button>
                  <button type="submit" className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20">
                    Save Vehicle
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
