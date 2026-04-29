"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from "recharts";
import Link from "next/link";
import TruckLoader from "../components/TruckLoader";
import Topbar from "../components/Topbar";

export default function Dashboard() {
  const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];
  const role = useRoleCheck(["admin", "sales", "purchase", "user"]);
  const [stats, setStats] = useState({ products: 0, totalQuantity: 0, totalSalesQty: 0, totalPurchaseQty: 0 });
  const [chartData, setChartData] = useState([]);
  const [rawSalesData, setRawSalesData] = useState([]);
  const [rawPurchaseData, setRawPurchaseData] = useState([]);
  
  const [topProducts, setTopProducts] = useState([]);
  const [topSalesProducts, setTopSalesProducts] = useState([]);
  const [topPurchaseProducts, setTopPurchaseProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("Daily");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!role) return; // Wait until role is resolved

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUserName(payload.name || payload.username || payload.email || "User");
          } catch (e) {}
        }
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Data conditionally based on role
        const fetches = [
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/read`, { headers })
        ];

        if (role === "admin" || role === "sales") {
          fetches.push(fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/read`, { headers }));
        }
        if (role === "admin" || role === "purchase") {
          fetches.push(fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase/read`, { headers }));
        }

        const responses = await Promise.all(fetches);
        const prodData = await responses[0].json();

        let sData = [];
        let pData = [];

        if (role === "admin") {
          const sd = await responses[1].json();
          const pd = await responses[2].json();
          if (sd.success) sData = sd.data;
          if (pd.success) pData = pd.data;
        } else if (role === "sales") {
          const sd = await responses[1].json();
          if (sd.success) sData = sd.data;
        } else if (role === "purchase") {
          const pd = await responses[1].json();
          if (pd.success) pData = pd.data;
        }

        // --- Process Products ---
        let products = 0;
        let totalQuantity = 0;
        let pList = [];
        if (prodData.success) {
          pList = prodData.data;
          products = pList.length;
          totalQuantity = pList.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

          setTopProducts(
            [...pList]
              .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
              .slice(0, 5)
              .map(p => ({
                name: p.product_code,
                stock: p.quantity || 0
              }))
          );

          setLowStockProducts(
            [...pList]
              .filter(p => (p.quantity || 0) < 50)
              .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
              .slice(0, 5)
              .map(p => ({
                name: p.product_code,
                stock: p.quantity || 0
              }))
          );
        }

        setRawSalesData(sData);
        setRawPurchaseData(pData);

        const sQty = sData.reduce((sum, r) => sum + (r.items?.reduce((a, c) => a + (c.quantity || 0), 0) || r.quantity || 0), 0);
        const pQty = pData.reduce((sum, r) => sum + (r.items?.reduce((a, c) => a + (c.quantity || 0), 0) || r.quantity || 0), 0);

        // Top Sales Products
        const salesMap = {};
        sData.forEach(r => {
          (r.items || []).forEach(item => {
            if (!salesMap[item.product_code]) salesMap[item.product_code] = 0;
            salesMap[item.product_code] += (item.quantity || 0);
          });
        });
        setTopSalesProducts(
          Object.keys(salesMap).map(k => ({ name: k, qty: salesMap[k] }))
            .sort((a, b) => b.qty - a.qty).slice(0, 5)
        );

        // Top Purchase Products
        const purchaseMap = {};
        pData.forEach(r => {
          (r.items || []).forEach(item => {
            if (!purchaseMap[item.product_code]) purchaseMap[item.product_code] = 0;
            purchaseMap[item.product_code] += (item.quantity || 0);
          });
        });
        setTopPurchaseProducts(
          Object.keys(purchaseMap).map(k => ({ name: k, qty: purchaseMap[k] }))
            .sort((a, b) => b.qty - a.qty).slice(0, 5)
        );

        setStats({ products, totalQuantity, totalSalesQty: sQty, totalPurchaseQty: pQty });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, [role]);

  useEffect(() => {
    if (loading) return;
    const dateMap = {};

    const processData = (dataArr, type) => {
      (dataArr || []).forEach(record => {
        const dateObj = new Date(record.date);
        let key = "";
        
        if (timeFilter === "Daily") {
          key = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (timeFilter === "Monthly") {
          key = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else if (timeFilter === "Yearly") {
          key = dateObj.toLocaleDateString('en-US', { year: 'numeric' });
        }

        if (!dateMap[key]) dateMap[key] = { date: key, salesQty: 0, purchaseQty: 0, rawDate: dateObj.getTime() };
        
        const qty = record.items?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || record.quantity || 0;
        if (type === "sales") {
          dateMap[key].salesQty += qty;
        } else {
          dateMap[key].purchaseQty += qty;
        }
      });
    };

    processData(rawSalesData, "sales");
    processData(rawPurchaseData, "purchase");

    const cData = Object.keys(dateMap).map(k => dateMap[k]).sort((a, b) => a.rawDate - b.rawDate);
    setChartData(cData);
  }, [rawSalesData, rawPurchaseData, timeFilter, loading]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-slate-50 to-green-50 font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <Topbar />
        {(loading || !role) ? (
          <TruckLoader />
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 capitalize">Welcome Back, {userName}!</h1>
                  <p className="text-sm text-slate-500 font-medium mt-1">Here is your {role === 'admin' ? 'entire system' : role} activity summary for today.</p>
                </div>
              </div>
            </div>

            {/* Dynamic Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              {/* Product Card */}
              <Link href="/products" className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[130px]">
                <div>
                  <h2 className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    Total Products
                  </h2>
                  <p className="text-2xl font-black text-slate-800 mt-2">{stats.products}</p>
                </div>
              </Link>

              {/* Stock Card */}
              <Link href="/products" className="group bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[130px]">
                <div>
                  <h2 className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    Stock Available
                  </h2>
                  <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalQuantity}</p>
                </div>
              </Link>

              {/* Sales Card */}
              {(role === "admin" || role === "sales") && (
                <Link href="/sales" className="group bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-orange-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[130px]">
                  <div>
                    <h2 className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      Total Sales (Qty)
                    </h2>
                    <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalSalesQty}</p>
                  </div>
                </Link>
              )}

              {/* Purchase Card */}
              {(role === "admin" || role === "purchase") && (
                <Link href="/purchase" className="group bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-purple-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[130px]">
                  <div>
                    <h2 className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      Total Purchases (Qty)
                    </h2>
                    <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalPurchaseQty}</p>
                  </div>
                </Link>
              )}
            </div>

            {/* Dynamic Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {(role === "admin" || role === "sales" || role === "purchase") && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Activity Overview</h2>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      {['Daily', 'Monthly', 'Yearly'].map(filter => (
                        <button
                          key={filter}
                          onClick={() => setTimeFilter(filter)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeFilter === filter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[350px] w-full text-xs font-semibold">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={20} iconType="circle" />
                          {(role === "admin" || role === "sales") && (
                            <Area type="monotone" dataKey="salesQty" name="Sales (Qty)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                          )}
                          {(role === "admin" || role === "purchase") && (
                            <Area type="monotone" dataKey="purchaseQty" name="Purchases (Qty)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchase)" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 font-medium">No activity data available</div>
                    )}
                  </div>
                </div>
              )}

              
              {/* Chart: Top Stocked Items (Admin Only) */}
              {role === "admin" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                    Top Stocked Items
                    <Link href="/products" className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">View Inventory</Link>
                  </h2>
                  <div className="h-80 w-full text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topProducts}
                          dataKey="stock"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }} />
                        <Legend verticalAlign="bottom" height={20} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Chart: Top Selling Products (Admin & Sales) */}
              {(role === "admin" || role === "sales") && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                    Trending Sales
                    <Link href="/sales" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">View Sales</Link>
                  </h2>
                  <div className="h-80 w-full text-xs font-semibold">
                    {topSalesProducts.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSalesProducts} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} width={80} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="qty" fill="#f97316" radius={[0, 4, 4, 0]} barSize={24} name="Units Sold" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 font-medium">No sales data available</div>
                    )}
                  </div>
                </div>
              )}

              
              {/* Alert List: Low Stock Watchlist (Admin & Purchase) */}
              {(role === "admin" || role === "purchase") && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                    Low Stock Products
                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-md">{lowStockProducts.length} Alerts</span>
                  </h2>
                  <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {lowStockProducts.length > 0 ? (
                      <div className="space-y-3">
                        {lowStockProducts.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-red-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="font-semibold text-slate-700">{product.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-500">Remaining:</span>
                              <span className="font-black text-red-500 text-lg">{product.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 font-medium space-y-2">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Inventory levels are healthy</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chart: Top Purchased Products (Admin & Purchase) */}
              {(role === "admin" || role === "purchase") && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                    Recent Purchases
                    <Link href="/purchase" className="text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors">View Purchases</Link>
                  </h2>
                  <div className="h-80 w-full text-xs font-semibold">
                    {topPurchaseProducts.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topPurchaseProducts} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="qty" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} name="Units Purchased" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 font-medium">No purchase data available</div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
