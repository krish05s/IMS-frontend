"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import Link from "next/link";

export default function Dashboard() {
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
  const role = useRoleCheck(["admin", "sales", "purchase", "user"]);
  const [stats, setStats] = useState({ products: 0, totalQuantity: 0, totalSalesQty: 0, totalPurchaseQty: 0 });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) return; // Wait until role is resolved
    
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Data conditionally based on role
        const fetches = [
          fetch("http://localhost:5000/api/product/read", { headers })
        ];
        
        if (role === "admin" || role === "sales") {
           fetches.push(fetch("http://localhost:5000/api/sales/read", { headers }));
        }
        if (role === "admin" || role === "purchase") {
           fetches.push(fetch("http://localhost:5000/api/purchase/read", { headers }));
        }

        const responses = await Promise.all(fetches);
        const prodData = await responses[0].json();
        
        let salesData = { data: [] };
        let purchaseData = { data: [] };

        if (role === "admin") {
           salesData = await responses[1].json();
           purchaseData = await responses[2].json();
        } else if (role === "sales") {
           salesData = await responses[1].json();
        } else if (role === "purchase") {
           purchaseData = await responses[1].json();
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
              .sort((a,b) => (b.quantity || 0) - (a.quantity || 0))
              .slice(0, 5)
              .map(p => ({
                name: p.product_code,
                stock: p.quantity || 0
              }))
          );
        }

        // --- Process Chart Data ---
        let totalSalesQty = 0;
        let totalPurchaseQty = 0;
        const dateMap = {};

        const addData = (dataArr, type) => {
           (dataArr || []).forEach(record => {
             const d = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
             if (!dateMap[d]) dateMap[d] = { date: d, salesQty: 0, purchaseQty: 0 };
             
             const qty = record.items?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || record.quantity || 0;
             if (type === "sales") {
                dateMap[d].salesQty += qty;
                totalSalesQty += qty;
             } else {
                dateMap[d].purchaseQty += qty;
                totalPurchaseQty += qty;
             }
           });
        };

        if (salesData.success) addData(salesData.data, "sales");
        if (purchaseData.success) addData(purchaseData.data, "purchase");

        // Sort chronologically
        const cData = Object.keys(dateMap).map(k => ({
           rawDate: new Date(k + ` ${new Date().getFullYear()}`).getTime(),
           ...dateMap[k]
        })).sort((a,b) => a.rawDate - b.rawDate);

        setChartData(cData);
        setStats({ products, totalQuantity, totalSalesQty, totalPurchaseQty });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, [role]);

  if (loading || !role) {
     return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-semibold text-slate-500">Loading Dashboard...</div>;
  }

  // Define renders based on role
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-lg mb-8 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to Micara IMS</h1>
            <p className="text-slate-300 text-lg">Here's an overview of your {role === 'admin' ? 'entire system' : role} activity today.</p>
          </div>
          <div className="hidden md:block relative z-10">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white opacity-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zm0 10l-10 5 10 5 10-5-10-5z" />
            </svg>
          </div>
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 rounded-full bg-white opacity-[0.03] blur-3xl"></div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-slate-500 font-medium mb-4 text-sm uppercase tracking-wider">Total Products</h2>
            <p className="text-3xl font-bold text-slate-800">{stats.products}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-slate-500 font-medium mb-4 text-sm uppercase tracking-wider">Stock Available</h2>
            <p className="text-3xl font-bold text-slate-800">{stats.totalQuantity}</p>
          </div>

          {(role === "admin" || role === "sales") && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-slate-500 font-medium mb-4 text-sm uppercase tracking-wider">Total Sales (Qty)</h2>
              <p className="text-3xl font-bold text-orange-600">{stats.totalSalesQty}</p>
            </div>
          )}

          {(role === "admin" || role === "purchase") && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-slate-500 font-medium mb-4 text-sm uppercase tracking-wider">Total Purchases (Qty)</h2>
              <p className="text-3xl font-bold text-emerald-600">{stats.totalPurchaseQty}</p>
            </div>
          )}
        </div>

        {/* Dynamic Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Chart 1: Activity Trend (Admin/Sales/Purchase) */}
           <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 ${role !== 'admin' ? 'lg:col-span-2' : ''}`}>
             <h2 className="text-lg font-bold text-slate-800 mb-6">Activity Timeline</h2>
             <div className="h-80 w-full text-xs font-semibold">
                {role === "admin" ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#334155' }} />
                       <Legend iconType="circle" />
                       <Line type="monotone" name="Sales Qty" dataKey="salesQty" stroke="#f97316" strokeWidth={3} dot={{r:4}} activeDot={{r: 6}} />
                       <Line type="monotone" name="Purchase Qty" dataKey="purchaseQty" stroke="#10b981" strokeWidth={3} dot={{r:4}} activeDot={{r: 6}} />
                     </LineChart>
                   </ResponsiveContainer>
                ) : role === "sales" ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#ea580c' }} />
                       <Area type="monotone" name="Sales Volume" dataKey="salesQty" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                     </AreaChart>
                   </ResponsiveContainer>
                ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#059669' }} />
                       <Area type="monotone" name="Purchase Volume" dataKey="purchaseQty" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchases)" />
                     </AreaChart>
                   </ResponsiveContainer>
                )}
             </div>
           </div>

           {/* Chart 2: Top Products (Admin Only) */}
           {role === "admin" && (
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
               <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                  Top Stocked Items
                  <Link href="/products" className="text-sm font-semibold text-blue-500 hover:underline">View All</Link>
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
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }} />
                      <Legend verticalAlign="bottom" height={20} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
           )}

        </div>

      </div>
    </div>
  );
}
