package us.stentorian;

import java.io.*;
import java.text.*;
import java.util.*;

import javax.faces.context.*;

import lotus.domino.*;

import com.itextpdf.text.*;
import com.itextpdf.text.Document;
import com.itextpdf.text.Font.*;
import com.itextpdf.text.pdf.*;


public class SignPrint implements Serializable {

	final Font BLACK_BOLD = new Font(FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK);
	final Font code_text = new Font(FontFamily.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY);

	public SignPrint() {
	}

	public static void main(String[] args) throws IOException {
		File resultFile = new File("Registration.pdf");
		if (resultFile.exists()) {
			resultFile.delete();
		}
		FileOutputStream out = new FileOutputStream(resultFile);
		RegistrationReceipt PDFGenerator = new RegistrationReceipt();
		try {
			// SignPrint.signReport(out, "stuff", "1452");
			Session session = (Session) getVariableValue("session");
			Database db = session.getCurrentDatabase();

		} catch (NotesException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		out.close();
	}

	@SuppressWarnings("unchecked")
	//public void signReport(OutputStream out, String docID, String eventCode) throws NotesException {
	public void signReport() throws NotesException {
		//eventCode = "1452";
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
			PdfWriter.getInstance(document, new FileOutputStream("c:\\dxl\\CreatePDFInlotus.pdf"));
			//PdfWriter.getInstance(document, out); // new
			document.setPageSize(PageSize.LETTER_LANDSCAPE);
			document.open();

			Database db = session.getCurrentDatabase();
			allObjects.addElement(db);
			// event code is the NoteID of the doc when the process started, so it's "Safe"
			//lotus.domino.Document eDoc = db.getDocumentByID("stuff");
			//allObjects.addElement(eDoc);

			Paragraph p = new Paragraph();
			Chunk tl = new Chunk("Signatures from Electronice sign-in. Waiver as of date of signature", BLACK_BOLD);
			p.add(tl);
			p.setAlignment(Element.ALIGN_CENTER);
			document.add(p);

			document.add(Chunk.NEWLINE);
			Chunk ck = new Chunk("Event: ");
			Chunk evnt = new Chunk("Gulf Wars", BLACK_BOLD);
			Chunk dt = new Chunk(" March 2019" , BLACK_BOLD);
			Chunk hst = new Chunk(" Kingdom of GA", BLACK_BOLD);
			p = new Paragraph();
			p.add(ck);
			p.add(evnt);
			p.add(dt);
			p.add(hst);
			document.add(p);
			document.add(Chunk.NEWLINE);

			// PdfPTable table = new PdfPTable(8);
			// mundane name, SCA name, Mem #, expire date, A/C, image
			float[] columnWidths = { 25, 20, 8, 11, 6, 17 };
			PdfPTable table = new PdfPTable(columnWidths);
			table.setWidthPercentage(100);

			PdfPCell cell = new PdfPCell();
			ck = new Chunk("Last Name, First Name");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setBorderWidthBottom(0.25f);
			cell.setPadding(3.0f);
			table.addCell(cell);

			ck = new Chunk("SCA Name");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setBorderWidthBottom(0.25f);
			table.addCell(cell);

			ck = new Chunk("Record Key");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setBorderWidthBottom(0.25f);
			table.addCell(cell);

			ck = new Chunk("Sign Date");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setBorderWidthBottom(0.25f);
			table.addCell(cell);

			ck = new Chunk("Age");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderColorRight(BaseColor.BLACK);
			cell.setBorderWidthRight(0.25f);
			cell.setBorderWidthBottom(0.25f);
			table.addCell(cell);

			ck = new Chunk("Sign");
			cell = new PdfPCell(new Paragraph(ck));
			cell.setPadding(3.0f);
			cell.setBorder(PdfPCell.NO_BORDER);
			cell.setBorderWidthBottom(0.25f);
			table.addCell(cell);
			table.setHorizontalAlignment(Element.ALIGN_LEFT);
			table.setWidthPercentage(100);

			lotus.domino.View nView = db.getView("Test");
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
				ck = new Chunk(generalUtils.getItemValueAsString(document1, "mundaneLastName", true) + ", "
						+ generalUtils.getItemValueAsString(document1, "mundaneFirstName", true));

				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setBorderColorRight(BaseColor.BLACK);
				cell.setBorderWidthBottom(0.25f);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(generalUtils.getItemValueAsString(document1, "scaName", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setBorderColorRight(BaseColor.BLACK);
				cell.setBorderWidthBottom(0.25f);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(document1.getNoteID());
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setBorderColorRight(BaseColor.BLACK);
				cell.setBorderWidthBottom(0.25f);
				cell.setPadding(3.0f);
				table.addCell(cell);

				String dOrS = generalUtils.getItemDateOrString(document1, "sigDateTime");
				if(dOrS.length() < 3){
					ck = new Chunk("Not found");
				} else {
					ck = new Chunk(dOrS);
				}
				
				cell = new PdfPCell(new Paragraph(ck));
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setBorderColorRight(BaseColor.BLACK);
				cell.setBorderWidthBottom(0.25f);
				cell.setPadding(3.0f);
				table.addCell(cell);

				ck = new Chunk(generalUtils.getItemValueAsString(document1, "regAge", true));
				cell = new PdfPCell(new Paragraph(ck));
				cell.setPadding(3.0f);
				cell.setBorder(PdfPCell.NO_BORDER);
				cell.setBorderColorRight(BaseColor.BLACK);
				cell.setBorderWidthBottom(0.25f);
				table.addCell(cell);

				if (document1.hasItem("sigImage")) {
					nLog.logAction("has item");
					RichTextItem nrt = null;
					lotus.domino.Item sItem = document1.getFirstItem("sigImage");
					allObjects.addElement(sItem);
					//nrt = (RichTextItem) sItem;

					allObjects.addElement(nrt);


					// String imageString = "http://stentorian.us/stentorian/Registration.nsf" + "/Submissions/"
					// + document1.getUniversalID() + "/$File/" + eo1.getName();

					String imageString = "http://localhost/stentorian/GWeTroll.nsf" + "/0/" + document1.getUniversalID() + "/$File/image.png";
				
					Image image = null;
					
					try{
					 image = Image.getInstance(imageString);
					// image.setAlignment(com.itextpdf.text.Image.RIGHT | com.itextpdf.text.Image.TEXTWRAP);

					image.scaleAbsolute(100, 75); // 365, 435 width,
					cell = new PdfPCell(image);
					} catch (Exception iExp){
						//no image
						cell = new PdfPCell(new Paragraph("Not found"));
					}
					
					cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
					cell.setPadding(3.0f);
					cell.setBorder(PdfPCell.NO_BORDER);
					cell.setBorderColorRight(BaseColor.BLACK);
					cell.setBorderWidthBottom(0.25f);


				} else {
					nLog.logAction("No sigImage item");
					cell = new PdfPCell(new Paragraph(""));
				}

				table.addCell(cell);

				System.out.println("done");
				nVE.recycle();
				nVE = nextEntry;
			} // else {
			// p = new Paragraph("Reservations not found. Please contact hosting group");
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

	public void saveSign(OutputStream out, String docID, String eventCode) throws NotesException {
		java.util.Vector allObjects = new java.util.Vector();
		Session session = (Session) getVariableValue("session");
		// session.setConvertMIME(false);

		lotus.domino.Log nLog = session.createLog("Java Registration PDF");
		allObjects.addElement(nLog);
		nLog.openNotesLog("", "stentorian\\AgentLog.nsf");
		nLog.logAction("Registration Bean starting");

		try {

			com.itextpdf.text.Document document = new com.itextpdf.text.Document(PageSize.LETTER);
			// ByteArrayOutputStream baos = new ByteArrayOutputStream();
			PdfWriter.getInstance(document, out); // new
			document.open();

			Database db = session.getCurrentDatabase();
			allObjects.addElement(db);
			// event code is the NoteID of the doc when the process started, so it's "Safe"
			//lotus.domino.Document eDoc = db.getDocumentByUNID("1F17368A3847972C87257FD10067E3FD");
			//allObjects.addElement(eDoc);

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

	
	public static Object getVariableValue(String varName) {
		FacesContext context = FacesContext.getCurrentInstance();
		return context.getApplication().getVariableResolver().resolveVariable(context, varName);
	}
}
