import { jsPDF } from "jspdf";
import { AdReport, AggregationResult } from "../types";
import { fmtMoney, fmtInt, fmtPct, fmtMoney2, aggregate } from "../utils";

export function generatePDF(title: string, ads: AdReport[], isFiesta: boolean) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const agg = aggregate(ads);
  const costPerPurchase = agg.totalPurchases > 0 ? agg.totalSpend / agg.totalPurchases : null;
  const costPerInitiated = agg.totalInitiatedCheckouts > 0 ? agg.totalSpend / agg.totalInitiatedCheckouts : null;

  // Color Palette Definitions
  // Default: Navy/Slate/Eggshell
  // Fiesta: Charcoal/Dim Grey/Cool Steel/Khaki Beige/Pale Oak
  const colors = isFiesta
    ? {
        primary: [76, 87, 96],       // Charcoal #4c5760
        secondary: [102, 99, 91],    // Dim Grey #66635b
        accent: [147, 168, 172],     // Cool Steel #93a8ac
        bgLight: [245, 244, 240],    // Soft Linen Beige based on Pale Oak #d7ceb2
        textDark: [33, 37, 41],      // Dark charcoal
        textMuted: [110, 110, 110],
        line: [215, 206, 178],       // Pale Oak #d7ceb2 line
      }
    : {
        primary: [13, 19, 33],       // Ink Black #0d1321
        secondary: [29, 45, 68],     // Deep Space #1d2d44
        accent: [116, 140, 171],     // Dusty Denim #748cab
        bgLight: [240, 235, 216],    // Eggshell #f0ebd8
        textDark: [13, 19, 33],
        textMuted: [116, 140, 171],
        line: [62, 92, 118],         // Blue Slate #3e5c76
      };

  let pageNumber = 1;
  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 15;
  const printableWidth = pageWidth - margin * 2; // 180mm
  let y = 15;

  // Helper for text alignment
  const textRight = (text: string, x: number, currentY: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, x - textWidth, currentY);
  };

  const drawHeaderAndFooter = (docInstance: jsPDF, pageTitle: string) => {
    // Top border colored line
    docInstance.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    docInstance.rect(0, 0, pageWidth, 5, "F");

    // Footer
    docInstance.setFont("helvetica", "normal");
    docInstance.setFontSize(8);
    docInstance.setTextColor(130, 130, 130);
    docInstance.text(
      `Reporte generado por IMCREW Ads Panel · ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`,
      margin,
      pageHeight - 10
    );
    textRight(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 10);
  };

  // Draw Page 1 Frame
  drawHeaderAndFooter(doc, title);

  // 1. Report Title
  y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(title.toUpperCase(), margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  const periodText = ads.length > 0 && ads[0].reportStart && ads[0].reportEnd
    ? `Período del informe: ${ads[0].reportStart} al ${ads[0].reportEnd}`
    : "Resumen de rendimiento consolidado";
  doc.text(`${periodText} · Total anuncios analizados: ${ads.length}`, margin, y);

  // Title underline divider
  y += 4;
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // 2. KPI Cards
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("RESUMEN DE RENDIMIENTO GENERAL", margin, y);

  y += 4;
  // Let's create a beautiful grid of 5 KPI cards
  const cardWidth = (printableWidth - 12) / 5; // ~33.6mm each
  const cardHeight = 22;

  const drawKpiCard = (x: string, val: string, label: string, colorText: number[]) => {
    const xNum = parseFloat(x);
    // Card background
    doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
    doc.roundedRect(xNum, y, cardWidth, cardHeight, 1.5, 1.5, "F");

    // Card border
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.15);
    doc.roundedRect(xNum, y, cardWidth, cardHeight, 1.5, 1.5, "D");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label.toUpperCase(), xNum + 3, y + 5);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(colorText[0], colorText[1], colorText[2]);
    doc.text(val, xNum + 3, y + 14);
  };

  drawKpiCard(margin.toString(), fmtMoney(agg.totalSpend), "Invertido", colors.primary);
  drawKpiCard((margin + cardWidth + 3).toString(), fmtInt(agg.totalReach), "Alcance", colors.primary);
  drawKpiCard((margin + (cardWidth + 3) * 2).toString(), fmtInt(agg.totalImpr), "Impresiones", colors.primary);
  drawKpiCard((margin + (cardWidth + 3) * 3).toString(), fmtInt(agg.totalAllClicks), "Clics Totales", colors.primary);
  drawKpiCard((margin + (cardWidth + 3) * 4).toString(), fmtPct(agg.avgCtrAll), "CTR Prom.", colors.primary);

  // Sub-detail of the 5th card
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(110, 110, 110);
  textRight(`CPC: ${fmtMoney2(agg.avgCpcAll)}`, margin + printableWidth - 3, y + cardHeight - 2);

  // 3. Conversions KPI Cards
  y += cardHeight + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("MÉTRICAS DE CONVERSIÓN (PÍXEL)", margin, y);

  y += 4;
  const colCardWidth = (printableWidth - 4) / 2; // ~88mm each
  const colCardHeight = 20;

  // Payments Initiated Card
  doc.setFillColor(254, 251, 237); // Light gold/amberbg
  doc.roundedRect(margin, y, colCardWidth, colCardHeight, 1.5, 1.5, "F");
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y, colCardWidth, colCardHeight, 1.5, 1.5, "D");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 40);
  doc.text("PAGOS INICIADOS", margin + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(fmtInt(agg.totalInitiatedCheckouts), margin + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text(`Costo/Pago Inic: ${costPerInitiated !== null ? fmtMoney2(costPerInitiated) : "—"}`, margin + 4, y + 17);

  // Purchases Card
  doc.setFillColor(254, 242, 242); // Light red/rosebg
  doc.roundedRect(margin + colCardWidth + 4, y, colCardWidth, colCardHeight, 1.5, 1.5, "F");
  doc.setDrawColor(244, 63, 94); // Rose-500
  doc.roundedRect(margin + colCardWidth + 4, y, colCardWidth, colCardHeight, 1.5, 1.5, "D");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(159, 18, 57);
  doc.text("COMPRAS (CONVERSIONES)", margin + colCardWidth + 8, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(190, 24, 74); // Rose-700
  doc.text(fmtInt(agg.totalPurchases), margin + colCardWidth + 8, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text(`Costo/Compra: ${costPerPurchase !== null ? fmtMoney2(costPerPurchase) : "—"}`, margin + colCardWidth + 8, y + 17);

  // 4. Detailed Ad Table
  y += colCardHeight + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("DETALLE DE RENDIMIENTO POR ANUNCIO / CAMPAÑA", margin, y);

  y += 5;

  // Table columns widths mapping:
  // Campaign: 62mm, Budget: 18mm, Spend: 18mm, Reach: 18mm, CTR Link: 18mm, Initiated: 18mm, Purchases: 18mm, Total: 170mm (+10mm margins = 180mm printable width)
  const cols = [
    { name: "Campaña / Anuncio", width: 62, align: "left" },
    { name: "Presupuesto", width: 19, align: "right" },
    { name: "Invertido", width: 19, align: "right" },
    { name: "Alcance", width: 18, align: "right" },
    { name: "CTR Enlace", width: 19, align: "right" },
    { name: "Pagos In.", width: 15, align: "right" },
    { name: "Compras", width: 15, align: "right" },
  ];

  // Draw Table Headers
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, y, printableWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let currentX = margin;
  cols.forEach((col) => {
    if (col.align === "left") {
      doc.text(col.name, currentX + 2, y + 4.8);
    } else {
      textRight(col.name, currentX + col.width - 2, y + 4.8);
    }
    currentX += col.width;
  });

  y += 7;

  // Draw rows
  doc.setFontSize(7);
  ads.forEach((ad, idx) => {
    // Check if we need to add a new page (height limit is ~275 to leave margin at bottom)
    if (y > 270) {
      doc.addPage();
      pageNumber++;
      y = 15;
      drawHeaderAndFooter(doc, title);

      // Redraw Table Headers on new page
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(margin, y, printableWidth, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);

      let headX = margin;
      cols.forEach((col) => {
        if (col.align === "left") {
          doc.text(col.name, headX + 2, y + 4.8);
        } else {
          textRight(col.name, headX + col.width - 2, y + 4.8);
        }
        headX += col.width;
      });
      y += 7;
      doc.setFontSize(7);
    }

    // Alternating background colors
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252); // Softest gray/blue
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y, printableWidth, 7.5, "F");

    // Draw borders
    doc.setDrawColor(230, 235, 240);
    doc.setLineWidth(0.1);
    doc.line(margin, y + 7.5, margin + printableWidth, y + 7.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

    let rowX = margin;

    // Col 1: Campaign name (truncate with ellipsis if too long to avoid overlap)
    const adName = ad.label || ad.campaign || "Sin nombre";
    let truncatedName = doc.splitTextToSize(adName, cols[0].width - 4)[0];
    if (truncatedName.length < adName.length && !truncatedName.endsWith("...")) {
      truncatedName = truncatedName.slice(0, -3) + "...";
    }
    doc.text(truncatedName, rowX + 2, y + 4.8);
    rowX += cols[0].width;

    // Col 2: Budget
    const budVal = ad.budget ? fmtMoney(ad.budget) : "—";
    const budType = ad.budgetType ? ` (${ad.budgetType === "Daily" || ad.budgetType.toLowerCase().includes("diar") ? "D" : "T"})` : "";
    textRight(budVal + budType, rowX + cols[1].width - 2, y + 4.8);
    rowX += cols[1].width;

    // Col 3: Spend
    const spendVal = ad.spend ? fmtMoney(ad.spend) : "—";
    textRight(spendVal, rowX + cols[2].width - 2, y + 4.8);
    rowX += cols[2].width;

    // Col 4: Reach
    const reachVal = ad.reach ? fmtInt(ad.reach) : "—";
    textRight(reachVal, rowX + cols[3].width - 2, y + 4.8);
    rowX += cols[3].width;

    // Col 5: CTR Link
    const ctrVal = ad.ctrLink ? fmtPct(ad.ctrLink) : "—";
    textRight(ctrVal, rowX + cols[4].width - 2, y + 4.8);
    rowX += cols[4].width;

    // Col 6: Initiated Checkouts
    const initVal = ad.initiatedCheckouts ? fmtInt(ad.initiatedCheckouts) : "0";
    textRight(initVal, rowX + cols[5].width - 2, y + 4.8);
    rowX += cols[5].width;

    // Col 7: Purchases
    const purchVal = ad.purchases ? fmtInt(ad.purchases) : "0";
    textRight(purchVal, rowX + cols[6].width - 2, y + 4.8);
    rowX += cols[6].width;

    y += 7.5;
  });

  // Save pdf locally
  const cleanName = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  doc.save(`reporte_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
