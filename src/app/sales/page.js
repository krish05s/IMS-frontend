"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import Select from "react-select";
import TruckLoader from "../components/TruckLoader";
import { toast } from "react-toastify";

export default function Sales() {
  useRoleCheck(["admin", "sales"]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSalesId, setCurrentSalesId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bill_no: "", customer_name: "", vehicle_no: "", driver_number: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Header Data (For Modal)
  const [formData, setFormData] = useState({ date: "", bill_no: "", customer_name: "", vehicle_no: "", driver_number: "" });

  // Expanded Row Items Logic
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);

  const fetchSales = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/read`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/read`, {
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
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    Promise.all([fetchSales(), fetchProducts()]).then(() => setLoading(false));
  }, []);



  const handleOpenModal = (sale = null) => {
    if (sale) {
      setCurrentSalesId(sale.id);
      setFormData({
        date: new Date(sale.date).toISOString().split('T')[0],
        bill_no: sale.bill_no,
        customer_name: sale.customer_name,
        vehicle_no: sale.vehicle_no || "",
        driver_number: sale.driver_number || "",
        items: sale.items || []
      });
    } else {
      setCurrentSalesId(null);
      setFormData({ date: new Date().toISOString().split('T')[0], bill_no: "", customer_name: "", vehicle_no: "", driver_number: "", items: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSalesId(null);
  };

  // Expanded Items Handlers
  const toggleItemsExpansion = (sale) => {
    if (expandedRowId === sale.id) {
      setExpandedRowId(null);
      setExpandedItems([]);
    } else {
      setExpandedRowId(sale.id);
      const itemsLoaded = sale.items && sale.items.length > 0
        ? sale.items.map(i => {
          const prod = products.find(p => p.product_code === i.product_code);
          return { ...i, unit: prod?.unit || "Kg", isEditing: false };
        })
        : sale.product_code
          ? [{
            product_code: sale.product_code,
            product_name: sale.product_name,
            gradation: "",
            quantity: sale.quantity,
            unit: products.find(p => p.product_code === sale.product_code)?.unit || "Kg",
            isEditing: false
          }]
          : [];

      // Always ensure there is one default product entry box visible at the end
      itemsLoaded.push({ product_code: "", product_name: "", gradation: "", quantity: "", unit: "Kg", isEditing: true });

      setExpandedItems(itemsLoaded);
    }
  };

  const addExpandedItemRow = () => {
    setExpandedItems([...expandedItems, { product_code: "", product_name: "", gradation: "", quantity: "", unit: "Kg", isEditing: true }]);
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
        driver_number: sale.driver_number,
        items: validItems
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/update/${sale.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(submissionData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Products saved successfully!");
        fetchSales();
        fetchProducts();
        setExpandedRowId(null);
        setExpandedItems([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving items:", error);
      toast.error("Failed to save products");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale? Inventory will be reverted.")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Sales record deleted!");
          fetchSales();
          fetchProducts();
        } else {
          toast.error(data.message);
        }
      } catch (e) {
        console.error("Error deleting sale:", e);
        toast.error("Failed to delete sale");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Items
    try {
      const submissionData = { ...formData, items: currentSalesId ? formData.items : [] };
      const url = currentSalesId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/sales/update/${currentSalesId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/sales/create`;
      const method = currentSalesId ? "PUT" : "POST";

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
        toast.success(currentSalesId ? "Sale updated successfully!" : "Sale created successfully!");
        fetchSales();
        fetchProducts(); // refresh products stock count
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      toast.error("Failed to save sale");
    }
  };

  const filteredSales = sales.filter(s => 
    s.bill_no?.toLowerCase().includes(filters.bill_no.toLowerCase()) &&
    (s.customer_name || "").toLowerCase().includes(filters.customer_name.toLowerCase()) &&
    (s.vehicle_no || "").toLowerCase().includes(filters.vehicle_no.toLowerCase()) &&
    (s.driver_number || "").toLowerCase().includes(filters.driver_number.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const printInvoice = (sale) => {
    let totalKg = 0;
    let totalPieces = 0;
    const gradationTotals = {};

    const itemsHtml = sale.items && sale.items.length > 0 ? sale.items.map((item, idx) => {
      const prod = products.find(p => p.product_code === item.product_code);
      const unit = prod?.unit || "Kg";
      const qty = Number(item.quantity) || 0;
      
      if (unit.toLowerCase() === 'kg') totalKg += qty;
      else totalPieces += qty;

      const grad = item.gradation || "N/A";
      if (!gradationTotals[grad]) gradationTotals[grad] = { kg: 0, pieces: 0 };
      if (unit.toLowerCase() === 'kg') gradationTotals[grad].kg += qty;
      else gradationTotals[grad].pieces += qty;

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.product_code}</td>
          <td>${item.product_name}</td>
          <td>${grad}</td>
          <td>${qty} ${unit}</td>
        </tr>
      `;
    }).join('') : (() => {
      const prod = products.find(p => p.product_code === sale.product_code);
      const unit = prod?.unit || "Kg";
      const qty = Number(sale.quantity) || 0;
      const grad = prod?.gradation || "N/A";
      
      if (unit.toLowerCase() === 'kg') totalKg += qty;
      else totalPieces += qty;

      if (!gradationTotals[grad]) gradationTotals[grad] = { kg: 0, pieces: 0 };
      if (unit.toLowerCase() === 'kg') gradationTotals[grad].kg += qty;
      else gradationTotals[grad].pieces += qty;

      return `
        <tr>
          <td>1</td>
          <td>${sale.product_code}</td>
          <td>${sale.product_name || "-"}</td>
          <td>${grad}</td>
          <td>${qty} ${unit}</td>
        </tr>
      `;
    })();

    const gradationSummaryHtml = Object.keys(gradationTotals).map(grad => {
      const t = gradationTotals[grad];
      let display = [];
      if (t.kg > 0) display.push(`${t.kg} Kg`);
      if (t.pieces > 0) display.push(`${t.pieces} Pieces`);
      if (display.length === 0) display.push(`0`);
      return `
        <tr>
          <th>${grad}</th>
          <td>${display.join(" & ")}</td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Sales Invoice - ${sale.bill_no}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; background: #f1f5f9; }
          .invoice-box { max-width: 800px; margin: auto; padding: 40px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
          .header-left h1 { margin: 0; color: #ea580c; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;}
          .header-left p { margin: 5px 0 0; font-size: 14px; color: #64748b; font-weight: 500; font-style: italic; }
          .header-right { text-align: right; }
          .header-right h2 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; font-weight: 700; }
          .header-right p { margin: 5px 0 0; font-size: 14px; color: #475569; }
          .details-container { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
          .details-box { background: #f8fafc; padding: 20px; border-radius: 8px; flex: 1; border: 1px solid #e2e8f0; }
          .details-box p { margin: 8px 0; font-size: 14px; color: #475569; }
          .details-box strong { color: #0f172a; display: inline-block; width: 100px; }
          .details-box h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
          table.main-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .main-table th, .main-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .main-table th { background: #f1f5f9; color: #334155; font-weight: 600; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }
          .main-table td { font-size: 14px; color: #1e293b; }
          .main-table tr:hover { background-color: #f8fafc; }
          .summary-container { display: flex; justify-content: flex-end; margin-top: 40px; page-break-inside: avoid; break-inside: avoid; }
          .summary-box { width: 350px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid; break-inside: avoid; }
          .summary-header { background: #f1f5f9; padding: 12px 20px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table th, .summary-table td { padding: 10px 20px; font-size: 14px; }
          .summary-table th { text-align: left; color: #475569; font-weight: 500; }
          .summary-table td { text-align: right; font-weight: 600; color: #0f172a; }
          .summary-table tr { border-bottom: 1px solid #f1f5f9; }
          .summary-table tr:last-child { border-bottom: none; }
          .total-row { background: #fff7ed; }
          .total-row th { color: #ea580c; font-weight: 700; font-size: 15px; }
          .total-row td { color: #ea580c; font-weight: 800; font-size: 15px; }
          .footer { margin-top: 60px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          
          @media print {
            @page { margin: 15mm; }
            body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-box { box-shadow: none; padding: 0; max-width: 100%; border: none; }
            .header, .details-container { page-break-inside: avoid; break-inside: avoid; }
            tr { page-break-inside: avoid; break-inside: avoid; page-break-after: auto; }
            .summary-container { margin-top: 20px; display: block; text-align: right; page-break-inside: avoid; break-inside: avoid; }
            .summary-box { display: inline-block; text-align: left; page-break-inside: avoid; break-inside: avoid; }
            .footer { page-break-inside: avoid; break-inside: avoid; margin-top: 30px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="header-left">
              <img src="${window.location.origin}/FINAL_MICARA_LOGO_OPEN%20black.png" alt="Micara Laminate" style="height: 55px; margin-bottom: 8px;" onerror="this.onerror=null; this.src='${window.location.origin}/mikara.png';" />
              <p>Where Premium Surfaces Meet Timeless Elegance</p>
            </div>
            <div class="header-right">
              <h2>Sales Order</h2>
              <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="details-container">
            <div class="details-box">
              <h3>Company Info</h3>
              <p><strong>Name:</strong> Micara Laminate</p>
              <p><strong>Address:</strong> Ahmedabad, Gujarat</p>
              <p><strong>Contact:</strong> +91 9876543210</p>
              <p><strong>Email:</strong> info@micara.in</p>
              <p><strong>Website:</strong> www.micara.in</p>
            </div>
            <div class="details-box">
              <h3>Invoice Details</h3>
              <p><strong>Bill No:</strong> ${sale.bill_no}</p>
              <p><strong>Customer:</strong> ${sale.customer_name}</p>
              <p><strong>Vehicle No:</strong> ${sale.vehicle_no || "N/A"}</p>
              <p><strong>Driver Details:</strong> ${sale.driver_number || "N/A"}</p>
            </div>
          </div>
          
          <table class="main-table">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="20%">Product Code</th>
                <th width="35%">Product Name</th>
                <th width="20%">Gradation</th>
                <th width="20%">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary-container">
            <div class="summary-box">
              <div class="summary-header">Gradation & Quantity Summary</div>
              <table class="summary-table">
                ${gradationSummaryHtml}
                <tr class="total-row" style="border-top: 2px solid #fdba74;">
                  <th>Total (Kg)</th>
                  <td>${totalKg} Kg</td>
                </tr>
                <tr class="total-row">
                  <th>Total (Pieces)</th>
                  <td>${totalPieces} Pieces</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="footer">
             <p>This is a computer-generated document. No signature is required.</p>
             <p>&copy; ${new Date().getFullYear()} Micara Laminate. All rights reserved.</p>
          </div>
        </div>
        <script>
          window.onload = function() { 
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                <h1 className="text-2xl font-bold text-slate-800">Sales</h1>
                {/* <p className="text-sm text-slate-500 mt-1">Manage outbound dispatch and customer bills</p> */}
              </div>
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-200 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Sales
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
              <input type="text" placeholder="Filter by Bill No..." value={filters.bill_no} onChange={(e) => setFilters({ ...filters, bill_no: e.target.value })} className="flex-1 min-w-[120px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              <input type="text" placeholder="Filter by Customer..." value={filters.customer_name} onChange={(e) => setFilters({ ...filters, customer_name: e.target.value })} className="flex-1 min-w-[120px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              <input type="text" placeholder="Filter by Vehicle No..." value={filters.vehicle_no} onChange={(e) => setFilters({ ...filters, vehicle_no: e.target.value })} className="flex-1 min-w-[120px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              <input type="text" placeholder="Filter by Driver No..." value={filters.driver_number} onChange={(e) => setFilters({ ...filters, driver_number: e.target.value })} className="flex-1 min-w-[120px] px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-w-full overflow-hidden flex flex-col">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 font-semibold w-16 text-center whitespace-nowrap">ID</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Bill No</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Date</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Customer Name</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Vehicle No</th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Items</th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Actions</th>
                      <th className="py-3 px-4 font-semibold text-center text-blue-600 whitespace-nowrap">Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSales.map((s, index) => (
                      <React.Fragment key={s.id}>
                        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-center text-slate-600 font-medium whitespace-nowrap">{indexOfFirstItem + index + 1}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{s.bill_no}</td>
                          <td className="py-3 px-4 text-slate-800">{new Date(s.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{s.customer_name}</td>
                          <td className="py-3 px-4 text-slate-600">{s.vehicle_no || "-"}</td>
                          <td className="py-3 px-4 text-orange-600 font-medium text-center">{s.items_count || (s.product_code ? 1 : 0)}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => toggleItemsExpansion(s)} className="flex items-center justify-center w-7 h-7 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold rounded-lg transition-colors shadow-sm">
                                {expandedRowId === s.id ? "-" : "+"}
                              </button>
                              <button onClick={() => handleOpenModal(s)} title="Edit" className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDelete(s.id)} title="Delete" className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => printInvoice(s)}
                              className="flex items-center justify-center mx-auto gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 font-semibold rounded-lg transition-colors text-xs"
                              title="Generate Bill"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Bill
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
                                  <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                    {expandedItems.map((item, idx) => (
                                      <div key={idx} className="flex items-end gap-3 py-3 border-b border-slate-100 last:border-0">
                                        {!item.isEditing ? (
                                          <div className="flex-1 flex justify-between items-center text-slate-700">
                                            <div>
                                              <p className="font-semibold">{item.product_name || item.product_code}</p>
                                              <p className="text-xs text-slate-500">Gradation: {item.gradation || "N/A"}</p>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                              <div className="text-center px-4 py-2 bg-orange-50 rounded text-orange-800 font-bold border border-orange-100">
                                                Qty: {item.quantity} {item.unit || "Kg"}
                                              </div>
                                              <button type="button" onClick={() => handleExpandedItemChange(idx, "isEditing", true)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold flex gap-1 items-center px-2 py-1 transition">
                                                <i>✏️</i> Edit
                                              </button>
                                              <button type="button" onClick={() => removeExpandedItemRow(idx)} className="text-red-500 hover:text-red-700 px-2 py-1 transition font-bold">
                                                Drop
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex-1">
                                              <label className="block text-xs font-bold text-slate-600 mb-1">Select Product</label>
                                              <Select
                                                options={products.map(prod => ({
                                                  value: prod.product_code,
                                                  label: `${prod.product_name} (${prod.gradation}) - [Stock: ${prod.quantity}]`
                                                }))}
                                                value={item.product_code ? {
                                                  value: item.product_code,
                                                  label: `${item.product_name || item.product_code} (${item.gradation || ''})`
                                                } : null}
                                                onChange={(selectedOption) => {
                                                  handleExpandedItemChange(idx, "product_code", selectedOption ? selectedOption.value : "");
                                                  const prod = products.find(p => p.product_code === (selectedOption ? selectedOption.value : ""));
                                                  if (prod) handleExpandedItemChange(idx, "unit", prod.unit || "Kg");
                                                }}
                                                placeholder="Search Product..."
                                                menuPosition="fixed"
                                                styles={{
                                                  control: (base) => ({
                                                    ...base,
                                                    padding: '2px',
                                                    borderRadius: '0.5rem',
                                                    borderColor: '#cbd5e1',
                                                    boxShadow: 'none',
                                                    '&:hover': { borderColor: '#f97316' }
                                                  }),
                                                  menuPortal: base => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                isClearable
                                              />
                                            </div>
                                            <div className="w-1/4">
                                              <label className="block text-xs font-bold text-slate-600 mb-1">
                                                Quantity {item.unit ? `(${item.unit})` : ""}
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
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    if (item.product_code && item.quantity > 0) {
                                                      handleExpandedItemChange(idx, "isEditing", false);
                                                      addExpandedItemRow();
                                                    }
                                                  }
                                                }}
                                                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                                                placeholder="Enter Qty (Press Enter)"
                                              />
                                            </div>
                                            <div className="flex items-end pb-1">
                                              <button type="button" onClick={() => removeExpandedItemRow(idx)} className="px-4 py-2.5 border border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 rounded-lg transition font-bold bg-white shadow-sm h-[46px]">
                                                X
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-end items-center mt-6 pt-5 border-t border-slate-100">
                                    <button type="button" onClick={() => handleSaveExpandedItems(s)} className="bg-orange-500 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-500/20">
                                      Save Products
                                    </button>
                                  </div>

                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>))}
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-500">
                          No sales found.
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-4xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{currentSalesId ? "Edit Sales Invoice" : "Create Sales Invoice"}</h2>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver Number</label>
                    <input
                      type="text"
                      value={formData.driver_number}
                      onChange={(e) => setFormData({ ...formData, driver_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white"
                      placeholder="e.g. 1234567890"
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
                    {currentSalesId ? "Update Dispatch" : "Save Dispatch"}
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