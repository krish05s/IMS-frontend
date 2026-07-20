"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

function CustomerProductsContent() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [inputValues, setInputValues] = useState({});
  const searchParams = useSearchParams();
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("cart") === "open") {
      setIsCartSidebarOpen(true);
      // Clean up the URL without triggering a page reload
      router.replace("/customer/products", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.name || payload.email || "Customer");
      
      const savedCart = localStorage.getItem("pendingReorderCart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
        localStorage.removeItem("pendingReorderCart");
        toast.info("Previous order items added to cart!");
      }
    } catch (e) {
      console.error("Invalid token or cart data");
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/read`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const updateCart = (product, delta) => {
    setCart((prev) => {
      const currentQty = prev[product.id]?.cartQuantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[product.id];
      } else {
        newCart[product.id] = { ...product, cartQuantity: newQty };
      }
      return newCart;
    });
  };

  const setExactCartItem = (product, qty) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (qty <= 0) {
        delete newCart[product.id];
      } else {
        newCart[product.id] = { ...product, cartQuantity: qty };
      }
      return newCart;
    });
    
    if (qty <= 0) {
      toast.info(`Removed ${product.product_name} from cart`);
    } else {
      toast.success(`Updated ${product.product_name} in cart`);
    }
    
    setInputValues(prev => {
      const newVals = { ...prev };
      delete newVals[product.id];
      return newVals;
    });
  };

  const submitOrder = async () => {
    const items = Object.values(cart);
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        date: new Date().toISOString().split('T')[0],
        bill_no: `ORD-${Date.now().toString().slice(-6)}`,
        customer_name: userName, // Using logged in customer name
        driver_name: "N/A", // Admin will fill this
        vehicle_no: "N/A",
        lr_number: "N/A",
        transporter_name: "N/A",
        items: items.map(i => ({
          product_code: i.product_code || "",
          product_name: i.product_name,
          gradation: i.gradation,
          quantity: i.cartQuantity
        }))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer-orders/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Order placed successfully!");
        setCart({});
        setIsCartSidebarOpen(false);
        router.push("/customer/orders");
      } else {
        toast.error(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while placing the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.gradation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getSlidingPages = () => {
    const visibleCount = 5;

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

  const cartItemsCount = Object.keys(cart).length;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-12 pt-6 px-2 sm:px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 mt-1 font-medium">Browse our products and place your order.</p>
        </div>
        
        {cartItemsCount > 0 && (
          <button 
            onClick={() => setIsCartSidebarOpen(true)}
            className="px-6 py-3 bg-[#212121] text-[#EADBC8] font-bold rounded-xl shadow-lg shadow-black/20 hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            View Cart ({cartItemsCount})
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <input
          type="text"
          placeholder="Search products by name or gradation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Loading catalog...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left">#</th>
                  <th className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left">Product Name</th>
                  <th className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left">Gradation</th>
                  <th className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left">Available Stock</th>
                  <th className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentProducts.map((product, idx) => {
                  const inCart = cart[product.id]?.cartQuantity || 0;
                  const isLowStock = product.quantity > 0 && product.quantity <= 10;
                  const outOfStock = product.quantity === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 sm:px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                        {indexOfFirstItem + idx + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">{product.product_name}</span>
                          {isLowStock && <span className="bg-red-100 text-red-600 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">Only {product.quantity} left!</span>}
                          {outOfStock && <span className="bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">Out of Stock</span>}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-slate-600 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {product.gradation}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-slate-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {product.quantity} {product.unit || 'Pieces'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex justify-center items-center gap-2">
                          {(() => {
                            const rawVal = inputValues[product.id] !== undefined ? inputValues[product.id] : (inCart || "");
                            const qtyNum = parseInt(rawVal) || 0;
                            const isOverStock = qtyNum > product.quantity;

                            return (
                              <>
                                <input 
                                  type="number"
                                  disabled={outOfStock}
                                  value={rawVal}
                                  onChange={(e) => setInputValues(prev => ({ ...prev, [product.id]: e.target.value }))}
                                  placeholder="0"
                                  className={`w-16 px-2 py-1.5 border rounded-lg text-center font-bold focus:outline-none [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none transition-colors ${
                                    isOverStock ? 'border-red-500 text-red-600 bg-red-50' : 'border-slate-300 text-slate-800'
                                  }`}
                                />
                                <button 
                                  onClick={() => setExactCartItem(product, qtyNum)}
                                  disabled={outOfStock || isOverStock || (qtyNum === inCart && qtyNum > 0) || (qtyNum === 0 && inCart === 0)}
                                  className="px-4 py-1.5 bg-[#212121] hover:bg-[#444444] disabled:opacity-50 text-[#EADBC8] text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-sm min-w-[110px]"
                                >
                                  {inCart > 0 ? (qtyNum === 0 ? "Remove" : "Update Cart") : "Add to Cart"}
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer"
                >
                  &lt;
                </button>

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

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
      )}
      
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 font-medium">No products found matching your search.</p>
        </div>
      )}

      {/* Cart Sidebar Drawer */}
      {isCartSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartSidebarOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="text-[#C19A6B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Order Cart
              </h2>
              <button onClick={() => setIsCartSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              {Object.values(cart).length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-slate-500 font-medium">Your cart is empty.</p>
                </div>
              ) : (
                Object.values(cart).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col gap-3 group">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800">{item.product_name}</h4>
                        <p className="text-xs font-semibold text-slate-500">{item.gradation}</p>
                      </div>
                      <button 
                        onClick={() => setExactCartItem(item, 0)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Remove Item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setExactCartItem(item, Math.max(0, item.cartQuantity - 1))}
                          className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >-</button>
                        <span className="font-black text-slate-800 w-8 text-center">{item.cartQuantity}</span>
                        <button 
                          onClick={() => {
                            const prod = products.find(p => p.id === item.id);
                            if (prod && item.cartQuantity >= prod.quantity) {
                              toast.error(`Only ${prod.quantity} available in stock!`);
                              return;
                            }
                            setExactCartItem(item, item.cartQuantity + 1);
                          }}
                          className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Place Order Button */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white pb-safe">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-500">Total Items:</span>
                <span className="text-xl font-black text-slate-800">{Object.values(cart).reduce((sum, item) => sum + item.cartQuantity, 0)}</span>
              </div>
              <button 
                onClick={submitOrder}
                disabled={isSubmitting || Object.keys(cart).length === 0}
                className="w-full py-4 bg-[#212121] text-[#EADBC8] hover:bg-[#444444] font-black rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Confirm & Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerProducts() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400 font-medium">Loading catalog...</div>}>
      <CustomerProductsContent />
    </Suspense>
  );
}
