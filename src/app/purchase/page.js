"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useRoleCheck from "../hooks/useRoleCheck";
import Select from "react-select";
import { toast } from "react-toastify";
import Topbar from "../components/Topbar";

export default function Purchases() {
  useRoleCheck(["super admin", "admin", "purchase"]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPurchaseId, setCurrentPurchaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bill_no: "",
    vehicle_no: "",
    driver_number: "",
    gradation: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSavingProducts, setIsSavingProducts] = useState(false);
  // Header Data (For Modal)
  const [formData, setFormData] = useState({
    date: "",
    bill_no: "",
    vehicle_no: "",
    driver_name: "",
    driver_number: "",
    transporter_name: "",
    lr_number: "",
    party_name: "",
  });

  // View Details Logic
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewPurchase, setViewPurchase] = useState(null);

  // Expanded Row Items Logic
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);

  // Receive Items Logic
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyReceipts, setHistoryReceipts] = useState([]);
  const [historyPurchase, setHistoryPurchase] = useState(null);
  const [receivePurchase, setReceivePurchase] = useState(null);
  const [receiveItems, setReceiveItems] = useState([]);
  const [isReceiving, setIsReceiving] = useState(false);

  // Party Logic
  const [purchaseParties, setPurchaseParties] = useState([]);

  // Modals & Loaders
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // WhatsApp States
  const [billActionModalOpen, setBillActionModalOpen] = useState(false);
  const [whatsappInputModalOpen, setWhatsappInputModalOpen] = useState(false);
  const [whatsappProgressModalOpen, setWhatsappProgressModalOpen] = useState(false);
  const [whatsappProgress, setWhatsappProgress] = useState(0);
  const [whatsappProgressText, setWhatsappProgressText] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("91");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [pendingBillData, setPendingBillData] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState({ isReady: false, qrCode: null });
  const [isCheckingWhatsapp, setIsCheckingWhatsapp] = useState(false);
  const [isSendingBill, setIsSendingBill] = useState(false);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/read`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setPurchases(data.data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/read`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const fetchPurchaseParties = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/party/read?type=purchase`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      if (data.success) setPurchaseParties(data.data);
    } catch (e) {
      console.error("Error fetching purchase parties:", e);
    }
  };

  const handleViewHistory = async (purchase) => {
    setHistoryPurchase(purchase);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase/receipts/${purchase.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistoryReceipts(data.data);
        setIsHistoryModalOpen(true);
      } else {
        toast.error("Failed to fetch history");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching history");
    }
  };

  const handleReceiveItems = async () => {
    if (!receivePurchase) return;
    const itemsToReceive = receiveItems.filter(i => parseInt(i.receive_qty) > 0);
    if (itemsToReceive.length === 0) {
      toast.error("Please enter a quantity to receive.");
      return;
    }

    setIsReceiving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase/receive/${receivePurchase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ items: itemsToReceive }),
      });
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error("Server returned a non-JSON response. Ensure the backend server is restarted and running.");
      }

      if (data.success) {
        toast.success(data.message);
        fetchPurchases();
        fetchProducts();
        setIsReceiveModalOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsReceiving(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    Promise.all([
      fetchPurchases(),
      fetchProducts(),
      fetchPurchaseParties(),
    ]).then(() => setLoading(false));
  }, []);

  const handleOpenModal = (purchase = null) => {
    if (purchase) {
      setCurrentPurchaseId(purchase.id);
      setFormData({
        date: new Date(purchase.date).toISOString().split("T")[0],
        bill_no: purchase.bill_no,
        party_name: purchase.party_name || "",
        vehicle_no: purchase.vehicle_no || "",
        driver_name: purchase.driver_name || "",
        driver_number: purchase.driver_number || "",
        transporter_name: purchase.transporter_name || "",
        lr_number: purchase.lr_number || "",
        items: purchase.items || [],
      });
    } else {
      setCurrentPurchaseId(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        bill_no: "",
        party_name: "",
        vehicle_no: "",
        driver_name: "",
        driver_number: "",
        transporter_name: "",
        lr_number: "",
        items: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPurchaseId(null);
  };

  // Expanded Items Handlers
  const toggleItemsExpansion = (purchase) => {
    if (expandedRowId === purchase.id) {
      setExpandedRowId(null);
      setExpandedItems([]);
    } else {
      setExpandedRowId(purchase.id);
      const itemsLoaded =
        purchase.items && purchase.items.length > 0
          ? purchase.items.map((i) => {
            const prod = products.find(
              (p) => p.product_code === i.product_code,
            );
            return { ...i, unit: prod?.unit || "Kg", isEditing: false };
          })
          : purchase.product_code
            ? [
              {
                product_code: purchase.product_code,
                product_name: purchase.product_name,
                gradation: "",
                quantity: purchase.quantity,
                unit:
                  products.find(
                    (p) => p.product_code === purchase.product_code,
                  )?.unit || "Kg",
                isEditing: false,
              },
            ]
            : [];

      // Always ensure there is one default product entry box visible at the end
      itemsLoaded.push({
        product_code: "",
        product_name: "",
        gradation: "",
        quantity: "",
        unit: "Kg",
        isEditing: true,
      });

      setExpandedItems(itemsLoaded);
    }
  };

  const addExpandedItemRow = () => {
    setExpandedItems([
      ...expandedItems,
      {
        product_code: "",
        product_name: "",
        gradation: "",
        quantity: "",
        unit: "Kg",
        isEditing: true,
      },
    ]);
  };

  const removeExpandedItemRow = (index) => {
    const newItems = expandedItems.filter((_, i) => i !== index);
    setExpandedItems(newItems);
  };

  const handleExpandedItemChange = (index, field, value) => {
    const newItems = [...expandedItems];
    newItems[index][field] = value;

    if (field === "product_code") {
      const selectedProd = products.find((p) => p.product_code === value);
      if (selectedProd) {
        newItems[index].product_name = selectedProd.product_name;
        newItems[index].gradation = selectedProd.gradation;
        newItems[index].unit = selectedProd.unit || "Kg";
      }
    }
    setExpandedItems(newItems);
  };

  const handleSaveExpandedItems = async (purchase) => {
    // Prevent listing when completed
    if (purchase.status === "completed") {
      toast.error(
        "Status Completed, You Cannot Add"
      );
      return;
    }

    setIsSavingProducts(true); // 👈
    const rawItems = expandedItems.filter(
      (i) => i.product_code && i.quantity > 0,
    );

    // Merge same product + same gradation
    const mergedMap = {};

    rawItems.forEach((item) => {
      const key = `${item.product_code}_${item.gradation}`;

      if (mergedMap[key]) {
        mergedMap[key].quantity =
          Number(mergedMap[key].quantity) + Number(item.quantity);
      } else {
        mergedMap[key] = {
          ...item,
          quantity: Number(item.quantity),
        };
      }
    });

    const validItems = Object.values(mergedMap);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid product");
      setIsSavingProducts(false);
      return;
    }

    // Stock Validation for Purchase Update
    const aggregatedNewQuantities = {};
    for (const item of validItems) {
      const q = Number(item.quantity) || 0;
      aggregatedNewQuantities[item.product_code] = (aggregatedNewQuantities[item.product_code] || 0) + q;
    }

    const oldItems = purchase.items || [];
    const oldQuantityMap = {};
    for (const old of oldItems) {
      oldQuantityMap[old.product_code] = (oldQuantityMap[old.product_code] || 0) + (Number(old.quantity) || 0);
    }

    for (const code in aggregatedNewQuantities) {
      const totalNewQty = aggregatedNewQuantities[code];
      const product = products.find(p => p.product_code === code);
      const oldQty = oldQuantityMap[code] || 0;

      if (product) {
        const virtualStock = (product.quantity || 0) - oldQty;
        if (virtualStock + totalNewQty < 0) {
          toast.error(`Cannot update purchase for ${product.product_name} (${code}). Current stock (${product.quantity}) minus old quantity (${oldQty}) would be negative.`);
          setIsSavingProducts(false);
          return;
        }
      }
    }

    try {
      const submissionData = {
        date: purchase.date,
        bill_no: purchase.bill_no,
        party_name: purchase.party_name,
        vehicle_no: purchase.vehicle_no,
        driver_name: purchase.driver_name,
        driver_number: purchase.driver_number,
        transporter_name: purchase.transporter_name,
        lr_number: purchase.lr_number,
        items: validItems,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/update/${purchase.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(submissionData),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Products saved successfully!");
        fetchPurchases();
        fetchProducts();
        setExpandedRowId(null);
        setExpandedItems([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving items:", error);
      toast.error("Failed to save products");
    } finally {
      setIsSavingProducts(false); // 👈
    }
  };

  const handleDelete = (id) => {
    setPurchaseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!purchaseToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/delete/${purchaseToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Purchase record deleted!");
        fetchPurchases();
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Error deleting purchase:", e);
      toast.error("Failed to delete purchase");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        items: currentPurchaseId ? formData.items : [],
      };
      const url = currentPurchaseId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/update/${currentPurchaseId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/create`;
      const method = currentPurchaseId ? "PUT" : "POST";

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
        toast.success(
          currentPurchaseId
            ? "Purchase updated successfully!"
            : "Purchase added successfully!",
        );
        await fetchPurchases();
        fetchProducts();
        handleCloseModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast.error("Failed to save purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    // Check purchase items gradation
    const hasMatchingGradation =
      !filters.gradation ||
      (
        p.items &&
        p.items.some((item) =>
          (item.gradation || "")
            .toLowerCase()
            .includes(filters.gradation.toLowerCase())
        )
      ) ||
      (
        p.gradation &&
        p.gradation
          .toLowerCase()
          .includes(filters.gradation.toLowerCase())
      );

    return (
      hasMatchingGradation &&
      p.bill_no
        ?.toLowerCase()
        .includes(filters.bill_no.toLowerCase()) &&
      (p.vehicle_no || "")
        .toLowerCase()
        .includes(filters.vehicle_no.toLowerCase()) &&
      (p.driver_number || "")
        .toLowerCase()
        .includes(filters.driver_number.toLowerCase())
    );
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

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

  const handleBillClick = (purchase) => {
    setPendingBillData(purchase);
    setBillActionModalOpen(true);
  };

  const initiateWhatsApp = async () => {
    if (!whatsappPhone) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    
    setIsSendingBill(true);
    setWhatsappProgress(10);
    setWhatsappProgressText("Generating PDF...");

    const htmlContent = generateInvoiceHtml(pendingBillData);

    let pdfBase64 = "";
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.createElement("div");
      element.innerHTML = htmlContent;
      const opt = {
        margin:       0.5,
        filename:     `PurchaseInvoice_${pendingBillData.bill_no}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      const pdfDataUri = await html2pdf().from(element).set(opt).outputPdf('datauristring');
      pdfBase64 = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1);
    } catch (e) {
      console.error("Error generating PDF locally:", e);
      toast.error("Failed to generate PDF");
      setIsSendingBill(false);
      setWhatsappProgress(0);
      return;
    }

    await new Promise(r => setTimeout(r, 600));

    setWhatsappProgress(40);
    setWhatsappProgressText("Sending via WhatsApp Server...");

    const formattedDate = pendingBillData?.date ? new Date(pendingBillData.date).toLocaleDateString("en-GB") : "";
    const supplierName = pendingBillData?.party_name || "Valued Supplier";
    const textToShare = `Hello ${supplierName},\n\nGreetings from *Micara Laminate*! 🌟\n\nWe have successfully processed a Purchase Order with your esteemed company.\n\n🧾 *Order Details:*\n▪️ *PO No:* #${pendingBillData?.bill_no}\n▪️ *Date:* ${formattedDate}\n\nPlease find the official purchase order document attached below. 📎\n\nWe appreciate your continued partnership and prompt service.\n\nWarm regards,\n*Micara Laminate*\n_Where Premium Surfaces Meet Timeless Elegance_`;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send-bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: whatsappPhone,
          pdfBase64: pdfBase64,
          fileName: `PurchaseInvoice_${pendingBillData.bill_no}`,
          message: textToShare
        })
      });
      const data = await res.json();
      
      setWhatsappProgress(80);
      setWhatsappProgressText("Finalizing...");

      await new Promise(r => setTimeout(r, 600));

      if(data.success) {
        setWhatsappProgress(100);
        setWhatsappProgressText("Sent successfully!");
        
        setTimeout(() => {
           setWhatsappInputModalOpen(false);
           setIsSendingBill(false);
           setPendingBillData(null);
           setWhatsappPhone("91");
           setWhatsappProgress(0);
        }, 1500);
      } else {
        toast.error(data.message || "Failed to send PDF");
        setTimeout(() => {
          setIsSendingBill(false);
          setWhatsappProgress(0);
        }, 800);
      }
    } catch(err) {
      console.error(err);
      toast.error(err.message || "Error generating bill");
      setIsSendingBill(false);
      setWhatsappProgress(0);
    }
  };

  const generateInvoiceHtml = (purchase) => {
    let totalKg = 0;
    let totalPieces = 0;
    const gradationTotals = {};

    let rowIndex = 1;

    // SORT ITEMS BY PRODUCT NAME (A-Z)
    const sortedItems = [...(purchase.items || [])].sort((a, b) => {
      const nameA = (a.product_name || "").toUpperCase();
      const nameB = (b.product_name || "").toUpperCase();
      return nameA.localeCompare(nameB);
    });

    const itemsHtml = sortedItems
      .map((item) => {

        const prod = products.find(
          (p) => p.product_code === item.product_code
        );

        const unit = prod?.unit || "Kg";

        const qty = Number(item.quantity) || 0;

        const gradation = item.gradation || "N/A";

        if (unit.toLowerCase() === "kg") {
          totalKg += qty;
        } else {
          totalPieces += qty;
        }

        if (!gradationTotals[gradation]) {
          gradationTotals[gradation] = {
            kg: 0,
            pieces: 0,
          };
        }

        if (unit.toLowerCase() === "kg") {
          gradationTotals[gradation].kg += qty;
        } else {
          gradationTotals[gradation].pieces += qty;
        }

        return `
      <tr>
        <td>${rowIndex++}</td>
        <td>${item.product_code}</td>
        <td>${item.product_name}</td>
        <td>${gradation}</td>
        <td>${qty} ${unit}</td>
      </tr>
    `;
      })
      .join("");

    const gradationSummaryHtml = Object.keys(gradationTotals)
      .map((grad) => {
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
      })
      .join("");

    return `
      <html>
      <head>
        <title>Purchase Order - ${purchase.bill_no}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 10px; color: #1e293b; background: #f1f5f9; }
          .invoice-box { max-width: 800px; margin: auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
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
              <h2>Purchase Order</h2>
              <p><strong>Date:</strong> ${new Date(purchase.date).toLocaleDateString("en-GB")}</p>
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
              <p><strong>Supplier:</strong> ${purchase.party_name || "N/A"}</p>
              <p><strong>Bill No:</strong> ${purchase.bill_no}</p>
              <p><strong>Vehicle No:</strong> ${purchase.vehicle_no || "N/A"}</p>
              <p><strong>Driver Name:</strong> ${purchase.driver_name || "N/A"}</p>
              <p><strong>Driver No:</strong> ${purchase.driver_number || "N/A"}</p>
              <p><strong>Transporter:</strong> ${purchase.transporter_name || "N/A"}</p>
              <p><strong>LR No:</strong> ${purchase.lr_number || "N/A"}</p>
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
          <style>
            @media print { .no-print { display: none !important; } }
          </style>
          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
            <button onclick="window.print()" style="background: #212121; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              🖨️ Print Invoice
            </button>
          </div>
        </body>
      </html>
    `;
  };

  const printInvoice = (purchase) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site to generate the bill.");
      return;
    }
    const htmlContent = generateInvoiceHtml(purchase);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleStatusChange = async (purchaseId, status) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/update-status/${purchaseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Status updated successfully");

        fetchPurchases();
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Status update error:", error);

      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 overflow-x-auto scrollbar-hide">
        <Topbar
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
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
              Add Purchase
            </button>
          }
        />
        <div className="p-4 md:p-8 topbar-offset mt-4">

          <>
            {/* <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Purchases</h1>
                {/* <p className="text-sm text-slate-500 mt-1">Manage inbound inventory and supply entries</p> 
              </div>

              {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">

              <input
                type="text"
                placeholder="Filter by Grdations..."
                value={filters.gradation}
                onChange={(e) =>
                  setFilters({ ...filters, gradation: e.target.value })
                }
                className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
              />

              <input
                type="text"
                placeholder="Filter by Bill No..."
                value={filters.bill_no}
                onChange={(e) =>
                  setFilters({ ...filters, bill_no: e.target.value })
                }
                className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#EADBC8]"
              />
              <input
                type="text"
                placeholder="Filter by Vehicle No..."
                value={filters.vehicle_no}
                onChange={(e) =>
                  setFilters({ ...filters, vehicle_no: e.target.value })
                }
                className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
              />
              <input
                type="text"
                placeholder="Filter by Driver No..."
                value={filters.driver_number}
                onChange={(e) =>
                  setFilters({ ...filters, driver_number: e.target.value })
                }
                className="flex-1 min-w-[150px] px-4 py-2 border border-[#EADBC8] rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-[#D2A185]"
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-w-full overflow-hidden flex flex-col">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 font-semibold w-16 text-center whitespace-nowrap">
                        ID
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Bill No
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Date
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Supplier
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">
                        Vehicle No
                      </th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                        Status
                      </th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                        Items
                      </th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap text-center">
                        Created At
                      </th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                        Created By
                      </th>
                      <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                        Actions
                      </th>
                      <th className="py-3 px-4 font-semibold text-center text-blue-600 whitespace-nowrap">
                        Bill
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPurchases.map((p, index) => (
                      <React.Fragment key={p.id}>
                        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                          <td className="py-1.5 px-4 text-center text-slate-600 font-medium whitespace-nowrap">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="py-1.5 px-4 text-slate-800 font-medium">
                            {p.bill_no}
                          </td>
                          <td className="py-1.5 px-4 text-slate-800">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="py-1.5 px-4 font-bold text-slate-800">
                            {p.party_name || "-"}
                          </td>
                          <td className="py-1.5  px-4 text-slate-600">
                            {p.vehicle_no || "-"}
                          </td>
                          <td className="py-1.5 px-1 text-center">
                            <select
                              value={p.status || "pending"}
                              onChange={(e) =>
                                handleStatusChange(p.id, e.target.value)
                              }
                              className={`px-1 py-1 rounded-lg text-xs font-semibold outline-none cursor-pointer
                               ${p.status === "pending"
                                  ? "bg-gray-200 text-black"
                                  : p.status === "stock_in"
                                    ? "bg-blue-50 text-blue-700 border-blue-300"
                                    : "bg-green-50 text-green-700 border-green-300"
                                }
                               `}>
                              {/* Pending */}
                              <option value="pending"
                                disabled={p.status !== "pending"}>
                                Pending
                              </option>

                              {/* Stock In */}
                              <option 
                                value="stock_in" 
                                disabled={p.status === "completed" || (p.items && p.items.some(i => (Number(i.received_quantity) || 0) < Number(i.quantity)))}
                              >
                                Stock In
                              </option>

                              {/* Completed */}
                              <option 
                                value="completed"
                                disabled={p.items && p.items.some(i => (Number(i.received_quantity) || 0) < Number(i.quantity))}
                              >
                                Completed
                              </option>
                            </select>
                          </td>
                          <td className="py-1.5  px-4 text-orange-600 font-medium text-center">
                            {p.items_count || (p.product_code ? 1 : 0)}
                          </td>
                          <td className="py-1.5 px-4 text-slate-500 text-xs text-center whitespace-nowrap">
                            {p.created_at
                              ? new Date(p.created_at).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                              : "-"}
                          </td>
                          <td className="py-1.5 px-4 text-slate-600 font-medium text-center whitespace-nowrap">
                            {p.created_by || "-"}
                          </td>
                          <td className="py-1.5 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  if (p.status === "completed") {
                                    toast.error("Completed purchase cannot be modified!");
                                    return;
                                  }

                                  toggleItemsExpansion(p);
                                }}
                                className="flex items-center justify-center w-7 h-7 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                              >
                                {expandedRowId === p.id ? "-" : "+"}
                              </button>
                              <button
                                onClick={() => {
                                  let filteredItems = p.items || [];

                                  // If gradation filter applied
                                  if (filters.gradation) {
                                    filteredItems = filteredItems.filter((item) =>
                                      (item.gradation || "")
                                        .toLowerCase()
                                        .includes(filters.gradation.toLowerCase())
                                    );
                                  }

                                  setViewPurchase({
                                    ...p,
                                    items: filteredItems,
                                  });

                                  setIsViewModalOpen(true);
                                }}
                                title="View Details"
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg transition-colors cursor-pointer"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                disabled={p.status === "completed"}
                                onClick={() => handleOpenModal(p)}
                                title="Edit"
                                className={`p-2 rounded-lg transition-colors cursor-pointer
                                  ${p.status === "completed"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                  }
                                `}
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
                                disabled={p.status === "completed" || p.status === "stock_in"}
                                onClick={() => {
                                  setReceivePurchase(p);
                                  setReceiveItems(p.items ? p.items.map(i => ({...i, receive_qty: ""})) : []);
                                  setIsReceiveModalOpen(true);
                                }}
                                title="Receive Items"
                                className={`p-2 rounded-lg transition-colors cursor-pointer
                                  ${p.status === "completed" || p.status === "stock_in"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-purple-50 hover:bg-purple-100 text-purple-600"
                                  }
                                `}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                              </button>
                              <button
                                disabled={p.status === "completed"}
                                onClick={() => handleDelete(p.id)}
                                title="Delete"
                                className={`p-2 bg-red-50 hover:bg-red-100 cursor-pointer
                                ${p.status === "completed"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                  }
                                 text-red-500 rounded-lg transition-colors`}
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
                          <td className="py-1.5 px-4 text-center">
                            {p.status === "completed" ? (
                              <button
                                onClick={() => handleBillClick(p)}
                                className="flex items-center justify-center mx-auto gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 font-semibold rounded-lg transition-colors text-xs cursor-pointer"
                                title="Generate Bill"
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Bill
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium mx-3">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>

                        {expandedRowId === p.id && (
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <td colSpan="9" className="p-0">
                              <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-200 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-slate-800">
                                    Add Products (Bill: {p.bill_no})
                                  </h4>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                  <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                    {expandedItems.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-end gap-3 py-1.5 border-b border-slate-100 last:border-0"
                                      >
                                        {!item.isEditing ? (
                                          <div className="flex-1 flex justify-between items-center text-slate-700">
                                            <div>
                                              <p className="font-semibold">
                                                {item.product_name ||
                                                  item.product_code}
                                              </p>
                                              <p className="text-xs text-slate-500">
                                                Gradation:{" "}
                                                {item.gradation || "N/A"}
                                              </p>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                              <div className="flex gap-2 text-xs">
                                                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-semibold text-center">
                                                  Ordered<br/><span className="text-sm font-bold">{item.quantity}</span>
                                                </div>
                                                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 font-semibold text-center">
                                                  Received<br/><span className="text-sm font-bold">{item.received_quantity || 0}</span>
                                                </div>
                                                <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded text-rose-700 font-semibold text-center">
                                                  Pending<br/><span className="text-sm font-bold">{Math.max(0, item.quantity - (item.received_quantity || 0))}</span>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleExpandedItemChange(
                                                    idx,
                                                    "isEditing",
                                                    true,
                                                  )
                                                }
                                                className="text-blue-500 hover:text-blue-700 text-sm font-semibold flex gap-1 items-center px-2 py-1 transition cursor-pointer"
                                              >
                                                <i>✏️</i> Edit
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeExpandedItemRow(idx)
                                                }
                                                className="text-red-500 hover:text-red-700 px-2 py-1 transition font-bold cursor-pointer"
                                              >
                                                Drop
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex-1">
                                              <label className="block text-xs font-bold text-slate-600 mb-1">
                                                Select Product
                                              </label>
                                              <Select
                                                options={products.map(
                                                  (prod) => {
                                                    return {
                                                      value: prod.product_code,
                                                      label: `${prod.product_name} (${prod.gradation}) - [Stock: ${prod.quantity || 0}]`,
                                                    };
                                                  }
                                                )}
                                                value={
                                                  item.product_code
                                                    ? {
                                                      value:
                                                        item.product_code,
                                                      label: `${item.product_name || item.product_code} (${item.gradation || ""})`,
                                                    }
                                                    : null
                                                }
                                                onChange={(selectedOption) =>
                                                  handleExpandedItemChange(
                                                    idx,
                                                    "product_code",
                                                    selectedOption
                                                      ? selectedOption.value
                                                      : "",
                                                  )
                                                }
                                                placeholder="Search Product..."
                                                className=" cursor-pointer"
                                                menuPosition="fixed"
                                                styles={{
                                                  control: (base, state) => ({
                                                    ...base,
                                                    padding: "2px",
                                                    borderRadius: "0.5rem",

                                                    // ✅ new border color
                                                    borderColor: "#D2A185",

                                                    // ❌ focus ring remove
                                                    boxShadow: "none",
                                                    outline: "none",

                                                    // same border on hover
                                                    "&:hover": {
                                                      borderColor: "#D2A185",
                                                    },
                                                  }),
                                                  menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                  }),
                                                  menu: (base) => ({
                                                    ...base,
                                                    backgroundColor: "#f9fafb",
                                                  }),

                                                  menuList: (base) => ({
                                                    ...base,
                                                    backgroundColor: "#f9fafb",
                                                  }),

                                                  option: (base, state) => ({
                                                    ...base,
                                                    backgroundColor: state.isSelected
                                                      ? "#e5e7eb"
                                                      : state.isFocused
                                                        ? "#f3f4f6"
                                                        : "#f9fafb",
                                                    color: "#6b7280",
                                                  }),
                                                }}
                                                menuPortalTarget={
                                                  typeof document !==
                                                    "undefined"
                                                    ? document.body
                                                    : null
                                                }
                                                isClearable
                                              />
                                            </div>
                                            <div className="w-1/4">
                                              <label className="block text-xs font-bold text-slate-600 mb-1">
                                                Quantity ({item.unit || "Kg"}){" "}
                                                {item.product_code && (
                                                  <span className={`font-normal ml-1 ${(() => {
                                                    const totalNewQty = expandedItems
                                                      .filter(i => i.product_code === item.product_code)
                                                      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
                                                    const product = products.find(prod => prod.product_code === item.product_code);
                                                    const isStockAdded = p.status === 'stock_in' || p.status === 'completed';
                                                    const oldQty = isStockAdded ? (p.items || [])
                                                      .filter(oi => oi.product_code === item.product_code)
                                                      .reduce((sum, oi) => sum + (Number(oi.quantity) || 0), 0) : 0;
                                                    const virtualStock = (product?.quantity || 0) - oldQty;
                                                    return virtualStock + totalNewQty < 0 ? "text-red-500 font-bold" : "text-blue-500";
                                                  })()
                                                    }`}>
                                                    (Stock: {products.find(prod => prod.product_code === item.product_code)?.quantity || 0})
                                                  </span>
                                                )}
                                              </label>
                                              <input
                                                type="number"
                                                min="1"
                                                required
                                                value={item.quantity}
                                                onChange={(e) =>
                                                  handleExpandedItemChange(
                                                    idx,
                                                    "quantity",
                                                    parseInt(
                                                      e.target.value,
                                                    ) || "",
                                                  )
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    e.preventDefault();

                                                    // Stock check for Purchase reduction
                                                    const totalNewQty = expandedItems
                                                      .filter(i => i.product_code === item.product_code)
                                                      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
                                                    const product = products.find(prod => prod.product_code === item.product_code);
                                                    const isStockAdded = p.status === 'stock_in' || p.status === 'completed';
                                                    const oldQty = isStockAdded ? (p.items || [])
                                                      .filter(oi => oi.product_code === item.product_code)
                                                      .reduce((sum, oi) => sum + (Number(oi.quantity) || 0), 0) : 0;
                                                    const virtualStock = (product?.quantity || 0) - oldQty;

                                                    if (virtualStock + totalNewQty < 0) {
                                                      toast.error(`Cannot reduce purchase this much! Product already sold.`);
                                                      return;
                                                    }

                                                    if (
                                                      item.product_code &&
                                                      item.quantity > 0
                                                    ) {
                                                      handleExpandedItemChange(
                                                        idx,
                                                        "isEditing",
                                                        false,
                                                      );
                                                      addExpandedItemRow();
                                                    }
                                                  }
                                                }}
                                                className={`w-full px-3 py-2.5 rounded-lg border text-black focus:outline-none focus:ring-0 bg-white ${(() => {
                                                  const totalNewQty = expandedItems
                                                    .filter(i => i.product_code === item.product_code)
                                                    .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
                                                  const product = products.find(prod => prod.product_code === item.product_code);
                                                  const isStockAdded = p.status === 'stock_in' || p.status === 'completed';
                                                  const oldQty = isStockAdded ? (p.items || [])
                                                    .filter(oi => oi.product_code === item.product_code)
                                                    .reduce((sum, oi) => sum + (Number(oi.quantity) || 0), 0) : 0;
                                                  const virtualStock = (product?.quantity || 0) - oldQty;
                                                  return virtualStock + totalNewQty < 0 ? "border-red-500 ring-1 ring-red-500" : "border-[#D2A185]";
                                                })()
                                                  }`}
                                                placeholder="Enter Qty (Press Enter)"
                                              />
                                            </div>
                                            <div className="flex items-end pb-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeExpandedItemRow(idx)
                                                }
                                                className="px-4 py-2.5 border border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 rounded-lg transition font-bold bg-white shadow-sm h-[46px] cursor-pointer"
                                              >
                                                ✕
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-end items-center mt-6 pt-5 border-t border-slate-100">
                                    <button
                                      type="button"
                                      disabled={
                                        isSavingProducts ||
                                        (() => {
                                          const validItems = expandedItems.filter(i => i.product_code && Number(i.quantity) > 0);
                                          const aggregatedNewQuantities = {};
                                          for (const item of validItems) {
                                            const q = Number(item.quantity) || 0;
                                            aggregatedNewQuantities[item.product_code] = (aggregatedNewQuantities[item.product_code] || 0) + q;
                                          }

                                          for (const code in aggregatedNewQuantities) {
                                            const totalNewQty = aggregatedNewQuantities[code];
                                            const product = products.find(prod => prod.product_code === code);
                                            const oldQty = (p.items || [])
                                              .filter(oi => oi.product_code === code)
                                              .reduce((sum, oi) => sum + (Number(oi.quantity) || 0), 0);
                                            const virtualStock = (product?.quantity || 0) - oldQty;
                                            if (virtualStock + totalNewQty < 0) return true;
                                          }
                                          return false;
                                        })()
                                      }
                                      onClick={() => handleSaveExpandedItems(p)}
                                      className={`px-8 py-2.5 rounded-lg font-bold transition shadow-md cursor-pointer ${isSavingProducts ||
                                        (() => {
                                          const validItems = expandedItems.filter(i => i.product_code && Number(i.quantity) > 0);
                                          const aggregatedNewQuantities = {};
                                          for (const item of validItems) {
                                            const q = Number(item.quantity) || 0;
                                            aggregatedNewQuantities[item.product_code] = (aggregatedNewQuantities[item.product_code] || 0) + q;
                                          }
                                          for (const code in aggregatedNewQuantities) {
                                            const totalNewQty = aggregatedNewQuantities[code];
                                            const product = products.find(prod => prod.product_code === code);
                                            const oldQty = (p.items || [])
                                              .filter(oi => oi.product_code === code)
                                              .reduce((sum, oi) => sum + (Number(oi.quantity) || 0), 0);
                                            const virtualStock = (product?.quantity || 0) - oldQty;
                                            if (virtualStock + totalNewQty < 0) return true;
                                          }
                                          return false;
                                        })()
                                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                        : "bg-black text-white hover:bg-gray-800 shadow-black/20"
                                        }`}
                                    >
                                      {isSavingProducts ? "Saving..." : "Save Products"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {filteredPurchases.length === 0 && (
                      <tr>
                        <td
                          colSpan="10"
                          className="py-8 text-center text-slate-500"
                        >
                          No purchases found.
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
                    <option value={20}>20</option>
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
                        className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${currentPage === page
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
            {/* edit */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                <div className="bg-white p-8 rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
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
                        {currentPurchaseId ? "Edit Purchase" : "Add Purchase"}
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
                    className="flex flex-col gap-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Date
                        </label>

                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className={`w-full border border-[#C19A6B] rounded-xl px-3 py-2 text-sm font-medium bg-white focus:outline-none ${formData.date ? "text-black" : "text-slate-400"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Bill No
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.bill_no}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bill_no: e.target.value,
                            })
                          }
                          placeholder="e.g. INV-2039"
                          className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white text-black placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Purchase Party
                        </label>

                        <select
                          value={formData.party_name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              party_name: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white ${!formData.party_name ? "text-slate-400" : "text-black"
                            }`}
                        >
                          <option value="" disabled className="text-slate-400">
                            -- Select Supplier --
                          </option>

                          {purchaseParties.map((p) => (
                            <option key={p.id} value={p.name} className="text-slate-400">
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Vehicle No
                        </label>
                        <input
                          type="text"
                          value={formData.vehicle_no}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicle_no: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none uppercase bg-white text-black placeholder-slate-400"
                          placeholder="e.g. GJ05 1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Driver Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.driver_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              driver_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white text-black placeholder-slate-400"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Driver No
                        </label>
                        <input
                          type="text"
                          value={formData.driver_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              driver_number: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white text-black placeholder-slate-400"
                          placeholder="e.g. 1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Transporter Name
                        </label>
                        <input
                          type="text"
                          value={formData.transporter_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              transporter_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white text-black placeholder-slate-400"
                          placeholder="e.g. ABC Logistics"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          LR Number
                        </label>
                        <input
                          type="text"
                          value={formData.lr_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lr_number: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-[#D2A185] focus:outline-none bg-white text-black placeholder-slate-400"
                          placeholder="e.g. LR-98765"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-5 py-2.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#212121] hover:bg-[#444444] text-white px-6 py-2.5 rounded-lg font-bold  transition  flex items-center disabled:opacity-70 cursor-pointer"
                      >
                        {isSubmitting && (
                          <svg
                            className="animate-spin h-4 w-4 mr-2 inline"
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
                        )}
                        {isSubmitting
                          ? "Saving..."
                          : currentPurchaseId
                            ? "Update Purchase"
                            : "Save Purchase"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}

            {isDeleteModalOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                  {/* HEADER */}
                  <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-[#212121] to-[#555555]">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                      Delete Purchase
                    </div>

                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="text-white text-lg  cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* BODY */}
                  <div className="p-6 text-center">
                    <p className="text-slate-600 text-sm mb-6">
                      Are you sure you want to delete this purchase? Inventory
                      will be reverted.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold  cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={executeDelete}
                        disabled={isDeleting}
                        className="w-full py-2 rounded-lg bg-[#212121] text-white font-semibold  cursor-pointer"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && viewPurchase && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                <div className="bg-white p-8 rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 
                bg-gradient-to-r from-[#2c2c2c] to-[#555555] 
                rounded-t-2xl -mx-8 -mt-8 mb-6">

                    {/* Left Side (Icon + Title) */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>

                      <h2 className="text-lg font-semibold text-white">
                        Purchase Order Details
                      </h2>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setViewPurchase(null);
                      }}
                      className="w-9 h-9 flex items-center justify-center text-white hover:text-gray-300 transition cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
                        General Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Date:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {new Date(viewPurchase.date).toLocaleDateString()}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Bill No:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.bill_no}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Supplier:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.party_name || "-"}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Created By:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.created_by || "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
                        Logistics Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Vehicle No:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.vehicle_no || "-"}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Driver Name:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.driver_name || "-"}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Driver No:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.driver_number || "-"}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500 w-32 inline-block">
                            Transporter Name:
                          </span>{" "}
                          <span className="font-medium text-slate-800">
                            {viewPurchase.transporter_name || "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-md font-bold text-slate-800 mb-3">
                    Products
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-4 font-semibold w-12 text-center">
                              #
                            </th>
                            <th className="py-2 px-4 font-semibold">
                              Product Code
                            </th>
                            <th className="py-2 px-4 font-semibold">
                              Product Name
                            </th>
                            <th className="py-2 px-4 font-semibold">
                              Gradation
                            </th>
                            <th className="py-2 px-4 font-semibold text-right">
                              Quantity
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewPurchase.items &&
                            viewPurchase.items.length > 0 ? (
                            <>
                              {viewPurchase.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                >
                                  <td className="py-2 px-4 text-center text-slate-500">
                                    {idx + 1}
                                  </td>

                                  <td className="py-2 px-4 font-medium">
                                    {item.product_code}
                                  </td>

                                  <td className="py-2 px-4 text-slate-600">
                                    {item.product_name}
                                  </td>

                                  <td className="py-2 px-4 text-slate-600">
                                    {item.gradation || "-"}
                                  </td>

                                  <td className="py-2 px-4 text-right font-bold text-slate-800">
                                    {item.quantity}
                                  </td>
                                </tr>
                              ))}

                              {/* TOTAL ROW */}
                              <tr className="bg-slate-100 border-t-2 border-slate-300">
                                <td
                                  colSpan="4"
                                  className="py-3 px-4 text-right font-bold text-slate-800"
                                >
                                  Total Quantity
                                </td>

                                <td className="py-3 px-4 text-right font-extrabold text-orange-600">
                                  {viewPurchase.items.reduce(
                                    (sum, item) => sum + (Number(item.quantity) || 0),
                                    0
                                  )}
                                </td>
                              </tr>
                            </>
                          ) : viewPurchase.product_code ? (
                            <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                              <td className="py-2 px-4 text-center text-slate-500">
                                1
                              </td>
                              <td className="py-2 px-4 font-medium">
                                {viewPurchase.product_code}
                              </td>
                              <td className="py-2 px-4 text-slate-600">
                                {viewPurchase.product_name || "-"}
                              </td>
                              <td className="py-2 px-4 text-slate-600">
                                {viewPurchase.gradation || "-"}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-slate-800">
                                {viewPurchase.quantity}
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="py-4 text-center text-slate-500"
                              >
                                No products found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* HISTORY MODAL */}
            {isHistoryModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 bg-[#212121] flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">Consignment History</h3>
                      <p className="text-slate-300 text-sm">Bill: {historyPurchase?.bill_no}</p>
                    </div>
                    <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white">
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {historyReceipts.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">No receipt history found for this bill.</div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-4 font-semibold">Date</th>
                            <th className="py-2 px-4 font-semibold">Product</th>
                            <th className="py-2 px-4 font-semibold">Gradation</th>
                            <th className="py-2 px-4 font-semibold text-right">Received Qty</th>
                            <th className="py-2 px-4 font-semibold text-center">Received By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyReceipts.map((receipt, i) => (
                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                              <td className="py-3 px-4 font-medium text-slate-700">{new Date(receipt.received_date).toLocaleString()}</td>
                              <td className="py-3 px-4 font-bold text-slate-800">{receipt.product_name}</td>
                              <td className="py-3 px-4 text-slate-600">{receipt.gradation || 'N/A'}</td>
                              <td className="py-3 px-4 text-right font-black text-emerald-600">{receipt.quantity_received}</td>
                              <td className="py-3 px-4 text-center text-slate-600">{receipt.received_by}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RECEIVE MODAL */}
            {isReceiveModalOpen && receivePurchase && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-slate-800">
                        Receive Delivery <span className="text-slate-500 text-sm font-normal ml-2">(Bill: {receivePurchase.bill_no})</span>
                      </h3>
                      <button
                        onClick={() => handleViewHistory(receivePurchase)}
                        title="View Consignment History"
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 text-sm font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        View History
                      </button>
                    </div>
                    <button
                      onClick={() => setIsReceiveModalOpen(false)}
                      className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-4 font-semibold">Product</th>
                          <th className="py-2 px-4 font-semibold text-center">Ordered</th>
                          <th className="py-2 px-4 font-semibold text-center">Received</th>
                          <th className="py-2 px-4 font-semibold text-center">Pending</th>
                          <th className="py-2 px-4 font-semibold text-center">Receive Now</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiveItems.map((item, idx) => {
                          const pending = Math.max(0, item.quantity - (item.received_quantity || 0));
                          return (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800">{item.product_name}</div>
                                <div className="text-xs text-slate-500">{item.gradation}</div>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-blue-600">{item.quantity}</td>
                              <td className="py-3 px-4 text-center font-bold text-emerald-500">{item.received_quantity || 0}</td>
                              <td className="py-3 px-4 text-center font-bold text-rose-500">{pending}</td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={item.receive_qty}
                                  onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, "");
                                    if (val !== "" && parseInt(val) > pending) {
                                      val = pending.toString();
                                    }
                                    const newItems = [...receiveItems];
                                    newItems[idx].receive_qty = val;
                                    setReceiveItems(newItems);
                                  }}
                                  disabled={pending === 0}
                                  className={`w-24 px-2 py-1 border rounded text-center focus:outline-none ${pending === 0 ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-bold text-right text-slate-700">Total:</td>
                          <td className="py-3 px-4 text-center font-black text-blue-600 text-base">
                            {receiveItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-emerald-500 text-base">
                            {receiveItems.reduce((acc, curr) => acc + (Number(curr.received_quantity) || 0), 0)}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-rose-500 text-base">
                            {receiveItems.reduce((acc, curr) => acc + Math.max(0, (Number(curr.quantity) || 0) - (Number(curr.received_quantity) || 0)), 0)}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-purple-600 text-base">
                            {receiveItems.reduce((acc, curr) => acc + (Number(curr.receive_qty) || 0), 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={() => setIsReceiveModalOpen(false)}
                      className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReceiveItems}
                      disabled={isReceiving}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      {isReceiving ? "Saving..." : "Save Delivery"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bill Action Modal */}
            {billActionModalOpen && pendingBillData && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Generate Bill</h2>
                  <p className="text-sm text-slate-500 mb-6">How would you like to process this bill?</p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setBillActionModalOpen(false);
                        printInvoice(pendingBillData);
                        setPendingBillData(null);
                      }}
                      className="w-full px-4 py-3 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Print / Download PDF
                    </button>
                    <button
                      onClick={async () => {
                        setIsCheckingWhatsapp(true);
                        const matchedParty = purchaseParties.find(p => p.name === pendingBillData?.party_name);
                        setWhatsappPhone(matchedParty?.phone || "91");
                        
                        // Initial check
                        const checkStatus = async () => {
                          try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/status`);
                            const data = await res.json();
                            if (data.success) {
                              setWhatsappStatus({ isReady: data.isReady, isAuthenticating: data.isAuthenticating, qrCode: data.qrCode });
                              return data;
                            }
                          } catch (e) {
                            console.error(e);
                          }
                          return null;
                        };

                        const initialData = await checkStatus();
                        setIsCheckingWhatsapp(false);
                        setBillActionModalOpen(false);
                        setWhatsappInputModalOpen(true);
                        
                        // If not ready, start polling
                        if (initialData && !initialData.isReady) {
                          const interval = setInterval(async () => {
                            const data = await checkStatus();
                            if (data && data.isReady) {
                              clearInterval(interval);
                            }
                          }, 2000);
                          
                          // Store interval to clear on close
                          window.whatsappPollInterval = interval;
                        }
                      }}
                      disabled={isCheckingWhatsapp}
                      className="w-full px-4 py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {isCheckingWhatsapp ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      )}
                      {isCheckingWhatsapp ? "Connecting..." : "Send via WhatsApp"}
                    </button>
                    <button onClick={() => setBillActionModalOpen(false)} className="mt-2 text-sm text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Input Modal (QR Code or Phone Number) */}
            {whatsappInputModalOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
                  {!whatsappStatus.isReady ? (
                    whatsappStatus.isAuthenticating ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <svg className="w-12 h-12 text-emerald-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Authenticating...</h2>
                        <p className="text-sm text-slate-500">Please wait while we link your WhatsApp account.</p>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">WhatsApp Login Required</h2>
                        <p className="text-sm text-slate-500 mb-4">Please scan the QR code with your WhatsApp to link the server.</p>
                        {whatsappStatus.qrCode ? (
                          <div className="flex justify-center mb-4">
                            <img src={whatsappStatus.qrCode} alt="WhatsApp QR Code" className="w-48 h-48 border rounded-lg p-2" />
                          </div>
                        ) : (
                          <p className="text-sm text-orange-500 mb-4 animate-pulse font-medium">Generating QR Code... Please wait a few seconds and try again.</p>
                        )}
                        <button onClick={() => {
                          if (window.whatsappPollInterval) clearInterval(window.whatsappPollInterval);
                          setWhatsappInputModalOpen(false);
                        }} className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">Close</button>
                      </>
                    )
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-slate-800 mb-2">Send WhatsApp Bill</h2>
                      <p className="text-sm text-slate-500 mb-4">Enter the supplier's WhatsApp number.</p>
                      
                      <div className="text-left mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Supplier</label>
                        <select 
                          value={purchaseParties.find(p => p.phone === whatsappPhone) ? whatsappPhone : "custom"}
                          onChange={(e) => {
                            if(e.target.value !== "custom") {
                              setWhatsappPhone(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium mb-3"
                        >
                          <option value="custom">-- Custom / Manual Entry --</option>
                          {purchaseParties.filter(p => p.phone).map(p => (
                            <option key={p.id} value={p.phone}>{p.name}</option>
                          ))}
                        </select>
                        
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number (with Country Code)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 919876543210" 
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => {
                            if (window.whatsappPollInterval) clearInterval(window.whatsappPollInterval);
                            setWhatsappInputModalOpen(false);
                          }} 
                          className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                          disabled={isSendingBill}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={initiateWhatsApp} 
                          disabled={isSendingBill || !whatsappPhone}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSendingBill ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                              Sending...
                            </>
                          ) : (
                            "Send Bill"
                          )}
                        </button>
                      </div>
                      
                      {/* Logout Button */}
                      <button 
                        onClick={async () => {
                          try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/logout`, { method: "POST" });
                            const data = await res.json();
                            if(data.success) {
                              toast.success("WhatsApp disconnected successfully! The system will restart the session.");
                              setWhatsappStatus({ isReady: false, isAuthenticating: false, qrCode: null });
                            } else {
                              toast.error(data.message);
                            }
                          } catch (e) {
                            toast.error("Failed to logout WhatsApp");
                          }
                        }}
                        className="mt-4 w-full px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                      >
                        Logout WhatsApp
                      </button>
                      
                      {isSendingBill && (
                        <div className="mt-6 text-left">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">{whatsappProgressText}</span>
                            <span className="text-xs font-bold text-emerald-500">{whatsappProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${whatsappProgress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}



            {/* WhatsApp Progress Modal */}
            {whatsappProgressModalOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{whatsappProgress === 100 ? "Sent Successfully!" : "Sending via WhatsApp"}</h3>
                  <p className="text-sm text-slate-500 mb-6">{whatsappProgressText}</p>
                  
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${whatsappProgress}%` }}></div>
                  </div>
                  <div className="text-xs font-semibold text-slate-400 text-right">{whatsappProgress}%</div>
                  
                  {whatsappProgress === 100 && (
                    <div className="mt-4 animate-in zoom-in text-emerald-500 flex justify-center">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>

        </div>
      </div>
    </div>
  );
}
