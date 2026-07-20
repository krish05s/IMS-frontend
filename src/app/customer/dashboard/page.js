"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CustomerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.name || payload.email || "Customer");
      
      const headers = { Authorization: `Bearer ${token}` };

      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer-orders/my-orders`, { headers }).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/read`, { headers }).then(r => r.json())
      ])
      .then(([ordersData, productsData]) => {
        if (ordersData.success) setOrders(ordersData.data || []);
        if (productsData.success) setProducts(productsData.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
      
    } catch (e) {
      console.error("Invalid token");
      router.push("/");
    }
  }, []);

  // --- ANALYTICS CALCULATIONS ---
  const totalOrders = orders.length;
  
  const inProgress = orders.filter(o => ['placed', 'approved', 'packed', 'pending'].includes(o.status)).length;
  const inTransit = orders.filter(o => ['dispatched'].includes(o.status)).length;
  const delivered = orders.filter(o => ['delivered', 'completed', 'stock_out'].includes(o.status)).length;

  // Product KPIs
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.quantity <= 0).length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 10).length; 
  const inStock = totalProducts - outOfStock - lowStock;

  // Calculate Top Products
  const productCounts = {};
  orders.forEach(order => {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      items.forEach(item => {
        const name = item.product_name || "Unknown Product";
        const qty = parseInt(item.quantity, 10) || 0;
        if (!productCounts[name]) productCounts[name] = 0;
        productCounts[name] += qty;
      });
    } catch (e) {
      console.error("Failed to parse items for order", order.id);
    }
  });

  const sortedProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); 

  const maxProductCount = sortedProducts.length > 0 ? sortedProducts[0][1] : 1;

  // Status Mapping
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

  const getVehicleName = (order) => {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      return items[0]?.product_name || "Unknown Product";
    } catch {
      return "Unknown Product";
    }
  };

  // Order Trends Data (Last 7 Days)
  const orderTrendsData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const count = orders.filter(o => o.date && o.date.startsWith(dateStr)).length;
    orderTrendsData.push({ name: displayStr, count });
  }

  // Pie Chart Data
  const pieData = [
    { name: 'In Stock', value: inStock > 0 ? inStock : 0, color: '#10b981' },
    { name: 'Low Stock', value: lowStock > 0 ? lowStock : 0, color: '#f59e0b' },
    { name: 'Out of Stock', value: outOfStock > 0 ? outOfStock : 0, color: '#ef4444' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-8 md:pb-12 bg-[#f8f9fa] min-h-screen -mt-6 pt-6 px-2 sm:px-4 md:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-800 tracking-tight leading-tight flex items-center gap-2">
            Welcome back, {userName}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Here's a real-time overview of your operational activity and catalog.</p>
        </div>
        <button onClick={() => router.push('/customer/products')} className="w-full sm:w-auto bg-[#1a1a1a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Order
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#212121] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* TOP KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
            {/* Total Products */}
            <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Products</p>
                    <h3 className="text-xl font-black text-slate-800">{totalProducts}</h3>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3 z-10">All products in catalog</p>
              
              <div className="absolute -bottom-2 -right-2 w-28 h-12 opacity-50">
                <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,30 L20,15 L40,25 L60,10 L80,20 L100,5 L100,30 Z" fill="url(#blue-grad)" />
                  <path d="M0,30 L20,15 L40,25 L60,10 L80,20 L100,5" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <defs>
                    <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Low Stock</p>
                    <h3 className="text-xl font-black text-slate-800">{lowStock}</h3>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3 z-10">Reorder recommended</p>
              
              <div className="absolute -bottom-2 -right-2 w-28 h-12 opacity-50">
                <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,30 L20,20 L40,15 L60,25 L80,10 L100,15 L100,30 Z" fill="url(#amber-grad)" />
                  <path d="M0,30 L20,20 L40,15 L60,25 L80,10 L100,15" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <defs>
                    <linearGradient id="amber-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Out of Stock</p>
                    <h3 className="text-xl font-black text-slate-800">{outOfStock}</h3>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 17 7 7 7"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3 z-10">Out of stock items</p>
              
              <div className="absolute -bottom-2 -right-2 w-28 h-12 opacity-50">
                <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,5 L20,15 L40,10 L60,25 L80,20 L100,30 L100,30 L0,30 Z" fill="url(#red-grad)" />
                  <path d="M0,5 L20,15 L40,10 L60,25 L80,20 L100,30" fill="none" stroke="#ef4444" strokeWidth="2" />
                  <defs>
                    <linearGradient id="red-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Orders</p>
                    <h3 className="text-xl font-black text-slate-800">{totalOrders}</h3>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3 z-10">Total orders placed</p>
              
              <div className="absolute -bottom-2 -right-2 w-28 h-12 opacity-50">
                <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,25 L20,15 L40,20 L60,10 L80,15 L100,5 L100,30 L0,30 Z" fill="url(#green-grad)" />
                  <path d="M0,25 L20,15 L40,20 L60,10 L80,15 L100,5" fill="none" stroke="#10b981" strokeWidth="2" />
                  <defs>
                    <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* ORDER OVERVIEW HEADER */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Order Overview
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              This Month
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 ml-1 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          {/* ORDER OVERVIEW CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
            {/* Total */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-blue-500 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">Total Orders</p>
                  <h3 className="text-xl font-black text-slate-800">{totalOrders}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Lifetime volume</p>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-amber-500 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">In Progress</p>
                  <h3 className="text-xl font-black text-slate-800">{inProgress}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Currently processing</p>
            </div>

            {/* In Transit */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-blue-500 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">In Transit</p>
                  <h3 className="text-xl font-black text-slate-800">{inTransit}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-400">On the way</p>
            </div>

            {/* Delivered */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-emerald-500 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">Delivered</p>
                  <h3 className="text-xl font-black text-slate-800">{delivered}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Successfully fulfilled</p>
            </div>
          </div>

          {/* MIDDLE GRID: Recent Activity & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-4">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col h-full border border-slate-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  Recent Activity
                </h2>
                <button onClick={() => router.push('/customer/orders')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All Orders
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-slate-400 text-xs font-medium">No recent orders found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="pb-2 sm:pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                        <th className="pb-2 sm:pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Product</th>
                        <th className="pb-2 sm:pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="pb-2 sm:pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {orders.slice(0, 5).map((order) => {
                        const mappedStatus = getMappedStatus(order.status);
                        const displayId = order.bill_no 
                          ? (order.bill_no.startsWith('ORD-') ? order.bill_no : `ORD-${order.bill_no}`) 
                          : `ORD-2026-${order.id}`;
                          
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => router.push('/customer/orders')}>
                            <td className="py-2 pr-2 sm:py-3.5 sm:pr-4">
                              <span className="text-[11px] font-bold text-slate-800">{displayId}</span>
                            </td>
                            <td className="py-2 pr-2 sm:py-3.5 sm:pr-4 truncate max-w-[90px] sm:max-w-[100px]">
                              <span className="text-[11px] font-semibold text-slate-600">{getVehicleName(order)}</span>
                            </td>
                            <td className="py-2 pr-2 sm:py-3.5 sm:pr-4">
                              <span className="text-[11px] font-medium text-slate-500">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </td>
                            <td className="py-2 text-right">
                              <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${getStatusColor(mappedStatus)}`}>
                                {mappedStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-center">
                    <button onClick={() => router.push('/customer/orders')} className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                      View All Orders
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col h-full border border-slate-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
                  Top Products
                </h2>
                <button onClick={() => router.push('/customer/products')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All Products
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                {sortedProducts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 text-xs font-medium">Insufficient data for product analytics.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 flex-1 justify-center">
                    {sortedProducts.map(([productName, quantity], index) => {
                      const percentage = Math.round((quantity / maxProductCount) * 100);
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{productName}</span>
                              <span className="text-[11px] font-black text-[#212121]">{quantity} <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">units</span></span>
                            </div>
                            
                            {/* Progress Bar Container */}
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-blue-600' : 'bg-blue-400'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-6 flex justify-center">
                  <button onClick={() => router.push('/customer/products')} className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
                    Browse Product Catalog
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM GRID: Trend, Stock Summary, Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-4">
            {/* Order Trend Line Chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-800">Order Trend</h2>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  This Month
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 ml-0.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div className="flex-1 min-h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderTrendsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Summary Pie Chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col border border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 mb-2">Stock Summary</h2>
              
              {totalProducts === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <p className="text-slate-400 text-xs font-medium">No products available.</p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <div className="w-[100px] h-[100px] shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '4px 8px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex-1 pl-4 flex flex-col gap-3">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                          <span className="text-[10px] font-semibold text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-800">
                          {item.value} <span className="text-[9px] text-slate-400 font-semibold">({Math.round((item.value / totalProducts) * 100)}%)</span>
                        </span>
                      </div>
                    ))}
                    
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500">Total Products</span>
                      <span className="text-[11px] font-black text-slate-800">{totalProducts}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col border border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <button onClick={() => router.push('/customer/products')} className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col gap-2 transition-colors text-left group">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800">Browse Catalog</h4>
                    <p className="text-[9px] font-medium text-slate-500 mt-0.5">View all products</p>
                  </div>
                </button>

                <button onClick={() => router.push('/customer/products')} className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col gap-2 transition-colors text-left group">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800">Place New Order</h4>
                    <p className="text-[9px] font-medium text-slate-500 mt-0.5">Create a new order</p>
                  </div>
                </button>

                <button onClick={() => router.push('/customer/orders')} className="bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-xl p-3 flex flex-col gap-2 transition-colors text-left group">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800">My Orders</h4>
                    <p className="text-[9px] font-medium text-slate-500 mt-0.5">Track your orders</p>
                  </div>
                </button>

                <button className="bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col gap-2 transition-colors text-left group">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800">Need Help?</h4>
                    <p className="text-[9px] font-medium text-slate-500 mt-0.5">Contact support</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-[10px] text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} MICARA. All rights reserved.
      </div>
    </div>
  );
}
