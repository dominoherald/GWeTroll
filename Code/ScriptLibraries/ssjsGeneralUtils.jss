//this may duplicate some of the stuff in the bean, but it's for a different code base (SSJS, natch)
function SSJSnewOrAppendItemValue(fieldname:String, inputValue:Object, nDoc:Document) {
		//object is valid for the value of an item
		//this may be a cool thing to move into a 
		//call as: newOrAppendItemValue("statusHistory", "Text or other to add", nDoc);
		//System.out.println("in the newOrAppendItemValue " + fieldname);
	print('Starting function ' + fieldname);
		try {
			if (nDoc.hasItem(fieldname)){
				//print('append value');
				var oV:java.util.Vector = nDoc.getItemValue(fieldname);
				oV.addElement(inputValue);
				nDoc.replaceItemValue(fieldname, oV);
			} else {
				//print('new item');
				nDoc.replaceItemValue(fieldname, inputValue);
			}
		} catch (e) {	
			print('error is ' + e.toString());
			e.toString();
		}
	}

function SSJSnowDateTimeStampString(){
	var dt:NotesDateTime = session.createDateTime("Today");
	dt.setNow();
	return dt.getDateOnly() + " " + dt.getTimeOnly();
}

function SSJSgetItemValueSet(iDoc:NotesDocument, iItemName:String, iVector:java.util.Vector) {
	//this is designed to see if there is any value in the field, and if so, to get all of it.
	//if there is only one value, still put it in a vector
	//if null, put null in as the value
	//java.util.Vector.size() is the # of elements in the vector
	//call as: iVector = SSJSgetItemValueSet(nDoc, approvedField, iVector);
	//this overloaded method is for when we want to do this from an XPage, and we can't pass a Notes object (like a Doc) into a bean, 
	iVector = null; // always set to null
	//print('going to look for ' + iItemName);
		try {
			if (iDoc.hasItem(iItemName)) {				
				var iItem:NotesItem = iDoc.getFirstItem(iItemName);
				iVector = iItem.getValues();	
				//var passObj = getValueAsVector(iItem.getValues());
				//iVector = passObj;
				//print('returing from obj');
			} else {
				//print('returing a null');
				iVector = null;
			}
		} catch (e) {
			print('error is ' + e.toString());
			e.toString();
		}	
	
	//print('returing iVector ');
	return iVector;
}


function getValueAsVector(obj){
    switch(typeof obj){
        case "java.util.Vector":
            //it's already a Vector, just return it
            return obj;
            break;
        case "java.util.ArrayList":
            //it's an ArrayList, return it as a Vector
            var x:java.util.Vector = new java.util.Vector();
            for(i=0;i<obj.size();i++){
                x.add(obj[i]);
            }
            return x;
            break;
        case "Array":
            //it's an Array prototype, return it as a Vector
            var x:java.util.Vector = new java.util.Vector();
            for(i=0;i<obj.length;i++){
                x.add(obj[i]);
            }
            return x;
            break;
        default:
            //it's most likely a String, return it as a Vector
            var x:java.util.Vector = new java.util.Vector();
            x.add(obj);
            return x;
            break;
    }
}

function addFacesMessage(message, component){
// Here is how it is called: addFacesMessage('stuff','inputText6');
	try { 
	if(typeof component === 'string' ){
	component = getComponent(component);
	}

	var clientId = null;
	if (component) {
	clientId = component.getClientId(facesContext);
	}

	facesContext.addMessage(clientId, 
	new javax.faces.application.FacesMessage(message));
	} catch(e){ }
	}

function removeFacesMessages(){
	facesContext.getCurrentInstance().getMessages().remove();
}

function getCookie(cookieName){
	var c = facesContext.getExternalContext().getRequestCookieMap().get(cookieName)
	return (c!=null)?c.getValue():""
}

function setCookie(cookiename, cookieval, expires){
	response = facesContext.getExternalContext().getResponse(); 
	userCookie = new javax.servlet.http.Cookie(cookiename, cookieval);
	if(expires) userCookie.setMaxAge(expires*24*60*60*1000); 
	response.addCookie(userCookie); 
}

function clearMap( map:Map ){
	 // Get iterator for the keys
	 var iterator = map.keySet().iterator();
	 
	 // Remove all items
	 while( iterator.hasNext() ){
	  map.remove( iterator.next() );
	 }
	}
	//Usage: 	clearMap( applicationScope )


function SSJSgetItemValueAsString(iDoc:NotesDocument, iItemName:String, justFirst) {
	// This method is a shortcut to return value(s) as a string, rather than calling a vector in the main
	// returns an empty string if no item or null
	// boolean justFirst of true returns just the first value if multi-value

	var rtnString = "";
	try {
		if (iDoc.hasItem(iItemName)) {
			var iVector:java.util.Vector = new java.util.Vector();
			iVector = SSJSgetItemValueSet(iDoc, iItemName, iVector);
			if (iVector != null) {
				if (justFirst) {
					rtnString = iVector.elementAt(0) + '';
				} else {
					//var sB:String = '';
					if(iVector.size() == 1){
						rtnString = iVector.elementAt(0) + '';
						return rtnString;
					} else {
						for(var i = 0;i<iVector.size();i++){
							rtnString = rtnString + iVector.elementAt(i) + ";"
						}
						//dBar.info("all: " + rtnString);
					}
				}
			} else {
				// return rtnString;
			}
		} else {
			// return rtnString;
		} 
	return rtnString;
	} catch (e){
		print('error is ' + e.toString());
	}
	return '';
}


//this is still experimental:
function SSJSgetItemDateOrString(iDoc:NotesDocument, iItemName:String){
		var rtnString = "";
		var iVector:java.util.Vector = new java.util.Vector();
		iVector = SSJSgetItemValueSet(iDoc, iItemName, iVector);
		if(iVector != null) {
			if(iVector.elementAt(0) != null){				
				//var itemvalues:java.util.Vector = iDoc.getItemValueDateTimeArray(iItemName);
				var itemvalue = iVector.elementAt(0);
				if ((typeof(itemvalue)).endsWith("DateTime")) {
					//dBar.info("this a dateTime");
					return iVector.elementAt(0).toString() + ' ' + @Text(itemvalue, 'D0S0');
				} else{
					//dBar.info("not a datetime, return string of element 0");
					return iVector.elementAt(0).toString();
				}
			}
		}
		return rtnString;
}

function SSJSGetnDomConfig(key:String){
	//This gets a key value from a view
	var nDomView:NotesView = database.getView("Admin\\nDomConfig");
	var nDomDoc:NotesDocument = nDomView.getDocumentByKey(key, true);
	return SSJSgetItemValueAsString(nDomDoc, "Value", true);
}

function redirectToCurrentDocument( switchMode:boolean ){
	 if( typeof currentDocument === 'undefined' ){ return; }
	 // Gets the name of the XPage. E.g. /Person.xsp
	 var page = view.getPageName();
	 
	 // Gets the unid of the current document
	 var unid = currentDocument.getDocument().getUniversalID();
	 
	 // Sets/changes the action according according to the mode the document is in
	 var isEditable = currentDocument.isEditable();
	 if( switchMode ){ isEditable = !isEditable; } // false -> true / true -> false
	 var action = ( isEditable ) ? 'editDocument' : 'openDocument';
	 
	 // Open the current document via a get request
	 context.redirectToPage( page + '?documentId=' + unid + '&action=' + action );
	}