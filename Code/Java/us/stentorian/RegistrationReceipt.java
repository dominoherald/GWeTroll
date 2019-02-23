package us.stentorian;

import java.io.*;
import java.text.*;
import java.util.*;

import javax.faces.context.*;

import lotus.domino.*;

import com.itextpdf.text.*;
import com.itextpdf.text.Font.*;
import com.itextpdf.text.pdf.*;

public class RegistrationReceipt implements Serializable {

	final Font BLACK_BOLD = new Font(FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK);
	final Font code_text = new Font(FontFamily.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY);

	public RegistrationReceipt() {
	}

	public static void main(String[] args) throws IOException {
		File resultFile = new File("Registration.pdf");
		if (resultFile.exists()) {
			resultFile.delete();
		}
		FileOutputStream out = new FileOutputStream(resultFile);
		RegistrationReceipt PDFGenerator = new RegistrationReceipt();
		try {
			// PDFGenerator.createReg(out, "stuff", "stuff");
			PDFGenerator.createReg("stuff", "stuff", "stuff");
		} catch (NotesException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		out.close();
	}

	@SuppressWarnings("unchecked")
	public void createReg(String docID, String eventCode, String actualNoteID) throws NotesException {
		// public void createReg(OutputStream out, String docID, String
		// eventCode) throws NotesException {
		java.util.Vector allObjects = new java.util.Vector();
		Session session = (Session) getVariableValue("session");
		// session.setConvertMIME(false);

		lotus.domino.Log nLog = session.createLog("Java Registration PDF");
		allObjects.addElement(nLog);
		nLog.openNotesLog("", "stentorian\\AgentLog.nsf");
		nLog.logAction("Registration Bean starting");

		try {

			com.itextpdf.text.Document document = new com.itextpdf.text.Document(PageSize.LETTER);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			// PdfWriter.getInstance(document, out); // new
			PdfWriter writer = PdfWriter.getInstance(document, baos);
			document.open();

			Database db = session.getCurrentDatabase();
			allObjects.addElement(db);
			// event code is the NoteID of the doc when the process started, so
			// it's "Safe"
			lotus.domino.Document eDoc = db.getDocumentByID(eventCode);
			allObjects.addElement(eDoc);

			Paragraph p = new Paragraph();
			Chunk tl = new Chunk("RESERVATION CONFIRMATION", BLACK_BOLD);
			p.add(tl);
			p.setAlignment(Element.ALIGN_CENTER);
			document.add(p);

			document.add(Chunk.NEWLINE);
			Chunk ck = new Chunk("Registration for: ");
			Chunk evnt = new Chunk(generalUtils.getItemValueAsString(eDoc, "eventName", true), BLACK_BOLD);
			Chunk dt = new Chunk(" " + generalUtils.getItemDateOrString(eDoc, "eventDate"), BLACK_BOLD);
			Chunk hst = new Chunk(" " + generalUtils.getItemValueAsString(eDoc, "hostGroup", true), BLACK_BOLD);
			p = new Paragraph();
			p.add(ck);
			p.add(evnt);
			p.add(dt);
			p.add(hst);
			document.add(p);
			document.add(Chunk.NEWLINE);
			ck = new Chunk("Reservation Tracking Number ");
			Chunk rTk = new Chunk(docID, BLACK_BOLD);
			p = new Paragraph();
			p.add(ck);
			p.add(rTk);
			document.add(p);
			document.add(Chunk.NEWLINE);
			p = new Paragraph("Reservation for:");
			document.add(Chunk.NEWLINE);

			// PdfPTable table = new PdfPTable(8);
			float[] columnWidths = { 30, 29, 10, 11, 3, 3, 3, 11 };
			PdfPTable table = new PdfPTable(columnWidths);
			table.setWidthPercentage(100);

			PdfPCell cell = new PdfPCell();
			ck = new Chunk("Last Name, First Name");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setPadding(3.0f);
			table.addCell(cell);

			ck = new Chunk("SCA Name");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("Mbr #");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("Expiry");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("D W");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("F");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("A");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("Est. Cost");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			// cell.setBorderColorRight(BaseColor.BLACK);
			// cell.setBorderWidthRight(0.25f);
			table.addCell(cell);
			table.setHorizontalAlignment(Element.ALIGN_LEFT);
			table.setWidthPercentage(90);

			// lotus.domino.Document document1 = db.getDocumentByID(docID);
			lotus.domino.View nView = db.getView("Registration\\parentNoteID");
			allObjects.addElement(nView);
			DocumentCollection nDC = nView.getAllDocumentsByKey(docID, true);
			lotus.domino.Document document1 = nDC.getFirstDocument();
			allObjects.addElement(document1);
			System.out.println("Starting Reg");
			lotus.domino.Document nextDoc = null;
			allObjects.addElement(nextDoc);

			while (document1 != null) {
				System.out.println("Have doc");
				nextDoc = nDC.getNextDocument(document1);

				// now add data
				ck = new Chunk(generalUtils.getItemValueAsString(document1, "mundaneLastName", true) + ", " + generalUtils.getItemValueAsString(document1, "mundaneFirstName", true));

				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(generalUtils.getItemValueAsString(document1, "scaName", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(generalUtils.getItemValueAsString(document1, "membershipNumber", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(montNum(generalUtils.getItemValueAsString(document1, "expireMonth", true)) + "/" + generalUtils.getItemValueAsString(document1, "expireYear", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				if (generalUtils.getItemValueAsString(document1, "daytripYN", true).equalsIgnoreCase("Yes")) {
					ck = new Chunk("D"); // Daytrip/Weekend
				} else {
					ck = new Chunk("W"); // Daytrip/Weekend
				}

				cell = new PdfPCell(new Paragraph(ck));
				cell.setPadding(3.0f);
				cell.setBorder(PdfPCell.NO_BORDER);
				table.addCell(cell);

				if (generalUtils.getItemValueAsString(document1, "feastYN", true).equalsIgnoreCase("Yes")) {
					ck = new Chunk("Y"); // Feast
				} else {
					ck = new Chunk("N");
				}

				cell = new PdfPCell(new Paragraph(ck));
				cell.setPadding(3.0f);
				cell.setBorder(PdfPCell.NO_BORDER);
				table.addCell(cell);

				if (generalUtils.getItemValueAsString(document1, "under18YN", true).equalsIgnoreCase("Yes")) {
					ck = new Chunk("N"); // Adult
				} else {
					ck = new Chunk("Y");
				}

				cell = new PdfPCell(new Paragraph(ck));
				cell.setPadding(3.0f);
				cell.setBorder(PdfPCell.NO_BORDER);
				table.addCell(cell);

				// Estimated Cost
				String cst = generalUtils.getItemValueAsString(document1, "computedCost", true);
				System.out.println("cst: " + cst);
				if (cst.equalsIgnoreCase("")) {
					ck = new Chunk("??");
				} else {
					if (generalUtils.isNumeric(cst)) {
						double money = Double.parseDouble(cst);
						NumberFormat formatter = NumberFormat.getCurrencyInstance();
						String moneyString = formatter.format(money);
						System.out.println("determined value: " + moneyString);

						ck = new Chunk(moneyString); // est cost
					} else {
						ck = new Chunk("??");
					}
				}
				cell = new PdfPCell(new Paragraph(ck));
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				cell.setPadding(3.0f);
				cell.setBorder(PdfPCell.NO_BORDER);

				table.addCell(cell);

				System.out.println("done");
				document1.recycle();
				document1 = nextDoc;
				// nextDoc.recycle();
			} // else {
			// p = new
			// Paragraph("Reservations not found. Please contact hosting group");
			// } // nDoc (names) is !=null

			// end data
			table.setHorizontalAlignment(Element.ALIGN_LEFT);
			table.setWidthPercentage(90);

			document.add(table);

			document.add(Chunk.NEWLINE);
			document.add(Chunk.NEWLINE);
			document.add(Chunk.NEWLINE);

			PdfPTable codetable = new PdfPTable(1);
			Paragraph codes = new Paragraph();
			Chunk ckCode = new Chunk("DW: Daytrip/Weekend  ", code_text);
			codes.add(ckCode);
			ckCode = new Chunk("F: Feast Yes/No  ", code_text);
			codes.add(ckCode);
			ckCode = new Chunk("A: Adult Yes/No", code_text);
			codes.add(ckCode);
			cell = new PdfPCell(codes);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setPadding(3.0f);
			codetable.addCell(cell);
			codetable.setHorizontalAlignment(Element.ALIGN_LEFT);
			document.add(codetable);

			document.close();
			// Above sets to return the doc to server up via a browser

			PdfReader reader;
			nLog.logAction("before starting attachment");
			try {
				nLog.logAction("about to get the reader");
				reader = new PdfReader(baos.toByteArray());
				// Create a stamper
				PdfStamper stamper = new PdfStamper(reader, new ByteArrayOutputStream());
				nLog.logAction("after stamper");
				stamper.close();
				document1 = db.getDocumentByID(actualNoteID);
				if (document1.hasItem("confirmAttach")) {
					document1.removeItem("confirmAttach");
				}
				nLog.logAction("about to do the rawBytes array");
				byte[] rawBytes = baos.toByteArray();
				Stream s = session.createStream();
				nLog.logAction("created Stream");
				allObjects.addElement(s);
				MIMEEntity mme = document1.createMIMEEntity("confirmAttach");
				allObjects.addElement(mme);
				MIMEHeader header = mme.createHeader("Content-Type");
				allObjects.addElement(header);
				header.setHeaderVal("application/pdf");
				header = mme.createHeader("Content-Disposition");
				String pdfFileName = "RegistrationConfirmation";
				nLog.logAction("about to do the filename header");
				header.setHeaderVal("attachment; filename=" + pdfFileName + ".pdf");
				header = mme.createHeader("Content-ID");
				header.setHeaderVal("RegistrationConfirmation.pdf");
				s.open("RegistrationConfirmation.pdf");
				s.write(rawBytes);
				nLog.logAction("just wrote rawBytes");
				mme.setContentFromBytes(s, "application/pdf", MIMEEntity.ENC_IDENTITY_BINARY);
				document1.save();
				s.truncate();
				s.close();
				nLog.logAction("just closed the stream and docs");

			} catch (IOException e) {
				// TODO Auto-generated catch block
				nLog.logError(0, "IO error " + e.getMessage());
				e.printStackTrace();
			}

		} catch (Exception E) { // getdb
			nLog.logAction(E.getMessage() + "" + E.getCause());
			E.printStackTrace();
		} finally {
			try {
				session.recycle(allObjects);
				session.recycle();
				System.runFinalization();
				System.gc();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	private String montNum(String Month) {
		if (Month.equalsIgnoreCase("January")) {
			return "1";
		} else if (Month.equalsIgnoreCase("February")) {
			return "2";
		} else if (Month.equalsIgnoreCase("March")) {
			return "3";
		} else if (Month.equalsIgnoreCase("April")) {
			return "4";
		} else if (Month.equalsIgnoreCase("May")) {
			return "5";
		} else if (Month.equalsIgnoreCase("June")) {
			return "6";
		} else if (Month.equalsIgnoreCase("July")) {
			return "7";
		} else if (Month.equalsIgnoreCase("August")) {
			return "8";
		} else if (Month.equalsIgnoreCase("September")) {
			return "9";
		} else if (Month.equalsIgnoreCase("October")) {
			return "10";
		} else if (Month.equalsIgnoreCase("November")) {
			return "11";
		} else if (Month.equalsIgnoreCase("December")) {
			return "12";
		} else {
			return "?";
		}
	}

	@SuppressWarnings("unchecked")
	public void signReport(OutputStream out, String eventCode) throws NotesException {
		java.util.Vector allObjects = new java.util.Vector();
		Session session = (Session) getVariableValue("session");
		// session.setConvertMIME(false);

		lotus.domino.Log nLog = session.createLog("Java Signed Images PDF");
		allObjects.addElement(nLog);
		nLog.openNotesLog("", "stentorian\\AgentLog.nsf");
		nLog.logAction("Signed Images Bean starting");

		try {

			com.itextpdf.text.Document document = new com.itextpdf.text.Document(PageSize.LETTER.rotate());
			// ByteArrayOutputStream baos = new ByteArrayOutputStream();
			PdfWriter.getInstance(document, out); // new
			document.open();

			Database db = session.getCurrentDatabase();
			allObjects.addElement(db);
			// event code is the NoteID of the doc when the process started, so
			// it's "Safe"
			lotus.domino.Document eDoc = db.getDocumentByID(eventCode);
			allObjects.addElement(eDoc);

			Paragraph p = new Paragraph();
			Chunk tl = new Chunk("EVENT SIGN IN", BLACK_BOLD);
			p.add(tl);
			p.setAlignment(Element.ALIGN_CENTER);
			document.add(p);

			document.add(Chunk.NEWLINE);
			Chunk ck = new Chunk("Event: ");
			Chunk evnt = new Chunk(generalUtils.getItemValueAsString(eDoc, "eventName", true), BLACK_BOLD);
			Chunk dt = new Chunk(" " + generalUtils.getItemDateOrString(eDoc, "eventDate"), BLACK_BOLD);
			Chunk hst = new Chunk(" " + generalUtils.getItemValueAsString(eDoc, "hostGroup", true), BLACK_BOLD);
			p = new Paragraph();
			p.add(ck);
			p.add(evnt);
			p.add(dt);
			p.add(hst);
			document.add(p);
			document.add(Chunk.NEWLINE);

			// PdfPTable table = new PdfPTable(8);
			// mundane name, SCA name, Mem #, expire date, A/C, image
			float[] columnWidths = { 30, 29, 10, 11, 3, 17 };
			PdfPTable table = new PdfPTable(columnWidths);
			table.setWidthPercentage(100);

			PdfPCell cell = new PdfPCell();
			ck = new Chunk("Last Name, First Name");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setPadding(3.0f);
			table.addCell(cell);

			ck = new Chunk("SCA Name");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("Mbr #");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("Expiry");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("A");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			table.addCell(cell);

			ck = new Chunk("Signature");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			table.addCell(cell);
			table.setHorizontalAlignment(Element.ALIGN_LEFT);
			table.setWidthPercentage(100);

			lotus.domino.View nView = db.getView("Registration\\parentNoteID");
			allObjects.addElement(nView);
			ViewEntryCollection nVEC = nView.getAllEntries();
			allObjects.addElement(nVEC);
			ViewEntry nVE = nVEC.getFirstEntry();
			allObjects.addElement(nVE);
			lotus.domino.Document document1 = null;
			allObjects.addElement(document1);
			System.out.println("Starting Reg");
			ViewEntry nextEntry = null;
			allObjects.addElement(nextEntry);

			while (nVE != null) {
				System.out.println("Have doc");
				nextEntry = nVEC.getNextEntry(nVE);
				document1 = nVE.getDocument();

				// now add data
				ck = new Chunk(generalUtils.getItemValueAsString(document1, "mundaneLastName", true) + ", " + generalUtils.getItemValueAsString(document1, "mundaneFirstName", true));

				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(generalUtils.getItemValueAsString(document1, "scaName", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(generalUtils.getItemValueAsString(document1, "membershipNumber", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setPadding(3.0f);
				table.addCell(cell);

				if (generalUtils.getItemValueAsString(document1, "membershipNumber", true).length() > 3) {

					ck = new Chunk(montNum(generalUtils.getItemValueAsString(document1, "expireMonth", true)) + "/" + generalUtils.getItemValueAsString(document1, "expireYear", true));
					cell = new PdfPCell(new Paragraph(ck));
					cell.setBorder(PdfPCell.NO_BORDER);
					cell.setPadding(3.0f);
					table.addCell(cell);
				} else {
					cell = new PdfPCell(new Paragraph(""));
					cell.setBorder(PdfPCell.NO_BORDER);
					cell.setPadding(3.0f);
					table.addCell(cell);
				}

				if (generalUtils.getItemValueAsString(document1, "under18YN", true).equalsIgnoreCase("Yes")) {
					ck = new Chunk("N"); // Adult
				} else {
					ck = new Chunk("Y");
				}

				cell = new PdfPCell(new Paragraph(ck));
				cell.setPadding(3.0f);
				cell.setBorder(PdfPCell.NO_BORDER);
				table.addCell(cell);

				// Signature
				if (document1.hasItem("sigImage")) {
					nLog.logAction("has rt field ");
					// if (document1.getItemValue("sigImage") != null) {
					Item item = document1.getFirstItem("sigImage");
					nLog.logAction("1type is: " + item.getType() + " " + item.getValueLength());
					int tp = item.getType();

					if (tp == 25) {
						nLog.logAction("type is MIME");
						session.setConvertMime(false);

						MIMEEntity mime = item.getMIMEEntity();
						// MIMEEntity mime =
						// document1.getMIMEEntity("sigImage");
						// MIMEEntity mime = document1.getMIMEEntity();
						if (mime != null) {
							boolean thisMimeHasFile = false;
							String fileName = "noname";
							Vector<MIMEHeader> headers = mime.getHeaderObjects();
							for (MIMEHeader header : headers) {
								// (prefix + "-header: " +
								// header.getHeaderName() + " :: " +
								// header.getHeaderValAndParams());
								if ("Content-Transfer-Encoding".equals(header.getHeaderName())) {
									if ("binary".equals(header.getHeaderVal())) {
										thisMimeHasFile = true;
									}
								}
								if ("Content-Disposition".equals(header.getHeaderName())) {
									String val = header.getHeaderValAndParams();
									int odd = val.indexOf("filename=") + "filename=".length();
									int doo = val.length();
									fileName = val.substring(odd, doo);
									// this.fileNames.add(fileName);
								}
							}
							if (thisMimeHasFile) {
								fileName = ReplaceSubstring(fileName, "\"", "");

								nLog.logAction("mime filename: " + fileName);
								String imageString = "http://localhost/stentorian/EventRegistration.nsf/0/" + document1.getUniversalID() + "/$File/" + fileName;
								nLog.logAction("Image mime string: " + imageString);
								Image image = Image.getInstance(imageString);
								image.scaleAbsolute(100, 75); // 365, 435 width,
								cell = new PdfPCell(image);
								cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
								cell.setPadding(3.0f);
								cell.setBorder(PdfPCell.NO_BORDER);
							} else {
								nLog.logAction("No file in mime");
							}
						}
						session.setConvertMime(true);
					}

					if (false) {
						RichTextItem nrt = null;
						allObjects.addElement(nrt);
						Object obj = document1.getFirstItem("sigImage");
						if (obj instanceof RichTextItem) {
							nrt = (RichTextItem) obj;
							nLog.logAction("has rt item");
						}

						if (nrt != null) {
							java.util.Vector eos = nrt.getEmbeddedObjects();
							if (eos.isEmpty()) {
								// no image do nothing
								cell = new PdfPCell(new Paragraph("empty eos"));
							} else {
								nLog.logAction("found an image");
								EmbeddedObject eo1 = (EmbeddedObject) eos.firstElement();
								allObjects.addElement(eo1);
								// String imageString =
								// "http://stentorian.us/stentorian/Registration.nsf"
								// + "/Submissions/"
								// + document1.getUniversalID() + "/$File/" +
								// eo1.getName();

								String imageString = "http://localhost/stentorian/EventRegistration.nsf/0/" + document1.getUniversalID() + "/$File/" + eo1.getName();
								nLog.logAction("Image string: " + imageString);
								Image image = Image.getInstance(imageString);
								image.scaleAbsolute(100, 75); // 365, 435 width,
								cell = new PdfPCell(image);
								cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
								cell.setPadding(3.0f);
								cell.setBorder(PdfPCell.NO_BORDER);
							}
						} else {
							// cell = new PdfPCell(new Paragraph("nrt null"));
							java.util.Vector eos1 = document1.getEmbeddedObjects();
							if (eos1.isEmpty()) {
								cell = new PdfPCell(new Paragraph("eos1 is null"));
							} else {
								EmbeddedObject eod1 = (EmbeddedObject) eos1.firstElement();
								allObjects.addElement(eod1);
								String imageString = "http://localhost/stentorian/EventRegistration.nsf/0/" + document1.getUniversalID() + "/$File/" + eod1.getName();
								nLog.logAction("Image string: " + imageString);
								Image image = Image.getInstance(imageString);
								image.scaleAbsolute(75, 50); // 365, 435 width,
								cell = new PdfPCell(image);
								cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
								cell.setPadding(3.0f);
								cell.setBorder(PdfPCell.NO_BORDER);

							}

						}
						// } else {
						// cell = new PdfPCell(new Paragraph(""));
						// }

					}
				} else {
					cell = new PdfPCell(new Paragraph("No Image"));
				}

				// String imageString =
				// "http://localhost/stentorian/EventRegistration.nsf/0/" +
				// document1.getUniversalID()
				// + "/$File/image.png";
				/*
				 * String imageString = "http://localhost/stentorian/EventRegistration.nsf/0/1F17368A3847972C87257FD10067E3FD/$File/image.png" ; nLog.logAction("Image string: " + imageString); Image
				 * image = Image.getInstance(imageString); if (image != null) { image.scaleAbsolute(100, 75); // 365, 435 width, cell = new PdfPCell(image);
				 * cell.setHorizontalAlignment(Element.ALIGN_RIGHT); cell.setPadding(3.0f); cell.setBorder(PdfPCell.NO_BORDER); }
				 */
				cell.setBorder(PdfPCell.NO_BORDER);
				table.addCell(cell);

				System.out.println("done");
				nVE.recycle();
				nVE = nextEntry;
			} // else {
			// p = new
			// Paragraph("Reservations not found. Please contact hosting group");
			// } // nDoc (names) is !=null

			// end data
			table.setHorizontalAlignment(Element.ALIGN_LEFT);
			table.setWidthPercentage(100);

			document.add(table);
			document.close();

		} catch (Exception E) { // getdb
			nLog.logAction(E.getMessage() + "" + E.getCause());
			E.printStackTrace();
		} finally {
			try {
				session.recycle(allObjects);
				session.recycle();
				System.runFinalization();
				System.gc();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	public static String ReplaceSubstring(String Source, String Find, String ReplaceWith) {
		if (Find.equals(".")) {
			Find = "\\" + Find;
		}
		return Source.replaceAll(Find, ReplaceWith);
	}

	public static Object getVariableValue(String varName) {
		FacesContext context = FacesContext.getCurrentInstance();
		return context.getApplication().getVariableResolver().resolveVariable(context, varName);
	}
}
