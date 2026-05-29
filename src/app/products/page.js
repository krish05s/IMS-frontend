"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import { toast } from "react-toastify";
import Topbar from "../components/Topbar";
export default function Products() {
  const role = useRoleCheck(["super admin", "admin", "sales", "purchase"]);
  const [products, setProducts] = useState([]);
  const [gradations, setGradations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState({
    product_code: "",
    product_name: "",
    gradation: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
        // filter only active gradations (status === 1) and ensure unique names
        const uniqueGradations = [];
        const seenNames = new Set();
        data.data.filter((g) => g.status === 1).forEach((g) => {
          if (!seenNames.has(g.gradation)) {
            uniqueGradations.push(g);
            seenNames.add(g.gradation);
          }
        });
        setGradations(uniqueGradations);
      }
    } catch (error) {
      console.error("Error fetching gradations:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchGradations()]).then(() =>
      setLoading(false),
    );
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
    setIsSaving(true); // 👈 add karo
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
        toast.success(
          currentProduct
            ? "Product updated successfully!"
            : "Product added successfully!",
        );
        fetchProducts();
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false); // 👈 add karo
    }
  };


  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/delete/${deleteProduct.id}`,
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
        setDeleteModal(false);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.product_name
        ?.toLowerCase()
        .includes(filters.product_name.toLowerCase()) &&
      p.product_code
        ?.toLowerCase()
        .includes(filters.product_code.toLowerCase()) &&
      p.gradation?.toLowerCase().includes(filters.gradation.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl shadow-md whitespace-nowrap  cursor-pointer"
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
              Add Product
            </button>
          }
        />
        <div className="p-4 md:p-8 topbar-offset mt-4">
         
            <>
            

              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
                {/* <input
                  type="text"
                  placeholder="Filter by Product Code..."
                  value={filters.product_code}
                  onChange={(e) =>
                    setFilters({ ...filters, product_code: e.target.value })
                  }
                  className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
                /> */}
                <input
                  type="text"
                  placeholder="Filter by Product Name..."
                  value={filters.product_name}
                  onChange={(e) =>
                    setFilters({ ...filters, product_name: e.target.value })
                  }
                  className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
                />
                <input
                  type="text"
                  placeholder="Filter by Gradation..."
                  value={filters.gradation}
                  onChange={(e) =>
                    setFilters({ ...filters, gradation: e.target.value })
                  }
                  className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
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
                        {/* <th className="py-3 px-4 font-semibold whitespace-nowrap">
                          Product Code
                        </th> */}
                        <th className="py-3 px-4 font-semibold whitespace-nowrap">
                          Product Name
                        </th>
                        <th className="py-3 px-4 font-semibold whitespace-nowrap">
                          Gradation
                        </th>
                        <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                          Qty / Unit
                        </th>
                        {role === "admin" || role === "super admin" && (
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
                          <td className="py-1.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {indexOfFirstItem + index + 1}
                          </td>
                          {/* <td className="py-1.5 px-4 text-orange-600 font-semibold">
                            {p.product_code}
                          </td> */}
                          <td className="py-1.5 px-4 text-slate-800 font-medium">
                            {p.product_name}
                          </td>
                          <td className="py-1.5 px-4 text-slate-600">
                            {p.gradation}
                          </td>
                          <td className="py-1.5 px-4 text-slate-600 text-center font-medium">
                            {p.quantity || 0} {p.unit || "Pieces"}
                          </td>
                          {role === "admin" || role === "super admin" && (
                            <td className="py-1.5 px-4 text-right">
                              <div className="flex justify-end gap-2">
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
                                  onClick={() => {
                                    setDeleteProduct(p);
                                    setDeleteModal(true);
                                  }}
                                  title="Delete"
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
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
                          )}
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-8 text-center text-slate-500"
                          >
                            No products found.
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
                      className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={50}>50</option>
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
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer"
                      >
                        &lt;
                      </button>

                      {/* Sliding Pages */}
                      {getSlidingPages().map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${
                            currentPage === page
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
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* edit add  Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]">
                  <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#212121] to-[#555555] rounded-t-2xl -mx-8 -mt-8 mb-6">
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
                          {currentProduct ? "Edit Product" : "Add Product"}
                        </h2>
                      </div>

                      <button
                        onClick={handleCloseModal}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Product Name
                        </label>
                      <input
  type="text"
  required
  value={formData.product_name}
  onChange={(e) =>
    setFormData({
      ...formData,
      product_name: e.target.value,
    })
  }
  placeholder="Enter product name"
  className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none text-black bg-white placeholder-slate-400"
/>
                      </div>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Gradation
  </label>

  <select
    required
    value={formData.gradation_id || ""}
    onChange={(e) => {
      const selected = gradations.find(
        (g) => g.id.toString() === e.target.value
      );
      setFormData({
        ...formData,
        gradation_id: e.target.value,
        gradation: selected ? selected.gradation : "",
      });
    }}
    className={`w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white ${
      !formData.gradation_id ? "text-slate-400" : "text-black"
    }`}
  >
    <option value="" disabled className="text-slate-400">
      Select Gradation
    </option>

    {gradations.map((g) => (
      <option key={g.id} value={g.id} className="text-black">
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
    value={formData.unit || ""}
    onChange={(e) =>
      setFormData({ ...formData, unit: e.target.value })
    }
    className={`w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white ${
      !formData.unit ? "text-slate-400" : "text-black"
    }`}
  >
    <option value="" disabled className="text-slate-400">
      Select Unit
    </option>

    <option value="Pieces" className="text-slate-400">
      Pieces
    </option>
    <option value="Kg" className="text-slate-400">
      Kg
    </option>
  </select>
</div>
                      <div className="flex justify-end gap-3 mt-2">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl hover:bg-[#444] flex items-center gap-2 disabled:opacity-70 cursor-pointer"
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
            </>
          

          {/*delete model */}
          {deleteModal && deleteProduct && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#212121] to-[#555555]">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-white"
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
                    <h2 className="text-base font-semibold text-white">
                      Delete Product
                    </h2>
                  </div>

                  <button
                    onClick={() => setDeleteModal(false)}
                    className="text-white text-lg hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-600 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-800">
                      {deleteProduct.product_name}
                    </span>
                    ?
                    <br />
                    <span className="text-slate-400 text-xs">
                      This action cannot be undone.
                    </span>
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-2 bg-[#212121] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      {deleteLoading && (
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8v8z"
                            fill="currentColor"
                            className="opacity-75"
                          />
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
      </div>
    </div>
  );
}
