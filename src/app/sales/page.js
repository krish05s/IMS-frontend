"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";

export default function Sales() {
  useRoleCheck(["admin", "sales"]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  
  // Header Data (For Modal)
  const [formData, setFormData] = useState({ date: "", bill_no: "", customer_name: "", vehicle_no: "", owner_name: "" });
  
  // Expanded Row Items Logic
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);

  const fetchSales = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sales/read", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        setSales(data.data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/product/read", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  // Debounced Vehicle Fetching
  useEffect(() => {
    const fetchVehicleOwner = async () => {
      if (!formData.vehicle_no || formData.vehicle_no.trim() === "") {
        setFormData(prev => ({ ...prev, owner_name: "" }));
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/vehicle/search/${encodeURIComponent(formData.vehicle_no)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success && data.owner_name) {
          setFormData(prev => ({ ...prev, owner_name: data.owner_name }));
        } else {
          setFormData(prev => ({ ...prev, owner_name: "" }));
        }
      } catch (e) {
        console.error("Vehicle lookup failed", e);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchVehicleOwner();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [formData.vehicle_no]);



  const handleOpenModal = (sale = null) => {
    if (sale) {
      setCurrentSaleId(sale.id);
      setFormData({
        date: new Date(sale.date).toISOString().split('T')[0],
        bill_no: sale.bill_no,
        customer_name: sale.customer_name,
        vehicle_no: sale.vehicle_no || "",
        owner_name: "",
        items: sale.items || []
      });
    } else {
      setCurrentSaleId(null);
      setFormData({ date: new Date().toISOString().split('T')[0], bill_no: "", customer_name: "", vehicle_no: "", owner_name: "", items: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSaleId(null);
  };

  // Expanded Items Handlers
  const toggleItemsExpansion = (sale) => {
    if (expandedRowId === sale.id) {
       setExpandedRowId(null);
       setExpandedItems([]);
    } else {
       setExpandedRowId(sale.id);
       const itemsLoaded = sale.items && sale.items.length > 0 
          ? sale.items.map(i => ({...i, isEditing: false}))
          : sale.product_code 
             ? [{ product_code: sale.product_code, product_name: sale.product_name, gradation: "", quantity: sale.quantity, isEditing: false }]
             : [];
       setExpandedItems(itemsLoaded);
    }
  };

  const addExpandedItemRow = () => {
    setExpandedItems([...expandedItems, { product_code: "", product_name: "", gradation: "", quantity: "", isEditing: true }]);
  };

  const removeExpandedItemRow = (index) => {
    const newItems = expandedItems.filter((_, i) => i !== index);
    setExpandedItems(newItems);
  };

  const handleExpandedItemChange = (index, field, value) => {
    const newItems = [...expandedItems];
    newItems[index][field] = value;
    
    if (field === "product_code") {
      const selectedProd = products.find(p => p.product_code === value);
      if (selectedProd) {
        newItems[index].product_name = selectedProd.product_name;
        newItems[index].gradation = selectedProd.gradation;
      }
    }
    setExpandedItems(newItems);
  };

  const handleSaveExpandedItems = async (sale) => {
    const validItems = expandedItems.filter(i => i.product_code && i.quantity > 0);
    
    try {
      const submissionData = {
        date: sale.date,
        bill_no: sale.bill_no,
        customer_name: sale.customer_name,
        vehicle_no: sale.vehicle_no,
        items: validItems
      };

      const response = await fetch(`http://localhost:5000/api/sales/update/${sale.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(submissionData),
      });
      const data = await response.json();
      if (data.success) {
        fetchSales();
        fetchProducts();
        setExpandedRowId(null);
        setExpandedItems([]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving items:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale? Inventory will be reverted.")) {
      try {
        const response = await fetch(`http://localhost:5000/api/sales/delete/${id}`, {
           method: "DELETE",
           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success) {
           fetchSales();
           fetchProducts();
        } else {
           alert(data.message);
        }
      } catch (e) {
        console.error("Error deleting sale:", e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Items
    try {
      if (formData.vehicle_no && formData.owner_name) {
        await fetch("http://localhost:5000/api/vehicle/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ vehicle_no: formData.vehicle_no, owner_name: formData.owner_name })
        }).catch(err => console.error("Vehicle mapping error", err));
      }

      const submissionData = { ...formData, items: currentSaleId ? formData.items : [] };
      const url = currentSaleId 
        ? `http://localhost:5000/api/sales/update/${currentSaleId}`
        : "http://localhost:5000/api/sales/create";
      const method = currentSaleId ? "PUT" : "POST";

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
        fetchSales();
        fetchProducts(); // refresh products stock count
        handleCloseModal();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const printInvoice = (sale) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Sales Invoice - ${sale.bill_no}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Sales Invoice</h2>
        </div>
        <div class="details">
          <div>
            <p><strong>Bill No:</strong> ${sale.bill_no}</p>
            <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
            <p><strong>Vehicle No:</strong> ${sale.vehicle_no || "-"}</p>
          </div>
          <div>
            <p><strong>Customer:</strong> ${sale.customer_name}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Gradation</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items && sale.items.length > 0 ? sale.items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.product_code}</td>
                <td>${item.product_name}</td>
                <td>${item.gradation}</td>
                <td>${item.quantity}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5">Legacy single-item product code: ${sale.product_code} | Qty: ${sale.quantity}</td>
              </tr>
            `}
          </tbody>
        </table>
        <div class="footer">
           <p>Generated by Micara Inventory Management System</p>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-auto">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sales</h1>
            <p className="text-sm text-slate-500 mt-1">Manage outbound dispatch and customer bills</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
          >
            + Create Sale
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold w-16 text-center">ID</th>
                <th className="py-4 px-6 font-semibold">Bill No</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Customer Name</th>
                <th className="py-4 px-6 font-semibold">Vehicle No</th>
                <th className="py-4 px-6 font-semibold text-center">Items</th>
                <th className="py-4 px-6 font-semibold text-center">Actions</th>
                <th className="py-4 px-6 font-semibold text-center text-blue-600">Bill</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, index) => (
                <React.Fragment key={s.id}>
                <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-center text-slate-600 font-medium">{index + 1}</td>
                  <td className="py-4 px-6 text-slate-800 font-medium">{s.bill_no}</td>
                  <td className="py-4 px-6 text-slate-800">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">{s.customer_name}</td>
                  <td className="py-4 px-6 text-slate-600">{s.vehicle_no || "-"}</td>
                  <td className="py-4 px-6 text-orange-600 font-medium text-center">{s.items_count || (s.product_code ? 1 : 0)}</td>
                  <td className="py-4 px-6 text-center">
                     <div className="flex justify-center gap-3">
                       <button onClick={() => toggleItemsExpansion(s)} className="text-orange-600 hover:text-orange-800 font-bold bg-orange-50 px-3 py-1 rounded-md border border-orange-200">
                          {expandedRowId === s.id ? "-" : "+"}
                       </button>
                       <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-700 font-medium ml-2">Edit</button>
                       <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-medium ml-2">Delete</button>
                     </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => printInvoice(s)}
                      className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 font-semibold transition text-xs"
                    >
                      Generate Bill
                    </button>
                  </td>
                </tr>

                {expandedRowId === s.id && (
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <td colSpan="8" className="p-0">
                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-200 shadow-inner">
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-slate-800">Dispatched Products (Bill: {s.bill_no})</h4>
                           </div>
                           
                           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                             <div className="flex flex-col gap-4">
                                   {expandedItems.map((item, idx) => (
                                     <div key={idx} className="flex items-end gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                                        {!item.isEditing ? (
                                           <div className="flex-1 flex justify-between items-center text-slate-700">
                                              <div>
                                                 <p className="font-semibold">{item.product_name || item.product_code}</p>
                                                 <p className="text-xs text-slate-500">Gradation: {item.gradation || "N/A"}</p>
                                              </div>
                                              <div className="flex gap-4 items-center">
                                                <div className="text-center px-4 py-2 bg-orange-100 rounded text-orange-800 font-bold">
                                                  Qty: {item.quantity}
                                                </div>
                                                <button type="button" onClick={() => handleExpandedItemChange(idx, "isEditing", true)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold flex gap-1 items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 transition">
                                                  <i>✏️</i> Edit
                                                </button>
                                                <button type="button" onClick={() => removeExpandedItemRow(idx)} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg border border-red-100 transition font-bold">
                                                   Drop
                                                </button>
                                              </div>
                                           </div>
                                        ) : (
                                           <>
                                        <div className="flex-1">
                                          <label className="block text-xs font-bold text-slate-600 mb-1">Select Product</label>
                                          <select
                                            required
                                            value={item.product_code}
                                            onChange={(e) => handleExpandedItemChange(idx, "product_code", e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                                          >
                                            <option value="" disabled>Select Product Type</option>
                                            {products.map(prod => (
                                              <option key={prod.id} value={prod.product_code}>
                                                {prod.product_code} - {prod.product_name} ({prod.gradation}) - [Stock: {prod.quantity}]
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="w-1/4">
                                          <label className="block text-xs font-bold text-slate-600 mb-1">
                                            Quantity
                                            {item.product_code && (
                                              <span className="text-blue-500 font-normal ml-1">
                                                (Avail: {products.find(p => p.product_code === item.product_code)?.quantity || 0})
                                              </span>
                                            )}
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            required
                                            value={item.quantity}
                                            onChange={(e) => handleExpandedItemChange(idx, "quantity", parseInt(e.target.value) || "")}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                                            placeholder="Enter Qty"
                                          />
                                        </div>
                                        <div>
                                           {item.product_code && item.quantity > 0 && (
                                             <button type="button" onClick={() => handleExpandedItemChange(idx, "isEditing", false)} className="px-4 py-2.5 border border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 rounded-lg transition mr-2 font-bold focus:ring focus:ring-green-100 bg-white shadow-sm">
                                                Ok
                                             </button>
                                           )}
                                           <button type="button" onClick={() => removeExpandedItemRow(idx)} className="px-4 py-2.5 border border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 rounded-lg transition font-bold bg-white shadow-sm">
                                              X
                                           </button>
                                        </div>
                                           </>
                                        )}
                                     </div>
                                   ))}
                             </div>
                             
                             <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                               {expandedItems.length > 0 ? (
                                 <button type="button" onClick={addExpandedItemRow} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1 transition">
                                    + Add more product?
                                 </button>
                               ) : (
                                 <div>
                                   <span className="text-slate-500 italic text-sm">No items. Order is empty.</span>
                                   <button type="button" onClick={addExpandedItemRow} className="ml-4 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition">
                                      + Add Product
                                   </button>
                                 </div>
                               )}
                               <button type="button" onClick={() => handleSaveExpandedItems(s)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-500/20">
                                  Save Products
                               </button>
                             </div>
                                   

                           </div>
                        </div>
                     </td>
                  </tr>
                )}
              </React.Fragment>))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-4xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{currentSaleId ? "Edit Sales Invoice" : "Create Sales Invoice"}</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bill No</label>
                    <input
                      type="text"
                      required
                      value={formData.bill_no}
                      onChange={(e) => setFormData({ ...formData, bill_no: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                      placeholder="e.g. S-2039"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
                    <input
                      type="text"
                      value={formData.vehicle_no}
                      onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 uppercase bg-white"
                      placeholder="e.g. GJ05 1234"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Owner</label>
                    <input
                      type="text"
                      value={formData.owner_name}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none cursor-not-allowed bg-slate-100"
                      placeholder="Auto-fills dynamically"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
                  >
                    {currentSaleId ? "Update Dispatch" : "Save Dispatch"}
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