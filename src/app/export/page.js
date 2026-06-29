"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import * as XLSX from "xlsx";
import { FiDownload } from "react-icons/fi";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

export default function ExportPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [purchaseParties, setPurchaseParties] = useState([]);
  const [salesParties, setSalesParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [gradations, setGradations] = useState([]);

  const [selectedPurchaseParty, setSelectedPurchaseParty] = useState(null);
  const [selectedSalesParty, setSelectedSalesParty] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGradation, setSelectedGradation] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchFilterOptions();
    fetchData();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      const [partyRes, productRes, gradationRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/party/read`, config),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/read`, config),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/gradation/read`, config),
      ]);

      const purchaseList = (partyRes.data.data || []).filter(p => p.type === "purchase").map(p => ({ value: p.name, label: p.name }));
      const salesList = (partyRes.data.data || []).filter(p => p.type === "sales").map(p => ({ value: p.name, label: p.name }));
      const productList = (productRes.data.data || []).map(p => ({ value: p.product_name, label: p.product_name }));
      const gradationList = (gradationRes.data.data || []).map(g => ({ value: g.gradation, label: g.gradation }));

      // remove duplicates
      setPurchaseParties([...new Map(purchaseList.map(item => [item.value, item])).values()]);
      setSalesParties([...new Map(salesList.map(item => [item.value, item])).values()]);
      setProducts([...new Map(productList.map(item => [item.value, item])).values()]);
      setGradations([...new Map(gradationList.map(item => [item.value, item])).values()]);

    } catch (error) {
      console.error("Error fetching filter options", error);
    }
  };

  const fetchData = async () => {
    // Return early and clear data if NO filters are selected
    if (!selectedPurchaseParty && !selectedSalesParty && !selectedProduct && !selectedGradation) {
      setData([]);
      setFilteredData([]);
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (selectedPurchaseParty) params.purchaseParty = selectedPurchaseParty.value;
      if (selectedSalesParty) params.salesParty = selectedSalesParty.value;
      if (selectedProduct) params.productName = selectedProduct.value;
      if (selectedGradation) params.gradation = selectedGradation.value;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/export`, { params });
      setData(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching export data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPurchaseParty, selectedSalesParty, selectedProduct, selectedGradation]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(row => ({
      Type: row.transaction_type,
      Date: new Date(row.date).toLocaleDateString(),
      "Bill No": row.bill_no,
      Party: row.party_name,
      Vehicle: row.vehicle_no,
      Product: row.product_name,
      Gradation: row.gradation,
      Quantity: row.quantity,
      Status: row.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Export_Data.xlsx");
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return;

    let totalQty = 0;
    const gradationTotals = {};

    const itemsHtml = filteredData.map((row, index) => {
      const type = row.transaction_type === 'purchase' ? 'Purchase' : 'Sales';
      const date = new Date(row.date).toLocaleDateString();
      const qty = Number(row.quantity) || 0;
      const grad = row.gradation || "-";

      totalQty += qty;
      if (!gradationTotals[grad]) gradationTotals[grad] = 0;
      gradationTotals[grad] += qty;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${type}</td>
          <td>${date}</td>
          <td>${row.bill_no}</td>
          <td>${row.party_name || "-"}</td>
          <td>${row.product_name || "-"}</td>
          <td>${grad}</td>
          <td>${qty}</td>
        </tr>
      `;
    }).join("");

    const gradationSummaryHtml = Object.keys(gradationTotals)
      .map(grad => `
        <tr>
          <th>${grad}</th>
          <td>${gradationTotals[grad]}</td>
        </tr>
      `).join("");

    const filterDetails = [
      selectedPurchaseParty ? `Purchase Party: ${selectedPurchaseParty.label}` : null,
      selectedSalesParty ? `Sales Party: ${selectedSalesParty.label}` : null,
      selectedProduct ? `Product: ${selectedProduct.label}` : null,
      selectedGradation ? `Gradation: ${selectedGradation.label}` : null,
    ].filter(Boolean).join(" | ") || "All Data";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head>
        <title>Transaction Export Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 10px; color: #1e293b; background: #f1f5f9; }
          .invoice-box { max-width: 900px; margin: auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 10px; margin-bottom: 15px; }
          .header-left h1 { margin: 0; color: #ea580c; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;}
          .header-left p { margin: 5px 0 0; font-size: 14px; color: #64748b; font-weight: 500; font-style: italic; }
          .header-right { text-align: right; }
          .header-right h2 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; font-weight: 700; }
          .header-right p { margin: 5px 0 0; font-size: 14px; color: #475569; }
          .details-container { display: flex; justify-content: space-between; margin-bottom: 15px; gap: 15px; }
          .details-box { background: #f8fafc; padding: 10px 15px; border-radius: 8px; flex: 1; border: 1px solid #e2e8f0; }
          .details-box p { margin: 4px 0; font-size: 12px; color: #475569; }
          .details-box strong { color: #0f172a; display: inline-block; width: 100px; }
          .details-box h3 { margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
          table.main-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .main-table th, .main-table td { padding: 4px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .main-table th { background: #f1f5f9; color: #334155; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .main-table td { font-size: 12px; color: #1e293b; }
          .main-table tr:hover { background-color: #f8fafc; }
          .summary-container { display: flex; justify-content: flex-end; margin-top: 20px; page-break-inside: avoid; break-inside: avoid; }
          .summary-box { width: 350px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid; break-inside: avoid; }
          .summary-header { background: #f1f5f9; padding: 8px 15px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table th, .summary-table td { padding: 6px 12px; font-size: 12px; }
          .summary-table th { text-align: left; color: #475569; font-weight: 500; }
          .summary-table td { text-align: right; font-weight: 600; color: #0f172a; }
          .summary-table tr { border-bottom: 1px solid #f1f5f9; }
          .summary-table tr:last-child { border-bottom: none; }
          .total-row { background: #fff7ed; }
          .total-row th { color: #ea580c; font-weight: 700; font-size: 13px; }
          .total-row td { color: #ea580c; font-weight: 800; font-size: 13px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          
          @media print {
            @page { margin: 5mm; }
            body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-box { box-shadow: none; padding: 0; max-width: 100%; border: none; }
            .header, .details-container { page-break-inside: avoid; break-inside: avoid; }
            tr { page-break-inside: avoid; break-inside: avoid; page-break-after: auto; }
            .summary-container { margin-top: 15px; display: block; text-align: right; page-break-inside: avoid; break-inside: avoid; }
            .summary-box { display: inline-block; text-align: left; page-break-inside: avoid; break-inside: avoid; }
            .footer { page-break-inside: avoid; break-inside: avoid; margin-top: 15px; }
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
              <h2>EXPORT REPORT</h2>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</p>
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
              <h3>Report Details</h3>
              <p><strong>Total Records:</strong> ${filteredData.length}</p>
              <p><strong>Filters Applied:</strong> ${filterDetails}</p>
              <p><strong>Generated By:</strong> Admin User</p>
              <p><strong>Report Type:</strong> Transaction Log</p>
            </div>
          </div>
          
          <table class="main-table">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="10%">Type</th>
                <th width="10%">Date</th>
                <th width="10%">Bill No</th>
                <th width="20%">Party</th>
                <th width="20%">Product Name</th>
                <th width="15%">Gradation</th>
                <th width="10%">Quantity</th>
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
                  <th>Total Quantity</th>
                  <td>${totalQty}</td>
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
    <div className="min-h-screen bg-[#f1f1f1] flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 overflow-x-auto scrollbar-hide">
        <Topbar />
        <div className="p-4 md:p-8 topbar-offset mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <FiDownload className="text-[#D2A185]" /> Export Transactions
              </h1>
              <p className="text-slate-500 text-sm mt-1">Filter and export your purchase and sales data.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all"
              >
                Export PDF
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all"
              >
                Export Excel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Party</label>
                {isMounted && (
                  <Select
                    instanceId="purchase-party-select"
                    isClearable
                    options={purchaseParties}
                    value={selectedPurchaseParty}
                    onChange={setSelectedPurchaseParty}
                    placeholder="Select Purchase Party..."
                    className="text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sales Party</label>
                {isMounted && (
                  <Select
                    instanceId="sales-party-select"
                    isClearable
                    options={salesParties}
                    value={selectedSalesParty}
                    onChange={setSelectedSalesParty}
                    placeholder="Select Sales Party..."
                    className="text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                {isMounted && (
                  <Select
                    instanceId="product-select"
                    isClearable
                    options={products}
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    placeholder="Select Product..."
                    className="text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradation</label>
                {isMounted && (
                  <Select
                    instanceId="gradation-select"
                    isClearable
                    options={gradations}
                    value={selectedGradation}
                    onChange={setSelectedGradation}
                    placeholder="Select Gradation..."
                    className="text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-center w-16">ID</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Bill No</th>
                    <th className="py-3 px-4 font-semibold">Party</th>
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">Gradation</th>
                    <th className="py-3 px-4 font-semibold">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">Loading...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">No data found.</td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.transaction_type === 'purchase' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {row.transaction_type === 'purchase' ? 'Purchase' : 'Sales'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{isMounted ? new Date(row.date).toLocaleDateString() : ""}</td>
                        <td className="py-3 px-4">{row.bill_no}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{row.party_name || "-"}</td>
                        <td className="py-3 px-4">{row.product_name || "-"}</td>
                        <td className="py-3 px-4">{row.gradation || "-"}</td>
                        <td className="py-3 px-4 font-semibold">{row.quantity || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
