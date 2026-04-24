export interface PrintBillData {
  billNumber?: string;
  customerName: string;
  phoneNumber?: string;
  billDate?: string;
  paymentMode?: string;
  status?: string;
  gst?: boolean;
  items: {
    gsm_number: number | string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
}

export function printBillInvoice(data: PrintBillData) {
  const subtotal = Number(data.subtotal || 0);
  const gstEnabled = Boolean(data.gst);
  const taxAmount = gstEnabled ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + taxAmount;

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;
  const formattedDate = data.billDate
    ? new Date(data.billDate).toLocaleDateString("en-GB").replace(/\//g, "-")
    : "-";

  const win = window.open("", "_blank");
  if (!win) return;

  let showWatermark = false;
  let showPaidStamp = false;
  const cleanStatus = (data.status || "").toLowerCase();

  if (cleanStatus === "paid") {
    showPaidStamp = true;
  } else if (
    cleanStatus === "unpaid" ||
    cleanStatus === "pending" ||
    cleanStatus === "new invoice"
  ) {
    showWatermark = true;
  }

  const itemsRows = data.items
    .map(
      (item) => `
        <tr>
          <td>${item.description || "-"}</td>
          <td class="qty">${item.quantity ?? 0}</td>
          <td class="amount">${formatCurrency(Number(item.price || 0))}</td>
          <td class="amount">${formatCurrency(Number(item.total || 0))}</td>
        </tr>
      `
    )
    .join("");

  win.document.write(`
<!DOCTYPE html>
<html>
  <head>
    <title>Invoice</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Arial, sans-serif;
        background: #fff;
        margin: 0;
        color: #0f2f27;
      }
      .invoice-container {
        width: 820px;
        margin: 24px auto;
        padding: 34px 32px 28px;
        background: #fff;
        border-top: 1px solid #dedede;
        border-bottom: 1px solid #dedede;
        min-height: 1100px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
      }
      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .title {
        font-size: 48px;
        font-weight: 800;
        color: #0f4c3a;
        line-height: 1;
      }
      .invoice-meta {
        margin-top: 8px;
        font-size: 16px;
        color: #1d6b4f;
      }
      .contact {
        text-align: right;
        font-size: 28px;
        line-height: 1.3;
        font-weight: 700;
        color: #0f4c3a;
      }
      .tax-block {
        margin-top: 34px;
        text-align: left;
        font-size: 20px;
        line-height: 1.4;
      }
      .tax-block .tax-title {
        font-weight: 700;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 28px;
      }
      th {
        color: #0f4c3a;
        font-size: 24px;
        padding: 8px 0;
        border-bottom: 1px solid #d8d8d8;
        text-align: left;
      }
      td {
        font-size: 30px;
        padding: 10px 0;
        border-bottom: 1px solid #efefef;
        color: #111;
      }
      .qty { text-align: center; width: 120px; }
      .amount { text-align: right; width: 180px; }
      .spacer {
        flex: 1;
        min-height: 260px;
      }
      .summary-wrap {
        border-top: 3px solid #a8c6a0;
        padding-top: 18px;
        margin-top: 20px;
      }
      .summary-table {
        width: 300px;
        margin-left: auto;
        margin-top: 0;
      }
      .summary-table td {
        border: none;
        padding: 5px 0;
        font-size: 20px;
        color: #111;
      }
      .summary-table .final {
        font-size: 44px;
        font-weight: 800;
        color: #0f4c3a;
        padding-top: 6px;
      }
      .bottom-line {
        border-top: 3px solid #a8c6a0;
        margin: 16px 0 14px 0;
      }
      .footer {
        font-size: 16px;
        line-height: 1.45;
        color: #111;
      }
      .watermark {
        position: absolute;
        top: 57%;
        left: 52%;
        transform: translate(-50%, -50%) rotate(-30deg);
        opacity: 0.09;
        font-size: 106px;
        font-weight: 800;
        color: #d40000;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div>
        <div class="top-row">
          <div>
            <div class="title">INVOICE</div>
            <div class="invoice-meta">INVOICE#: ${data.billNumber || "-"}</div>
          </div>
          <div class="contact">
            CUSTOMER CONTACT<br>
            Name : ${data.customerName || "-"}<br>
            Date : ${formattedDate}<br>
            Phone : ${data.phoneNumber || "-"}
          </div>
        </div>

        ${
          gstEnabled
            ? `
        <div class="tax-block">
          <div class="tax-title">Tax Details</div>
          Tax Invoice :- 27AAACH7409R1Z1
        </div>
          `
            : ""
        }

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="qty">QTY</th>
              <th class="amount">PRICE</th>
              <th class="amount">TOTAL</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>

      <div class="spacer"></div>

      <div class="summary-wrap">
        <table class="summary-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align:right;">${formatCurrency(subtotal)}</td>
          </tr>
          ${
            gstEnabled
              ? `
          <tr>
            <td>Tax (18%):</td>
            <td style="text-align:right;">${formatCurrency(taxAmount)}</td>
          </tr>
            `
              : ""
          }
          <tr>
            <td class="final">Total:</td>
            <td class="final" style="text-align:right;">${formatCurrency(grandTotal)}</td>
          </tr>
        </table>

        <div class="bottom-line"></div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
          <div class="footer">
            Fresh Soft Tissue Enterprises<br>
            6-27-700 Park Ave<br>
            Pune, Maharashtra<br>
            411006<br>
            fsenterprises523@gmail.com<br>
            www.fsenterprise.com
          </div>

          ${
            showPaidStamp
              ? `
          <div style="width:240px; text-align:right; position:relative;">
            <div style="position: relative; width: 240px; margin-left: auto;">
              <img src="/paid-stamp copy.png" alt="Paid Stamp" style="width: 120px; position: relative; z-index: 1;" />
              <img src="/mustafa-sign.png" alt="Signature" style="position: absolute; bottom: 10px; right: 20px; width: 100px; z-index: 2; transform: rotate(-8deg);" />
              <div style="color: #0f4c3a; font-size: 30px; font-weight: 800; text-align: center; margin-top: 10px;">
                Fs Enterprise
              </div>
            </div>
          </div>
            `
              : ""
          }
        </div>
      </div>

      ${showWatermark ? `<div class="watermark">Fs Enterprises</div>` : ""}
    </div>

    <script>
      window.print();
      setTimeout(() => window.close(), 400);
    </script>
  </body>
</html>
  `);

  win.document.close();
}
