"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import TruckLoader from "../components/TruckLoader";

export default function Products() {
  const role = useRoleCheck(["admin", "sales", "purchase"]);
  const [products, setProducts] = useState([]);
  const [gradations, setGradations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
        fetchProducts();
        handleCloseModal();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving product:", error);
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
        fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-auto">
        {loading ? (
          <TruckLoader />
        ) : (
          <>
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Products</h1>
                <p className="text-sm text-slate-500 mt-1">
              Manage physical inventory products
            </p>
          </div>
          {role === "admin" && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
            >
              + Add Product
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold">ID</th>
                <th className="py-4 px-6 font-semibold">Product Code</th>
                <th className="py-4 px-6 font-semibold">Product Name</th>
                <th className="py-4 px-6 font-semibold">Gradation</th>
                <th className="py-4 px-6 font-semibold text-center">
                  Qty / Unit
                </th>
                {role === "admin" && (
                  <th className="py-4 px-6 font-semibold text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                >
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6 text-orange-600 font-semibold">
                    {p.product_code}
                  </td>
                  <td className="py-4 px-6 text-slate-800 font-medium">
                    {p.product_name}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{p.gradation}</td>
                  <td className="py-4 px-6 text-slate-600 text-center font-medium">
                    {p.quantity || 0} {p.unit || "Pieces"}
                  </td>
                  {role === "admin" && (
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="text-blue-500 hover:text-blue-600 font-medium mr-4 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-600 font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No products found.
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
