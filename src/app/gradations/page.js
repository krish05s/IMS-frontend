// "use client";
// import { useState, useEffect } from "react";
// import Sidebar from "../components/Sidebar";
// import useRoleCheck from "../hooks/useRoleCheck";
// import TruckLoader from "../components/TruckLoader";

// export default function Gradations() {
//   useRoleCheck(["admin"]);
//   const [gradations, setGradations] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentGradation, setCurrentGradation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({ gradationName: "", thickness: "" });

//   const fetchGradations = async () => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gradation/read`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       const data = await response.json();
//       if (data.success) {
//         setGradations(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching gradations:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchGradations();
//   }, []);

//   const handleOpenModal = (gradation = null) => {
//     setCurrentGradation(gradation);
//     if (gradation) {
//       const parts = gradation.gradation.trim().split(" ");
//       const thickness = parts.length > 1 ? parts.pop() : "";
//       const gradationName = parts.join(" ");
//       setFormData({ gradationName, thickness });
//     } else {
//       setFormData({ gradationName: "", thickness: "" });
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setCurrentGradation(null);
//     setFormData({ gradationName: "", thickness: "" });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const combinedGradation = `${formData.gradationName} ${formData.thickness}`.trim();
//     const payload = { gradation: combinedGradation };

//     const url = currentGradation
//       ? `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/update/${currentGradation.id}`
//       : `${process.env.NEXT_PUBLIC_API_URL}/api/gradation/create`;
//     const method = currentGradation ? "PUT" : "POST";

//     try {
//       const response = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       const data = await response.json();
//       if (data.success) {
//         fetchGradations();
//         handleCloseModal();
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       console.error("Error saving gradation:", error);
//     }
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       const newStatus = currentStatus === 1 ? 0 : 1;
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gradation/status/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         fetchGradations();
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       console.error("Error toggling status:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f1f1f1] flex">
//       <Sidebar />
//       <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-auto">
//         {loading ? (
//           <TruckLoader />
//         ) : (
//           <>
//             <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
//               <div>
//                 <h1 className="text-2xl font-bold text-slate-800">Gradations</h1>
//                 <p className="text-sm text-slate-500 mt-1">Manage and organize product gradations</p>
//               </div>
//           <button
//             onClick={() => handleOpenModal()}
//             className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
//           >
//             + Add Gradation
//           </button>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
//               <tr>
//                 <th className="py-4 px-6 font-semibold">ID</th>
//                 <th className="py-4 px-6 font-semibold">Gradation Name</th>
//                 <th className="py-4 px-6 font-semibold">Status</th>
//                 <th className="py-4 px-6 font-semibold text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {gradations.map((g, index) => (
//                 <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
//                   <td className="py-4 px-6 text-slate-600 font-medium">{index + 1}</td>
//                   <td className="py-4 px-6 text-slate-800 font-medium">{g.gradation}</td>
//                   <td className="py-4 px-6">
//                     <button
//                       onClick={() => handleToggleStatus(g.id, g.status)}
//                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${g.status === 1 ? "bg-green-500" : "bg-slate-300"
//                         }`}
//                     >
//                       <span
//                         className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${g.status === 1 ? "translate-x-6" : "translate-x-1"
//                           }`}
//                       />
//                     </button>
//                   </td>
//                   <td className="py-4 px-6 text-right">
//                     <button
//                       onClick={() => handleOpenModal(g)}
//                       className="text-orange-500 hover:text-orange-600 font-medium mr-4"
//                     >
//                       Edit
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {gradations.length === 0 && (
//                 <tr>
//                   <td colSpan="4" className="py-8 text-center text-slate-500">
//                     No gradations found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         </>
//         )}

//         {/* Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]">
//             <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-slate-200">
//               <h2 className="text-xl font-bold text-slate-800 mb-6">
//                 {currentGradation ? "Edit Gradation" : "Add Gradation"}
//               </h2>
//               <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Gradation Name</label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.gradationName}
//                     onChange={(e) => setFormData({ ...formData, gradationName: e.target.value })}
//                     className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 bg-slate-50"
//                     placeholder="e.g. SF"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Thickness</label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.thickness}
//                     onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
//                     className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 bg-slate-50"
//                     placeholder="e.g. 1mm"
//                   />
//                 </div>
//                 <div className="flex justify-end gap-3 mt-2">
//                   <button
//                     type="button"
//                     onClick={handleCloseModal}
//                     className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import TruckLoader from "../components/TruckLoader";
<<<<<<< Updated upstream
import { toast } from "react-toastify";
=======
import { Pencil } from "lucide-react";
>>>>>>> Stashed changes
import Topbar from "../components/Topbar";
export default function Gradations() {
  useRoleCheck(["admin"]);
  const [gradations, setGradations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGradation, setCurrentGradation] = useState(null);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [filters, setFilters] = useState({ gradation: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({ gradationName: "", thickness: "" });
=======
  const [formData, setFormData] = useState({
    gradationName: "",
    thickness: "",
  });
>>>>>>> Stashed changes

  useEffect(() => { setCurrentPage(1); }, [filters]);

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
        toast.success(currentGradation ? "Gradation updated successfully!" : "Gradation added successfully!");
        fetchGradations();
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving gradation:", error);
      toast.error("Failed to save gradation");
    }
  };

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
        toast.success(newStatus === 1 ? "Gradation activated!" : "Gradation deactivated!");
        fetchGradations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

<<<<<<< Updated upstream
  const filteredGradations = gradations.filter(g => 
    g.gradation.toLowerCase().includes(filters.gradation.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGradations = filteredGradations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGradations.length / itemsPerPage);
=======
  const totalCount = gradations.length;
  const activeCount = gradations.filter((g) => g.status === 1).length;
  const inactiveCount = gradations.filter((g) => g.status === 0).length;
>>>>>>> Stashed changes

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex">
      <Sidebar />
<<<<<<< Updated upstream
      <div className="flex-1 md:ml-64  overflow-x-auto scrollbar-hide">
                <Topbar />
                  <div className="p-4 md:p-8 topbar-offset mt-4">

=======
      <div className="flex-1 md:ml-64 p-4 md:p-20 t-20 overflow-x-auto">
        <Topbar />        
>>>>>>> Stashed changes
        {loading ? (
          <TruckLoader />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center bg-white px-7 py-5 rounded-xl border-b-[3px] border-[#f0f0f0] mb-5">
              <div>
<<<<<<< Updated upstream
                <h1 className="text-2xl font-bold text-slate-800">Gradations</h1>
                {/* <p className="text-sm text-slate-500 mt-1">Manage and organize product gradations</p> */}
              </div>
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-200 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Gradation
                </button>
              </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filter by Gradation Name..."
            value={filters.gradation}
            onChange={(e) => setFilters({ ...filters, gradation: e.target.value })}
            className="w-full md:w-1/3 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">ID</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Gradation Name</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentGradations.map((g, index) => (
                  <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">{indexOfFirstItem + index + 1}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{g.gradation}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(g.id, g.status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${g.status === 1 ? "bg-green-500" : "bg-slate-300"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${g.status === 1 ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleOpenModal(g)}
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
                {filteredGradations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      No gradations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white border-t border-slate-200 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rows per page:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === i + 1 ? "bg-[#212121] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
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
=======
                <h1 className="text-lg font-medium text-[#1a1a2e] tracking-tight">
                  Gradations
                </h1>
                <p className="text-xs text-[#9098a9] mt-1">
                  Manage and organize product gradations
                </p>
              </div>
              {/* <button
                onClick={() => handleOpenModal()}
                className="bg-[#1a1a2e] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#2d2d4e] transition flex items-center gap-2"
              >
                <span className="text-base leading-none">+</span> Add Gradation
              </button> */}
              <button
                onClick={() => handleOpenModal()}
                className="bg-[#1a1a2e] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#2d2d4e] transition flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-base leading-none">+</span> Add Gradation
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white rounded-xl px-5 py-4 border-l-[3px] border-[#e8e8e8]">
                <p className="text-[10px] uppercase tracking-widest text-[#9098a9] font-medium">
                  Total
                </p>
                <p className="text-3xl font-medium text-[#1a1a2e] mt-1">
                  {totalCount}
                </p>
              </div>
              <div className="bg-white rounded-xl px-5 py-4 border-l-[3px] border-green-400">
                <p className="text-[10px] uppercase tracking-widest text-[#9098a9] font-medium">
                  Active
                </p>
                <p className="text-3xl font-medium text-[#1a1a2e] mt-1">
                  {activeCount}
                </p>
              </div>
              <div className="bg-white rounded-xl px-5 py-4 border-l-[3px] border-orange-400">
                <p className="text-[10px] uppercase tracking-widest text-[#9098a9] font-medium">
                  Inactive
                </p>
                <p className="text-3xl font-medium text-[#1a1a2e] mt-1">
                  {inactiveCount}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl overflow-hidden">
              {/* <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f2f5]">
                <span className="text-xs text-[#9098a9] font-medium">
                  {totalCount} gradations
                </span>
              </div> */}
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#212121] text-white">
                    <th className="py-3 px-6 text-[11px] uppercase tracking-wider text-[#9098a9] font-medium border-b border-[#f0f2f5]">
                      #
                    </th>
                    <th className="py-3 px-6 text-[11px] uppercase tracking-wider text-[#9098a9] font-medium border-b border-[#f0f2f5]">
                      Gradation Name
                    </th>
                    <th className="py-3 px-6 text-[11px] uppercase tracking-wider text-[#9098a9] font-medium border-b border-[#f0f2f5]">
                      Status
                    </th>
                    <th className="py-3 px-6 text-[11px] uppercase tracking-wider text-[#9098a9] font-medium border-b border-[#f0f2f5] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gradations.map((g, index) => (
                    <tr
                      key={g.id}
                      className={`border-b border-[#f5f6f8] last:border-0 hover:bg-[#f0f4ff] transition-colors ${
                        index % 2 === 0 ? "bg-[#fafbfc]" : "bg-white"
                      }`}
                    >
                      <td className="py-3.5 px-6">
                        <span className="bg-[#f0f2f5] text-[#6b7280] text-xs font-medium rounded-md px-2 py-1">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-[#1a1a2e] font-medium">
                        {g.gradation}
                      </td>

                      <td className="py-3.5 px-6">
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
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleOpenModal(g)}
                          className="p-2 rounded-md bg-[#f0f2f5] text-[#1a1a2e] hover:bg-[#e2e5ea] transition"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {gradations.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-[#9098a9] text-sm"
                      >
                        No gradations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
>>>>>>> Stashed changes
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]">
            <div className="bg-white p-7 rounded-2xl w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-medium text-[#1a1a2e]">
                  {currentGradation ? "Edit Gradation" : "Add Gradation"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="bg-[#f0f2f5] text-[#6b7280] w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#e2e5ea] transition text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="h-px bg-[#f0f2f5] mb-5" />
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9098a9] font-medium mb-1.5">
                    Gradation Name
                  </label>
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
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e5e7eb] focus:outline-none focus:border-[#1a1a2e] bg-[#fafbfc] text-[#1a1a2e] text-sm transition placeholder:text-[#c4c9d4]"
                    placeholder="e.g. SF"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9098a9] font-medium mb-1.5">
                    Thickness
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.thickness}
                    onChange={(e) =>
                      setFormData({ ...formData, thickness: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e5e7eb] focus:outline-none focus:border-[#1a1a2e] bg-[#fafbfc] text-[#1a1a2e] text-sm transition placeholder:text-[#c4c9d4]"
                    placeholder="e.g. 1mm"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-lg border-[1.5px] border-[#e5e7eb] text-[#6b7280] text-sm font-medium hover:bg-[#f5f6f8] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
<<<<<<< Updated upstream
                    className="bg-[#212121] text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
=======
                    className="bg-[#1a1a2e] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#2d2d4e] transition"
>>>>>>> Stashed changes
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
    </div>
  );
}
