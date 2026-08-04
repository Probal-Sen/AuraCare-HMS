const PDFDocument = require('pdfkit');

/**
 * Generate a PDF Stream for a Bill Invoice
 */
const generateInvoicePDF = (bill, patient, docStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(docStream);

  // Header
  doc
    .fillColor('#1E3A8A')
    .fontSize(24)
    .text('AURACARE MEDICAL CENTER & HOSPITAL', { align: 'left' })
    .fillColor('#475569')
    .fontSize(10)
    .text('123 Health City Road, M.G. Road, Bengaluru, Karnataka | Emergency: +91 80 5550 0199', { align: 'left' })
    .moveDown(1.5);

  // Invoice Title & Status
  doc
    .fillColor('#0F172A')
    .fontSize(16)
    .text(`INVOICE: ${bill.invoiceNumber || 'INV-001'}`, { align: 'left' })
    .fontSize(10)
    .text(`Date: ${new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN')}`, { align: 'left' })
    .text(`Payment Status: ${(bill.paymentStatus || 'UNPAID').toUpperCase()}`, { align: 'left' })
    .moveDown(1);

  // Horizontal line
  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').stroke().moveDown(1);

  // Patient Info
  doc
    .fontSize(11)
    .fillColor('#1E293B')
    .text(`Patient Name: ${patient.name || 'N/A'}`)
    .text(`Patient ID: ${patient.patientId || 'PAT-001'}`)
    .text(`Age/Gender: ${patient.age || 'N/A'} yrs / ${patient.gender || 'N/A'}`)
    .text(`Phone: ${patient.phone || 'N/A'}`)
    .moveDown(1.5);

  // Item Table Header
  doc.fillColor('#1E3A8A').fontSize(11).text('Item Description', 40, doc.y, { width: 250 });
  const startY = doc.y;
  doc.text('Qty', 290, startY, { width: 40, align: 'center' });
  doc.text('Unit Price (INR)', 340, startY, { width: 100, align: 'right' });
  doc.text('Total (INR)', 450, startY, { width: 100, align: 'right' });
  doc.moveDown(0.5);

  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#E2E8F0').stroke().moveDown(0.5);

  // Items
  const items = bill.items && bill.items.length > 0 ? bill.items : [{ description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 }];
  items.forEach((item) => {
    const itemY = doc.y;
    doc.fillColor('#334155').fontSize(10).text(item.description || 'Medical Service', 40, itemY, { width: 250 });
    doc.text(String(item.quantity || 1), 290, itemY, { width: 40, align: 'center' });
    doc.text(`INR ${(item.unitPrice || 0).toFixed(2)}`, 340, itemY, { width: 100, align: 'right' });
    doc.text(`INR ${(item.amount || 0).toFixed(2)}`, 450, itemY, { width: 100, align: 'right' });
    doc.moveDown(0.8);
  });

  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').stroke().moveDown(1);

  // Summary
  const summaryY = doc.y;
  doc
    .fontSize(10)
    .fillColor('#475569')
    .text('Subtotal:', 340, summaryY, { width: 100, align: 'right' })
    .text(`INR ${(bill.subtotal || bill.totalAmount || 0).toFixed(2)}`, 450, summaryY, { width: 100, align: 'right' });

  const discountY = doc.y + 5;
  doc
    .text('Insurance/Discount:', 340, discountY, { width: 100, align: 'right' })
    .text(`-INR ${(bill.insuranceDiscount || 0).toFixed(2)}`, 450, discountY, { width: 100, align: 'right' });

  const totalY = doc.y + 10;
  doc
    .fontSize(12)
    .fillColor('#1E3A8A')
    .text('Total Amount Due:', 340, totalY, { width: 100, align: 'right' })
    .text(`INR ${(bill.totalAmount || 0).toFixed(2)}`, 450, totalY, { width: 100, align: 'right' });

  // Footer
  doc
    .fontSize(9)
    .fillColor('#94A3B8')
    .text('Thank you for choosing AuraCare Medical Center. Computer Generated Invoice.', 40, 750, { align: 'center' });

  doc.end();
};

/**
 * Generate a PDF Stream for a Prescription
 */
const generatePrescriptionPDF = (prescription, patient, doctor, docStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(docStream);

  // Header
  doc
    .fillColor('#0D9488')
    .fontSize(22)
    .text('AURACARE MEDICAL CENTER', { align: 'left' })
    .fillColor('#475569')
    .fontSize(10)
    .text(`Dr. ${doctor.name || 'Medical Officer'} (${doctor.specialization || 'General Physician'})`, { align: 'left' })
    .text(`Reg No: ${doctor.doctorId || 'DOC-001'} | OPD Room: ${doctor.roomNumber || '101'}`, { align: 'left' })
    .moveDown(1.5);

  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').stroke().moveDown(1);

  // Patient Info
  doc
    .fontSize(10)
    .fillColor('#1E293B')
    .text(`Patient: ${patient.name || 'N/A'} (ID: ${patient.patientId || 'PAT-001'})`)
    .text(`Age/Gender: ${patient.age || 'N/A'} yrs / ${patient.gender || 'N/A'} | Date: ${new Date(prescription.createdAt || Date.now()).toLocaleDateString()}`)
    .moveDown(1);

  // Rx Symbol
  doc.fontSize(24).fillColor('#0D9488').text('Rx', 40, doc.y).moveDown(0.5);

  // Medicines Table
  const meds = prescription.medicines && prescription.medicines.length > 0 ? prescription.medicines : [];
  meds.forEach((med, idx) => {
    doc
      .fontSize(11)
      .fillColor('#0F172A')
      .text(`${idx + 1}. ${med.medicineName} (${med.dosage || '500mg'})`)
      .fontSize(9)
      .fillColor('#475569')
      .text(`   Frequency: ${med.frequency}  |  Duration: ${med.duration}  |  Note: ${med.instructions || 'After meals'}`)
      .moveDown(0.8);
  });

  if (prescription.diagnosisNotes) {
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#1E3A8A').text(`Advice / Diagnosis Notes: ${prescription.diagnosisNotes}`);
  }

  // Doctor Signature Box
  doc.fontSize(10).fillColor('#475569').text(`Doctor Signature: __________________`, 350, 680);

  // Footer
  doc
    .fontSize(8)
    .fillColor('#94A3B8')
    .text('Valid for 30 days from date of issue. Please consult your pharmacist for dosage instructions.', 40, 750, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF, generatePrescriptionPDF };
