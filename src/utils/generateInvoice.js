import PDFDocument from "pdfkit";

export const generateInvoice = (res, booking) => {
  
  
  const doc = new PDFDocument({ margin: 50 });

  const vehicle = booking.vehicle;
  const user = booking.user;

  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const totalDays =
  booking.totalDays ||
  Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  );

  res.setHeader("Content-Type", "application/pdf");
res.setHeader(
  "Content-Disposition",
  `inline; filename=FINAL-INVOICE-${booking._id}.pdf`
);

  doc.pipe(res);

  // Header
  doc
    .fontSize(28)
    .fillColor("#1d4ed8")
    .text("VehicleRent", 50, 50);

  doc
    .fontSize(24)
    .fillColor("#111827")
    .text("INVOICE", 430, 55);

  doc
    .moveTo(50, 100)
    .lineTo(550, 100)
    .strokeColor("#1d4ed8")
    .stroke();

  // Bill To
  doc.fontSize(12).fillColor("#111827").text("BILL TO", 50, 130);
  doc
    .fontSize(10)
    .fillColor("#374151")
    .text(user?.name || "Customer", 50, 150)
    .text(user?.email || "N/A", 50, 168);

  // Invoice Info
  doc
    .fontSize(10)
    .fillColor("#111827")
    .text(`Invoice No: INV-${booking._id}`, 350, 130)
    .text(`Issue Date: ${new Date().toLocaleDateString()}`, 350, 150)
    .text(`Payment Status: ${booking.paymentStatus}`, 350, 170)
    .text(`Booking Status: ${booking.bookingStatus}`, 350, 190);

  // Blue summary bar
  doc.rect(50, 230, 500, 45).fill("#1d4ed8");

  doc
    .fillColor("#ffffff")
    .fontSize(9)
    .text("START DATE", 65, 242)
    .text("END DATE", 185, 242)
    .text("TOTAL DAYS", 305, 242)
    .text("TOTAL AMOUNT", 420, 242);

  doc
    .fontSize(12)
    .text(start.toLocaleDateString(), 65, 258)
    .text(end.toLocaleDateString(), 185, 258)
    .text(`${totalDays}`, 305, 258)
    .text(`Rs. ${booking.totalAmount}`, 420, 258);

  // Table header
  const tableTop = 320;

  doc.rect(50, tableTop, 500, 30).fill("#f3f4f6");

  doc
    .fillColor("#111827")
    .fontSize(10)
    .text("DESCRIPTION", 60, tableTop + 10)
    .text("DAYS", 285, tableTop + 10)
    .text("PRICE / DAY", 355, tableTop + 10)
    .text("AMOUNT", 470, tableTop + 10);

  // Table row
  const vehicleName =
    vehicle?.title ||
    `${vehicle?.make || ""} ${vehicle?.model || ""}`.trim() ||
    "Vehicle";

  const rowTop = tableTop + 40;

  doc
    .fillColor("#374151")
    .fontSize(10)
    .text(vehicleName, 60, rowTop)
    .text(`${totalDays}`, 295, rowTop)
    .text(
  `Rs. ${
    vehicle?.pricePerDay || Math.round(booking.totalAmount / totalDays)
  }`,
  365,
  rowTop
)
    .text(`Rs. ${booking.totalAmount}`, 470, rowTop);

  doc
    .moveTo(50, rowTop + 25)
    .lineTo(550, rowTop + 25)
    .strokeColor("#d1d5db")
    .stroke();

  // Vehicle details
  doc
    .fontSize(12)
    .fillColor("#111827")
    .text("Vehicle Details", 50, 410);

  doc
    .fontSize(10)
    .fillColor("#374151")
    .text(`Vehicle Type: ${vehicle?.type || "N/A"}`, 50, 435)
    .text(`Make: ${vehicle?.make || "N/A"}`, 50, 455)
    .text(`Model: ${vehicle?.model || "N/A"}`, 50, 475)
    .text(`Location: ${vehicle?.location || "N/A"}`, 50, 495)
    .text(`Fuel Type: ${vehicle?.fuelType || "N/A"}`, 50, 515)
    .text(`Transmission: ${vehicle?.transmission || "N/A"}`, 50, 535);

  // Total box
  doc.rect(350, 430, 200, 40).fill("#f3f4f6");

  doc
    .fillColor("#111827")
    .fontSize(11)
    .text("Total:", 365, 444)
    .fontSize(14)
    .fillColor("#1d4ed8")
    .text(`Rs. ${booking.totalAmount}`, 455, 441);

  doc.rect(350, 475, 200, 45).fill("#1d4ed8");

  doc
    .fillColor("#ffffff")
    .fontSize(12)
    .text("TOTAL PAID", 365, 490)
    .fontSize(14)
    .text(`Rs. ${booking.totalAmount}`, 455, 488);

  // Signature
  doc
    .fillColor("#111827")
    .fontSize(18)
    .text("VehicleRent", 390, 590);

  doc
    .fontSize(9)
    .fillColor("#6b7280")
    .text("Issued by", 430, 615);

  // Footer
  doc
    .fillColor("#111827")
    .fontSize(12)
    .text("Thank you for choosing VehicleRent!", 50, 680, {
      align: "center",
    });

  doc
    .fontSize(9)
    .fillColor("#6b7280")
    .text("This is a system generated invoice.", 50, 700, {
      align: "center",
    });

  doc.end();
};