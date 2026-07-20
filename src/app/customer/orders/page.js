"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CustomerOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [isThisMonth, setIsThisMonth] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Mock User info
  const [userInfo, setUserInfo] = useState({
    name: "Customer",
    email: "customer@example.com",
    phone: "+91 00000 00000",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.name) setUserInfo(prev => ({ ...prev, name: user.name }));
      if (user.email) setUserInfo(prev => ({ ...prev, email: user.email }));
      if (user.phone) setUserInfo(prev => ({ ...prev, phone: user.phone }));
    } catch (e) {
      console.log(e);
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer-orders/my-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const getMappedStatus = (dbStatus) => {
    if (['placed', 'approved', 'packed', 'pending'].includes(dbStatus)) return 'In Progress';
    if (dbStatus === 'dispatched') return 'In Transit';
    if (['delivered', 'completed', 'stock_out'].includes(dbStatus)) return 'Delivered';
    if (dbStatus === 'cancelled') return 'Cancelled';
    return 'In Progress';
  };

  const getStatusColor = (mappedStatus) => {
    switch (mappedStatus) {
      case 'In Progress': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'In Transit': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const STAGES = [
    { 
      name: 'Order Placed', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> 
    },
    { 
      name: 'Processing', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    },
    { 
      name: 'In Transit', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
    },
    { 
      name: 'Delivered', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    }
  ];
  
  const getStageIndex = (dbStatus) => {
    if (dbStatus === 'cancelled') return -1;
    if (['placed', 'approved', 'pending'].includes(dbStatus)) return 0;
    if (dbStatus === 'packed') return 1;
    if (dbStatus === 'dispatched') return 2;
    if (['delivered', 'completed', 'stock_out'].includes(dbStatus)) return 3;
    return 0;
  };

  // Analytics for top cards (uses all orders)
  const totalOrdersCount = orders.length;
  const inProgressCount = orders.filter(o => ['placed', 'approved', 'packed', 'pending'].includes(o.status)).length;
  const deliveredCount = orders.filter(o => ['delivered', 'completed', 'stock_out'].includes(o.status)).length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  const getVehicleName = (order) => {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      return items[0]?.product_name || "Unknown Product";
    } catch {
      return "Unknown Product";
    }
  };

  const getOrderItems = (order) => {
    try {
      return typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    } catch {
      return [];
    }
  };

  // FILTERING LOGIC
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Month Filter
      if (isThisMonth) {
        const orderDate = new Date(order.date);
        const today = new Date();
        if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      }
      
      // 2. Status Filter
      if (filterStatus !== 'all') {
        const mapped = getMappedStatus(order.status).toLowerCase();
        if (mapped !== filterStatus.toLowerCase()) return false;
      }

      // 3. Search Filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const displayId = (order.bill_no || order.id).toString().toLowerCase();
        const productName = getVehicleName(order).toLowerCase();
        const mappedStatus = getMappedStatus(order.status).toLowerCase();
        if (!displayId.includes(term) && !productName.includes(term) && !mappedStatus.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, isThisMonth, filterStatus, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [isThisMonth, filterStatus, searchTerm, itemsPerPage]);


  // INVOICE GENERATION LOGIC - EXCLUDING PRICING
  const generateInvoiceHtml = (sale) => {
    let rowIndex = 1;
    let items = getOrderItems(sale);

    const itemsHtml = items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const unit = item.unit || "Pieces";
      const gradation = item.gradation || "N/A";

      return `
      <tr>
        <td>${rowIndex++}</td>
        <td>${item.product_code || '-'}</td>
        <td>${item.product_name || '-'}</td>
        <td>${gradation}</td>
        <td>${qty} ${unit}</td>
      </tr>
    `;
    }).join("");

    return `
      <html>
      <head>
        <title>Sales Order - ${sale.bill_no || sale.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 10px; color: #1e293b; background: #f1f5f9; }
          .invoice-box { max-width: 800px; margin: auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 15px; }
          .header-left h1 { margin: 0; color: #10b981; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;}
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
          .main-table th, .main-table td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .main-table th { background: #f1f5f9; color: #334155; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .main-table td { font-size: 12px; color: #1e293b; }
          .main-table tr:hover { background-color: #f8fafc; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          
          @media print {
            @page { margin: 5mm; }
            body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-box { box-shadow: none; padding: 0; max-width: 100%; border: none; }
            .header, .details-container { page-break-inside: avoid; break-inside: avoid; }
            tr { page-break-inside: avoid; break-inside: avoid; page-break-after: auto; }
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
              <h2>Order Details</h2>
              <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString("en-GB")}</p>
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
              <h3>Order Details</h3>
              <p><strong>Bill No:</strong> ORD-2026-${sale.bill_no || sale.id}</p>
              <p><strong>Customer:</strong> ${userInfo.name}</p>
              <p><strong>Phone:</strong> ${userInfo.phone}</p>
              <p><strong>Status:</strong> ${getMappedStatus(sale.status)}</p>
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
          
          <div class="footer">
             <p>This is a computer-generated document. No signature is required.</p>
             <p>&copy; ${new Date().getFullYear()} Micara Laminate. All rights reserved.</p>
            </div>
          </div>
          <style>
            @media print { .no-print { display: none !important; } }
          </style>
          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
            <button onclick="window.print()" style="background: #212121; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              🖨️ Print Order
            </button>
          </div>
        </body>
      </html>
    `;
  };

  const printInvoice = (sale) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site to generate the bill.");
      return;
    }
    const htmlContent = generateInvoiceHtml(sale);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-8 md:pb-12 bg-[#f8f9fa] min-h-screen -mt-6 pt-6 px-2 sm:px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-800 tracking-tight leading-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Track and manage your orders</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto relative">
          <button 
            onClick={() => setIsThisMonth(!isThisMonth)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition border ${isThisMonth ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            This Month
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filter {filterStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-lg rounded-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                <div className="p-1">
                  {['all', 'In Progress', 'In Transit', 'Delivered', 'Cancelled'].map(status => (
                    <button 
                      key={status}
                      onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-50 transition flex items-center justify-between ${filterStatus === status ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {filterStatus === status && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#212121] rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">No orders yet</h2>
          <p className="text-slate-500 text-sm mb-6">You haven't placed any orders. Browse the catalog to get started.</p>
          <button onClick={() => router.push('/customer/products')} className="px-5 py-2.5 bg-[#1a1a1a] text-white text-sm font-bold rounded-xl hover:bg-black transition shadow-sm cursor-pointer">
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Total Orders</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{totalOrdersCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">In Progress</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{inProgressCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Delivered</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{deliveredCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Cancelled</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{cancelledCount}</h3>
              </div>
            </div>
          </div>

          {/* ALL ORDERS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible mb-6">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-sm font-bold text-slate-800">All Orders</h2>
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white text-xs font-semibold transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr>
                    <th scope="col" className="py-3 px-3 sm:py-4 sm:px-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                    <th scope="col" className="py-3 px-3 sm:py-4 sm:px-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Product Summary</th>
                    <th scope="col" className="py-3 px-3 sm:py-4 sm:px-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Order Date</th>
                    <th scope="col" className="py-3 px-3 sm:py-4 sm:px-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th scope="col" className="py-3 px-3 sm:py-4 sm:px-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-xs font-semibold text-slate-400">
                        No matching orders found.
                      </td>
                    </tr>
                  ) : currentOrders.map((order) => {
                    const mappedStatus = getMappedStatus(order.status);
                    const isExpanded = expandedOrder?.id === order.id;

                    return (
                      <React.Fragment key={order.id}>
                        <tr 
                          className={`group hover:bg-slate-50/80 transition cursor-pointer ${isExpanded ? 'bg-slate-50/80' : ''}`}
                          onClick={() => setExpandedOrder(isExpanded ? null : order)}
                        >
                          <td className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">
                            <span className="text-[11px] font-bold text-[#212121]">ORD-2026-{order.bill_no || order.id}</span>
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-6">
                            <span className="text-[11px] font-semibold text-slate-700">{getVehicleName(order)}</span>
                            {getOrderItems(order).length > 1 && (
                              <span className="ml-2 text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">+{getOrderItems(order).length - 1} more</span>
                            )}
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">
                            <span className="text-[11px] font-medium text-slate-500">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(mappedStatus)}`}>
                              {mappedStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap text-right">
                            <button className="inline-flex items-center justify-center p-2 rounded-lg bg-[#212121] text-white hover:bg-black transition-colors shadow-sm">
                              {isExpanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED ACCORDION ROW */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="5" className="p-0 border-0">
                              <div className="bg-white m-4 mt-0 rounded-xl border border-slate-200 shadow-md overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                
                                {/* Expanded Header */}
                                <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                                  <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-bold text-slate-800">Order #{order.bill_no || order.id}</h2>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(getMappedStatus(order.status))}`}>
                                      {getMappedStatus(order.status)}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => printInvoice(order)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                      Download Invoice
                                    </button>
                                  </div>
                                </div>

                                <div className="p-3 sm:p-5 md:p-6">
                                  {/* Order Details Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Name</p>
                                      <p className="text-xs font-bold text-slate-800">{userInfo.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                                      <p className="text-xs font-bold text-slate-800">{userInfo.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
                                      <p className="text-xs font-bold text-slate-800">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Email</p>
                                      <p className="text-xs font-bold text-slate-800 truncate" title={userInfo.email}>{userInfo.email}</p>
                                    </div>
                                  </div>

                                  {/* PREMIUM TIMELINE STEPPER */}
                                  <div className="relative pt-2 pb-8 mb-8 border-b border-slate-100 overflow-x-auto hide-scrollbar min-w-full">
                                    <div className="min-w-[450px] md:min-w-full px-2">
                                      {/* Background Track */}
                                      <div className="absolute top-[28px] left-[15%] right-[15%] h-[3px] bg-slate-100 rounded-full z-0"></div>
                                      
                                      {/* Active Track */}
                                      {order.status !== 'cancelled' && (
                                        <div 
                                          className="absolute top-[28px] left-[15%] h-[3px] bg-emerald-500 rounded-full z-0 transition-all duration-1000 ease-in-out shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                          style={{ width: `calc(${(getStageIndex(order.status) / (STAGES.length - 1)) * 70}%)` }}
                                        ></div>
                                      )}

                                      <div className="relative z-10 flex justify-between w-full">
                                      {STAGES.map((stage, idx) => {
                                        const currentIndex = getStageIndex(order.status);
                                        const isCompleted = currentIndex >= idx;
                                        const isCurrent = currentIndex === idx;
                                        const isCancelled = order.status === 'cancelled';
                                        
                                        return (
                                          <div key={stage.name} className="flex flex-col items-center w-1/4 group">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-500 mb-2 border-[3px] border-white relative
                                              ${isCancelled ? 'bg-red-50 text-red-500 border-red-50' : 
                                                isCompleted 
                                                  ? isCurrent 
                                                    ? 'bg-[#212121] text-white shadow-md ring-4 ring-emerald-50 scale-110' 
                                                    : 'bg-emerald-500 text-white' 
                                                  : 'bg-slate-100 text-slate-300'}
                                            `}>
                                              {stage.icon}
                                              
                                              {/* Checkmark badge for completed past steps */}
                                              {isCompleted && !isCurrent && !isCancelled && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <span className={`text-[10px] font-bold uppercase tracking-widest text-center mt-1 px-1 ${isCancelled ? 'text-red-500' : isCurrent ? 'text-[#212121]' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                                              {stage.name}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  </div>

                                  {/* Products List Table */}
                                  <div>
                                    <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                      Products ({getOrderItems(order).length} items)
                                    </h3>
                                    
                                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                                      <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                          <tr>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Product Code</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Product Name</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gradation</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 bg-white">
                                          {getOrderItems(order).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition">
                                              <td className="py-2.5 px-4 text-[11px] font-bold text-slate-400">{idx + 1}</td>
                                              <td className="py-2.5 px-4 text-[11px] font-bold text-slate-700">{item.product_code || '-'}</td>
                                              <td className="py-2.5 px-4 text-[11px] font-semibold text-slate-600">{item.product_name || '-'}</td>
                                              <td className="py-2.5 px-4 text-[11px] font-medium text-slate-500">{item.gradation || '-'}</td>
                                              <td className="py-2.5 px-4 text-[11px] font-black text-[#212121] text-right">
                                                {item.quantity} <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.unit || 'Units'}</span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rows per page:</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="border border-slate-200 rounded-lg text-xs font-semibold py-1 pl-2 pr-6 bg-white focus:outline-none focus:border-blue-400"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  
                  <nav className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    
                    <div className="flex items-center">
                      {[...Array(totalPages)].map((_, i) => {
                        // Logic for displaying page numbers nicely (show first, last, and current surroundings)
                        if (
                          totalPages <= 5 || 
                          i === 0 || 
                          i === totalPages - 1 || 
                          (i >= currentPage - 2 && i <= currentPage)
                        ) {
                          return (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-7 h-7 mx-0.5 flex items-center justify-center rounded-lg text-[11px] font-bold transition
                                ${currentPage === i + 1 
                                  ? 'bg-[#212121] text-white shadow-sm' 
                                  : 'text-slate-600 hover:bg-white bg-transparent'
                                }`}
                            >
                              {i + 1}
                            </button>
                          );
                        }
                        if (i === 1 || i === totalPages - 2) {
                          return <span key={i} className="text-slate-400 text-xs px-1">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
