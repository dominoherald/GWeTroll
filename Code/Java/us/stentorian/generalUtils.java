package us.stentorian;

import java.text.*;
import java.util.*;

import com.ibm.xsp.model.domino.wrapped.*;

import lotus.domino.*;

public class generalUtils {
	private Document nDoc;

	public generalUtils() {
	}

	public Object userNameInArray(String iName, Vector iVector) {
		// for this method, I am presuming the iVector is an array of strings
		// with the user name in the first position followed by a tilde
		// so: Joe User/LaVergne/Thompson~Approved~10/14/2010 (or whatever)
		// returns null if it's not found, otherwise returns the index of the
		// element
		// System.out.println("starting userNameInArray " + iName);
		Object rtnValue = null;
		Integer counter = 0; // just to keep track of the index we are at
		// //Integer used for casting when returned
		if (iVector != null) {
			Iterator ite = iVector.iterator();
			// System.out.println("about to while");
			while (ite.hasNext()) {
				String aString = ite.next().toString(); // I think this is the
				int sourceIndex = aString.indexOf("~");
				String nameString = aString.substring(0, sourceIndex);
				// System.out.println("nameString is " + nameString);
				if (iName.equalsIgnoreCase(nameString)) {
					rtnValue = counter;
					// System.out.println("got it at " + counter);
				}
				counter++;
				// System.out.println("counted up to " + counter);
			}

		} else {
			// System.out.println("iVector is null for userNameInArray");
			// vector is null
			// so return null
		}
		// System.out.println("about to return");
		return rtnValue;
	}

	public String nowDateTimeStampString() {
		// the idea here is to return now as a date time string for using as a
		// time stamp
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy h:mm a");
		Calendar cal = Calendar.getInstance();
		String nowDateTimeStampString = dateFormat.format(cal.getTime());
		return nowDateTimeStampString;
	}

	public static void newOrAppendItemValue(String fieldname, Object inputValue, Document nDoc) {
		// object is valid for the value of an item
		// this may be a cool thing to move into a
		// call as: newOrAppendItemValue("statusHistory",
		// "Text or other to add", nDoc);
		// System.out.println("in the newOrAppendItemValue " + fieldname);
		try {
			if (nDoc.hasItem(fieldname)) {
				java.util.Vector oV = nDoc.getItemValue(fieldname);
				oV.addElement(inputValue);
				nDoc.replaceItemValue(fieldname, oV);
			} else {
				nDoc.replaceItemValue(fieldname, inputValue);
			}
		} catch (NotesException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static void newOrAppendItemValue(String fieldname, Object inputValue, String UNID) {
		// object is valid for the value of an item
		// this may be a cool thing to move into a
		// call as: newOrAppendItemValue("statusHistory",
		// "Text or other to add", doc1.getUnid);
		// Overloaded for calling from SSJS, saving for the same reason, so the
		// value gets put in the doc.
		// Document iDoc = MWLUGUtils.getDoc(UNID);
		Document iDoc = null; // change back, just going on since I won't be
		// using this just now
		if (iDoc != null) {
			try {
				if (iDoc.hasItem(fieldname)) {
					java.util.Vector oV = iDoc.getItemValue(fieldname);
					oV.addElement(inputValue);
					iDoc.replaceItemValue(fieldname, oV);
					iDoc.save();
				} else {
					iDoc.replaceItemValue(fieldname, inputValue);
					iDoc.save();
				}
			} catch (NotesException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	public static String getItemValueAsString(Document iDoc, String itemName, boolean justFirst) {
		// This method is a shortcut to return value(s) as a string, rather than calling a vector in the main
		// returns an empty string if no item or null
		// boolean justFirst of true returns just the first value if multi-value

		String rtnString = "";
		try {
			if (iDoc.hasItem(itemName)) {
				java.util.Vector iVector = new java.util.Vector();
				iVector = getItemValueSet(iDoc, itemName, iVector);
				if (iVector != null) {
					if (justFirst) {
						rtnString = iVector.elementAt(0).toString();
						// return rtnString;
					} else {
						StringBuilder sB = new StringBuilder();
						sB.append("");
						Iterator ite = iVector.iterator();
						while (ite.hasNext()) {
							sB.append(ite.next().toString());
							sB.append(":");
						}
						rtnString = sB.toString();
					}

				} else {
					// return rtnString;
				}
			} else {
				// return rtnString;

			}
		} catch (NotesException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return rtnString;
	}

	public static Vector getItemValueSet(Document iDoc, String iItemName, java.util.Vector iVector) {
		// this is designed to see if there is any value in the field, and if
		// so, to get all of it.
		// if there is only one value, still put it in a vector
		// if null, put null in as the value
		// java.util.Vector.size() is the # of elements in the vector
		// call as: iVector = getItemValueSet(nDoc, approvedField, iVector);
		iVector = null; // always set to null
		try {
			if (iDoc.hasItem(iItemName)) {
				Item iItem = iDoc.getFirstItem(iItemName);
				iVector = iItem.getValues();
			} else {
				iVector = null;
			}
		} catch (NotesException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return iVector;
	}

	public static Vector getItemValueSet(String UNID, String iItemName, java.util.Vector iVector) {
		// this is designed to see if there is any value in the field, and if
		// so, to get all of it.
		// if there is only one value, still put it in a vector
		// if null, put null in as the value
		// java.util.Vector.size() is the # of elements in the vector
		// call as: iVector = getItemValueSet(nDoc, approvedField, iVector);
		// this overloaded method is for when we want to do this from an XPage,
		// and we can't pass a Notes object (like a Doc) into a bean,
		// Document iDoc = MWLUGUtils.getDoc(UNID);
		Document iDoc = null; // change back, just going on since I won't be
		// using this just now
		if (iDoc != null) {
			iVector = null; // always set to null
			if (iDoc != null) {
				try {
					if (iDoc.hasItem(iItemName)) {
						Item iItem = iDoc.getFirstItem(iItemName);
						iVector = iItem.getValues();
					} else {
						iVector = null;
					}
				} catch (NotesException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
		return iVector;
	}

	public static String getItemDateOrString(Document iDoc, String iItemName) throws NotesException {
		// Return the date as a string, or the string value if the item is not a datetime
		String rtnString = "";
		if (iDoc.hasItem(iItemName)) {
			Item item = iDoc.getFirstItem(iItemName);
			switch (item.getType()) {
			case Item.DATETIMES:
				DateTime dt = item.getDateTimeValue();
				rtnString = dt.getDateOnly();
				break;
			default:
				rtnString = getItemValueAsString(iDoc, iItemName, true);
			}
		}

		return rtnString;
	}

	public static boolean isNumeric(String inputData) {
		// From
		// http://rosettacode.org/wiki/Determine_if_a_string_is_numeric#Java
		// returns true or false depending on if a number (including a decimal
		// point
		return inputData.matches("[-+]?\\d+(\\.\\d+)?");
	}

	public static DominoDocument wrapDocument(Document doc) throws NotesException {
		DominoDocument wrappedDoc = null;

		Database db = doc.getParentDatabase();

		// wrap the lotus.domino.Document as a lotus.domino.DominoDocument
		// see http://public.dhe.ibm.com/software/dw/lotus/Domino-Designer/JavaDocs/DesignerAPIs/com/ibm/xsp/model/domino/wrapped/DominoDocument.html
		wrappedDoc = DominoDocument.wrap(doc.getParentDatabase().getFilePath(), doc, null, null, false, null, null);
		return wrappedDoc;

	}
}