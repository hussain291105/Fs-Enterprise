'use client';

import { useEffect, useState } from "react";
import "./print.css";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";

// Add print styles directly to ensure they're applied
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      * {
        visibility: hidden !important;
      }
      .invoice-page,
      .invoice-page * {
        visibility: visible !important;
      }
      .invoice-page {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        max-width: 210mm !important;
        padding: 10mm !important;
        background: white !important;
        box-shadow: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default function PrintInvoice() {
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const withGST = searchParams?.get("gst") === "true";

  const [bill, setBill] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const billRes = await fetch(`/api/billing/${id}`);
        console.log("BILL DATA:", billRes);
        const billData = await billRes.json();

        const itemsRes = await fetch(`/api/billing/${id}/items`);
        const itemsData = await itemsRes.json();

        setBill(billData);
        setItems(itemsData);
      } catch (error) {
        console.error("Error fetching bill data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (bill && items.length > 0) {
      setTimeout(() => {
        window.print();
      }, 800); // wait for DOM render
    }
  }, [bill, items]);

  if (!bill) return <div style={{ padding: 20 }}>Loading invoice...</div>;

  const subtotal = items.reduce((s, i) => s + Number(i.total || 0), 0);
  const tax = withGST ? subtotal * 0.18 : 0;
  const total = subtotal + tax;

  return (
    <div className="invoice-page">

      {/* HEADER */}
      <div className="header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', color: '#0f3d2e', margin: '0 0 10px 0' }}>INVOICE</h1>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>INVOICE#: INV-{String(bill?.id || 0).padStart(4, "0")}</p>
        </div>

        <div className="customer" style={{ textAlign: 'right' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 10px 0' }}>CUSTOMER CONTACT</h3>
          <p style={{ fontSize: '12px', margin: '5px 0' }}><b>Name:</b> {bill.customerName || bill.customer_name || "N/A"}</p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}><b>Date:</b> 
            {bill?.bill_date
              ? new Date(bill.bill_date).toLocaleDateString()
              : bill?.billDate
              ? new Date(bill.billDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}><b>Phone:</b> {bill.phoneNumber || bill.phone_number || "N/A"}</p>
        </div>
      </div>

      {/* TAX */}
      <div className="tax" style={{
        marginTop: '20px',
        padding: '10px',
        background: '#f5f5f5',
        border: '1px solid #ddd'
      }}>
        <h4 style={{ fontSize: '14px', margin: '0 0 5px 0' }}>Tax Details</h4>
        <p style={{ fontSize: '12px', margin: '0' }}>Tax Invoice: 27AAACH7409R1Z1</p>
      </div>

      {/* TABLE */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '30px',
        border: '1px solid #0f3d2e'
      }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              border: '1px solid #0f3d2e',
              padding: '10px 5px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5'
            }}>Description</th>
            <th style={{
              textAlign: 'left',
              border: '1px solid #0f3d2e',
              padding: '10px 5px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5'
            }}>QTY</th>
            <th style={{
              textAlign: 'left',
              border: '1px solid #0f3d2e',
              padding: '10px 5px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5'
            }}>PRICE</th>
            <th style={{
              textAlign: 'left',
              border: '1px solid #0f3d2e',
              padding: '10px 5px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5'
            }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={{
                padding: '10px 5px',
                fontSize: '12px',
                border: '1px solid #0f3d2e'
              }}>{item.description}</td>
              <td style={{
                padding: '10px 5px',
                fontSize: '12px',
                border: '1px solid #0f3d2e'
              }}>{item.quantity}</td>
              <td style={{
                padding: '10px 5px',
                fontSize: '12px',
                border: '1px solid #0f3d2e'
              }}>₹{item.price}</td>
              <td style={{
                padding: '10px 5px',
                fontSize: '12px',
                border: '1px solid #0f3d2e'
              }}>₹{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* WATERMARK */}
      <div className="watermark" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: '80px',
        color: 'rgba(0, 0, 0, 0.2)',
        pointerEvents: 'none',
        zIndex: '0',
        textAlign: 'center',
        lineHeight: '1.2',
      }}>FS Enterprises</div>

      {/* TOTALS */}
      <div className="totals" style={{
        position: 'absolute',
        bottom: '55mm',
        right: '15mm',
        textAlign: 'right'
      }}>
        <p style={{ fontSize: '14px', margin: '5px 0', color: '#0f3d2e' }}>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p style={{ fontSize: '14px', margin: '5px 0', color: '#0f3d2e' }}>Tax (18%): ₹{tax.toFixed(2)}</p>
        <h2 style={{ fontSize: '24px', margin: '10px 0', color: '#0f3d2e' }}>Total: ₹{total.toFixed(2)}</h2>
      </div>

      {/* FOOTER */}
      <div className="footer" style={{
        position: 'absolute',
        bottom: '15mm',
        left: '0',
        width: '100%',
        borderTop: '2px solid #0f3d2e',
        paddingTop: '10px',
        fontSize: '12px',
        textAlign: 'center',
      }}>
        <p style={{ margin: '5px 0' }}>Fresh Soft Tissue Enterprises</p>
        <p style={{ margin: '5px 0' }}>Pune, Maharashtra</p>
        <p style={{ margin: '5px 0' }}>fsenterprises523@gmail.com</p>
      </div>

    </div>
  );
}