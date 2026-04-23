import PDFDocument from "pdfkit";

export const generateInvoice = (res, booking) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${booking._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("Vehicle Rental Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice ID: ${booking._id}`);
  doc.text(`User: ${booking.user?.name || "N/A"}`);
  doc.text(`Vehicle: ${booking.vehicle?.title || "N/A"}`);
  doc.text(`From: ${new Date(booking.startDate).toLocaleDateString()}`);
  doc.text(`To: ${new Date(booking.endDate).toLocaleDateString()}`);
  doc.text(`Amount: ₹${booking.totalAmount}`);
  doc.text(`Payment Status: ${booking.paymentStatus || "N/A"}`);
  doc.text(`Booking Status: ${booking.bookingStatus || "N/A"}`);

  doc.end();
};