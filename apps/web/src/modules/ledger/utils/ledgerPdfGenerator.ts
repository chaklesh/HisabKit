import { formatDate } from "../../../shared/utils/ledgerUtils";
import type { Customer, LedgerTransaction } from "../types/ledgerTypes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfExportOptions {
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Premium PDF Generator for HisabKit Ledger
 * Focused on high-end aesthetics and professional clarity.
 */
export const generateLedgerPdf = (
  customer: Customer,
  transactions: LedgerTransaction[],
  options: PdfExportOptions = {}
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // BRAND COLORS - Deep Fintech Palette
  const indigo = [67, 56, 202] as [number, number, number]; // Indigo 700
  const lightIndigo = [238, 242, 255] as [number, number, number]; // Indigo 50
  const slate700 = [51, 65, 85] as [number, number, number];
  const slate500 = [100, 116, 139] as [number, number, number];
  const emerald = [5, 150, 105] as [number, number, number];
  const rose = [220, 38, 38] as [number, number, number];

  // 1. TOP BRAND BAR
  doc.setFillColor(...indigo);
  doc.rect(0, 0, pageWidth, 20, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("HisabKit", 20, 13);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PREMIUM BUSINESS LEDGER", 54, 12);

  // 2. STATEMENT TITLE & DATE RANGE
  const sortedTxns = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Priority: 1. Filter Dates from options, 2. "All Time"
  let periodText = "Full Statement (All Time)";
  if (options.startDate || options.endDate) {
    const start = options.startDate ? formatDate(options.startDate) : "Beginning";
    const end = options.endDate ? formatDate(options.endDate) : "Today";
    periodText = `${start} to ${end}`;
  }

  doc.setTextColor(...slate700);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Statement of Account", 20, 35);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate500);
  doc.text(`Period: ${periodText}`, 20, 42);

  // 3. INFORMATION BLOCKS (Side-by-Side)
  // Business Box
  doc.setFillColor(...lightIndigo);
  doc.roundedRect(20, 50, (pageWidth / 2) - 25, 35, 3, 3, "F");
  
  doc.setTextColor(...indigo);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FROM:", 25, 56);
  
  doc.setTextColor(...slate700);
  doc.setFontSize(12);
  doc.text(options.businessName || "Your Business", 25, 63);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate500);
  let bizY = 68;
  if (options.businessAddress) {
    doc.text(options.businessAddress, 25, bizY, { maxWidth: (pageWidth / 2) - 35 });
    bizY += 4;
  }
  const contact = [options.businessPhone, options.businessEmail].filter(Boolean).join(" | ");
  if (contact) doc.text(contact, 25, bizY + 2);

  // Customer Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect((pageWidth / 2) + 5, 50, (pageWidth / 2) - 25, 35, 3, 3, "F");
  
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TO CUSTOMER:", (pageWidth / 2) + 10, 56);
  
  doc.setTextColor(...slate700);
  doc.setFontSize(12);
  doc.text(customer.name.toUpperCase(), (pageWidth / 2) + 10, 63);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let custY = 68;
  if (customer.phone) {
    doc.text(`Phone: ${customer.phone}`, (pageWidth / 2) + 10, custY);
    custY += 4;
  }
  if (customer.address) {
    doc.text(customer.address, (pageWidth / 2) + 10, custY, { maxWidth: (pageWidth / 2) - 35 });
  }

  // 4. SUMMARY BAR
  const totalBalance = Number(customer.totalBalance || 0);
  const isToCollect = totalBalance >= 0;
  
  doc.setDrawColor(...indigo);
  doc.setLineWidth(0.5);
  doc.line(20, 95, pageWidth - 20, 95);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...slate700);
  doc.text("SUMMARY OVERVIEW", 20, 102);
  
  doc.setFont("helvetica", "normal");
  doc.text("Report Generated:", pageWidth - 20, 102, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), pageWidth - 20, 107, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(isToCollect ? emerald[0] : rose[0], isToCollect ? emerald[1] : rose[1], isToCollect ? emerald[2] : rose[2]);
  doc.text(`NET BALANCE: Rs. ${Math.abs(totalBalance).toLocaleString()}`, 20, 115);
  
  doc.setFontSize(8);
  doc.text(isToCollect ? "DUE FROM CUSTOMER (TO COLLECT)" : "DUE TO CUSTOMER (TO PAY)", 20, 120);

  // 5. TRANSACTION TABLE
  let runningBalance = 0;
  const tableData = sortedTxns.map((t) => {
    const isSale = t.type === "SALE";
    const dr = isSale ? Number(t.totalAmount) : 0;
    const cr = Number(t.paidAmount || 0);
    runningBalance += (dr - cr);

    return [
      formatDate(t.timestamp),
      isSale ? "SALE / UDHAAR" : "CASH RECEIVED",
      t.description || "-",
      dr > 0 ? dr.toLocaleString() : "-",
      cr > 0 ? cr.toLocaleString() : "-",
      { 
        content: runningBalance.toLocaleString(), 
        styles: { textColor: runningBalance >= 0 ? emerald : rose, fontStyle: "bold" as const } 
      }
    ];
  });

  const totalDr = transactions.reduce((acc, t) => acc + (t.type === "SALE" ? Number(t.totalAmount) : 0), 0);
  const totalCr = transactions.reduce((acc, t) => acc + Number(t.paidAmount || 0), 0);

  autoTable(doc, {
    startY: 125,
    head: [["DATE", "TYPE", "DESCRIPTION", "BILL (DR)", "CASH (CR)", "BALANCE"]],
    body: [
      ...tableData,
      [
        { content: "TOTAL SUMMARY", colSpan: 3, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [245, 245, 250] } },
        { content: totalDr.toLocaleString(), styles: { fontStyle: "bold" as const, fillColor: [245, 245, 250] } },
        { content: totalCr.toLocaleString(), styles: { fontStyle: "bold" as const, fillColor: [245, 245, 250] } },
        { content: runningBalance.toLocaleString(), styles: { fontStyle: "bold" as const, fillColor: indigo, textColor: [255, 255, 255] } }
      ]
    ],
    headStyles: { fillColor: indigo, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 253, 255] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8, cellPadding: 4, textColor: [40, 40, 40], font: "helvetica" },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    }
  });

  // 6. FOOTER
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.setTextColor(...slate500);
  doc.text("This is a computer-generated statement and does not require a physical signature.", pageWidth / 2, finalY + 15, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...indigo);
  doc.text("POWERED BY HISABKIT - INDIA'S TRUSTED BUSINESS APP", pageWidth / 2, finalY + 20, { align: "center" });

  doc.save(`Statement_${customer.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
