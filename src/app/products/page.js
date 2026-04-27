"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import TruckLoader from "../components/TruckLoader";
import { toast } from "react-toastify";

export default function Products() {
  const role = useRoleCheck(["admin", "sales", "purchase"]);
  const [products, setProducts] = useState([]);
  const [gradations, setGradations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ product_code: "", product_name: "", gradation: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    product_name: "",
    gradation_id: "",
    gradation: "",
    unit: "Pieces",
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/read`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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
        // filter only active gradations (status === 1)
        setGradations(data.data.filter((g) => g.status === 1));
      }
    } catch (error) {
      console.error("Error fetching gradations:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchGradations()]).then(() => setLoading(false));
  }, []);

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setFormData(
      product
        ? {
            product_name: product.product_name,
            gradation_id: product.gradation_id,
            gradation: product.gradation,
            unit: product.unit || "Kg",
          }
        : { product_name: "", gradation_id: "", gradation: "", unit: "Pieces" },
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setFormData({
      product_name: "",
      gradation_id: "",
      gradation: "",
      unit: "Pieces",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentProduct
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/product/update/${currentProduct.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/product/create`;
    const method = currentProduct ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(currentProduct ? "Product updated successfully!" : "Product added successfully!");
        fetchProducts();
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(filters.product_name.toLowerCase()) &&
    p.product_code?.toLowerCase().includes(filters.product_code.toLowerCase()) &&
    p.gradation?.toLowerCase().includes(filters.gradation.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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
                <h1 className="text-2xl font-bold text-slate-800">Products</h1>
                {/* <p className="text-sm text-slate-500 mt-1">Manage physical inventory products</p> */}
          </div>
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {role === "admin" && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
          <input type="text" placeholder="Filter by Product Code..." value={filters.product_code} onChange={(e) => setFilters({ ...filters, product_code: e.target.value })} className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
          <input type="text" placeholder="Filter by Product Name..." value={filters.product_name} onChange={(e) => setFilters({ ...filters, product_name: e.target.value })} className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
          <input type="text" placeholder="Filter by Gradation..." value={filters.gradation} onChange={(e) => setFilters({ ...filters, gradation: e.target.value })} className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">ID</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Product Code</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Product Name</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Gradation</th>
                  <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                    Qty / Unit
                  </th>
                  {role === "admin" && (
                    <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((p, index) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="py-3 px-4 text-orange-600 font-semibold">
                      {p.product_code}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {p.product_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.gradation}</td>
                    <td className="py-3 px-4 text-slate-600 text-center font-medium">
                      {p.quantity || 0} {p.unit || "Pieces"}
                    </td>
                    {role === "admin" && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(p)}
                            title="Edit"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Delete"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {currentProduct ? "Edit Product" : "Add Product"}
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData({ ...formData, product_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 bg-slate-50"
                    placeholder="e.g. Synthetic Resin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gradation
                  </label>
                  <select
                    required
                    value={formData.gradation_id}
                    onChange={(e) => {
                      const selected = gradations.find(
                        (g) => g.id.toString() === e.target.value,
                      );
                      setFormData({
                        ...formData,
                        gradation_id: e.target.value,
                        gradation: selected ? selected.gradation : "",
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 bg-slate-50"
                  >
                    <option value="" disabled>
                      Select Gradation
                    </option>
                    {gradations.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gradation}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition text-slate-800 bg-slate-50"
                  >
                    <option value="Pieces">Pieces</option>
                    <option value="Kg">Kg</option>
                  </select>
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
          </>
        )}
      </div>
    </div>
  );
}
