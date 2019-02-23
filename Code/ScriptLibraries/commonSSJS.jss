//import xpHTMLMailSSJS;
//import photosSSJS;
import startSSJS;
import loginSSJS;
//import xpWikiStyleSSJS;

function emailMe(unid:string){

	try{
		
		var d:NotesDocument = database.getDocumentByUNID(unid);
		var contentField:String = "";
		var contentType:String = "";
		var contentSubject:String = "";
		var content:String = "";
		var frm:String = d.getItemValueString("Form");
		
		switch(frm)
		{
			case "Announcement":
				contentSubject = "Subject";
				contentType = "Announcement";
				contentField = "BodyTxt";
				break;
			case "Poll":
				contentSubject = "Subject";
				contentType = "Poll";
				contentField = "";
				break;
			case "Doc":
				contentSubject = "Subject";
				contentType = "Blog";
				contentField = "Body";
				break;
			case "Wiki":
				contentSubject = "Subject";
				contentType = "Wiki";
				contentField = "Body";
				break;
			case "Post":
				contentSubject = "";
				contentType = "News post";
				contentField = "Content";
				break;
			default:
		}
		
		
		if(contentSubject!=""){
			content = "<p>" + d.getItemValueString(contentSubject) + "</p>";
		}
		if(contentField!=""){
			content = "<p>" + d.getItemValueString(contentField) + "</p>";
		}
		
		
		var att = d.getItemValueString("Files");
		var userid = getCookieValueX("userid");
		var email = getUserDetails(userid,"Email")
		var fn = getUserDetails(userid,"FullName")
		var first = getUserDetails(userid,"First")
		var name = getConfigDetails("Name")[0];
		
		var resptxt ="";
		var rUserID = "";
		var dc = d.getResponses()
		for(var i=1;i<=dc.getCount();i++){
			var rdoc = dc.getNthDocument(i);
			if(rdoc.getItemValueString("HidDelete")==""){
				rUserID = rdoc.getItemValueString("UserID");
				resptxt += "<p><b>Comment by " + getUserDetails(rUserID,"Fullname") + "</b><br />" + rdoc.getItemValueString("Content") + "</p>";
			}
		}
		
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var url = getConfigDetails("domain")[0] + "/" + database.getFilePath() 
		var mail = new HTMLMail();
		var to =  fn + " <" + email + ">"
		mail.setTo(to);
		mail.setSubject(name + " Email me");
		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
		mail.addHTML("<p>Hello " + first  + ", below is the " + contentType + " content you asked for (and comments if available)</p>");
		mail.addDocAttachment( unid, att)
		mail.addHTML(content);
		mail.addHTML(resptxt);
		mail.addHTML("<p><a href='" + url + "'>Visit " + name + "</a></p>");
		mail.addHTML("</div>");
		mail.setSender(emailfrom, name);
		mail.send();
		doLog("Mail sent to " + email);
		return true;
		
		
	}catch(e){
		doLog("emailMe error " + e + " email=" + email,"1")
		return false
	}
}



function getPageName(){
	var path:string = facesContext.getExternalContext().getRequest().getRequestURI()
	//doLog("SE get Page name");
	return session.evaluate("@RightBack(\"" + path + "\"; \"/\")").get(0)
}


function lastSeen(){
	try{
		
		// Temporary Disabled
		return;
		
		var key = "";
		var txt = "";
		var nn = "";
		var ag = context.getUserAgent().getUserAgent();
		var path:string = facesContext.getExternalContext().getRequest().getRequestURI();
		var ip:string = facesContext.getExternalContext().getRequest().getRemoteAddr();
		var key = getCookieValueX("userid");
		if(key==""){
			key = ip;
		}
		
		var jdt:java.text.DateFormat = new java.text.SimpleDateFormat("yy-MM-dd HH:mm:ss");
		var date = new Date(@Now());
		var d = jdt.format(date);
		
		var doc:NotesDocument = database.getView("(LookupUserActivity)").getDocumentByKey(key,true)
		//var dt:NotesDateTime = session.createDateTime("Today");
		//dt.setNow()
		
		txt = d + " " + key + " " + path + " " + ag;   
		
		
		if(doc){
			doc.replaceItemValue("LastSeen",d)
			var it:NotesItem = doc.getFirstItem("LastActivity")
			if(it){
				var v = it.getValues();
				var v2 = new java.util.Vector();
				v2.add(txt)
				v2.addAll(v)
				var v3 = @Subset(v2,50);
				doc.replaceItemValue("LastActivity",v3)
			}else{
				doc.replaceItemValue("LastActivity",txt)
			}
			doc.save()
		}else{
			doc = database.createDocument();
			doc.replaceItemValue("Form","UserActivity")
			doc.replaceItemValue("UserID",key)
			doc.replaceItemValue("LastSeen",d)
			doc.replaceItemValue("LastActivity",txt)
			doc.save()
		}
	}catch(e){
		doLog("last seen error " + e,"1")
	}
}

function validateUser(){
	try{
		var c = getCookieValueX("userid");
		var xid = getCookieValueX("xid");
		if(c=="" && xid==""){
			context.redirectToPage("start");
		}
		
		if(xid!="" && xid==getUserDetails(c,"LoginToken")){
			
		}else{
			addCookieX("userid","","remove");
			addCookieX("xid","","remove");
			sessionScope.put("m","your session has expired, please login again")
			doLog("loggin out user " + c + " and redirecting back to start")
			context.redirectToPage("start");
		}
	}catch(e){
		doLog("isValidUser Error " + e,"1");
	}
}

function dynC_BeforePageLoad(){
	viewScope.remove("Msg")
}

function dynContentLoad2(){
	// Before page load dynC
	//viewScope.remove("searchquery")
	//viewScope.remove("tag")
}

function commonBeforePageLoad(){
	try{
		
		sessionScope.remove("evtype")	// remove the calendar
		if(!isValidBrowser()){
			context.redirectToPage("browser")
		}
		
		//doLog("commonBeforePageLoad1")
		//viewScope.remove("tag");
		
		validateUser();
		updateUserOnline()	// update user profile with datetime last accessed
		//lastSeen();
		
		/*
		if(getConfigDetails("LogLevel")[0] == "1"){
			context.setSessionProperty('xsp.error.page.default', true);	
		}
		*/
		
		var c = getCookieValueX("userid");
		if(c!=""){
			var lang:String = getUserDetails(c,"Language");
			var lan = context.getLocaleString();
			if(lang!="" && lang!="-" && lang != lan){
				if(lang.indexOf("-")!=-1){
					//doLog("Setting " + @Word(lang,"-",1))
					//doLog("Setting " + @Word(lang,"-",2))
					//context.setLocaleString(lang);
					//context.setLocale(new Locale(@Word(lang,"-",1), @Word(lang,"-",2)));
					facesContext.getViewRoot().setLocale(new Locale(@Word(lang,"-",1), @Word(lang,"-",2)));
										
				}else{
					//context.setLocaleString(lang);
					facesContext.getViewRoot().setLocale(new Locale(lang, lang));
				}
				context.reloadPage();
			}else{
			}
		}else{
			addCookieX("userid","","remove");
			addCookieX("xid","","remove");
			}
		
	//	getControlPanelFieldString()
		updateOnline();
		
		var ag = context.getUserAgent().getUserAgent();
		var path:string = facesContext.getExternalContext().getRequest().getRequestURI();
		var ip:string = facesContext.getExternalContext().getRequest().getRemoteAddr();
		if(getConfigDetails("LogLevel")[0] == "1"){
			doLog("User " + getUserDetails(c,"FullName")+ " USERID=" + c + " URI=" + path + " IP=" + ip + " BROWSER=" + ag)
		}	
//		facesContext.getExternalContext()
		//database.updateFTIndex(true);
		}catch(e){
			doLog("commonBeforePageLoad Error " + e,"1")
		}
}

function setAnonymousACL(level:int){
	try{
		var l;
		var db:NotesDatabase = sessionAsSignerWithFullAccess.getDatabase(database.getServer(),database.getFilePath());
		var acl:NotesACL = db.getACL();
		var entry:NotesACLEntry = acl.getEntry("Anonymous");
		
		if(entry){
			entry.setLevel(level)			// Editor	
			entry.setPublicReader(true);
			entry.setPublicWriter(false);
			acl.save();
			l = entry.getLevel();
		}else{
			doLog("anonymouos not found in ACL - Adding...")
			var entry = acl.createACLEntry("Anonymous",level);
			entry.setPublicReader(true);
			entry.setPublicWriter(false);
			acl.save();
			l = entry.getLevel();
		}
		doLog("Anonymous = " + l.toString())
		
		
	}catch(e){
		doLog("Could not set ACL for anonymous" + e,"1")
	}
}


function CKToolbars(){
	try{
		var myToolbar = "[['Font','FontSize','Preview','Bold','TextColor','BGColor','Italic','Underline','Indent','Maximize','Smiley','Table','BulletedList']]";
		return myToolbar;
	}catch(e){
		doLog("CKToolbars " + e,"1")
	}	
}

function getCurrentUserNotificationDoc(){
	
	try{
		var userid = getCookieValueX("userid");
		var v = database.getView("(LookupNotifications)");
		var userNotDoc = v.getDocumentByKey("N_USID_" + userid,true);
		return userNotDoc;
	}catch(e){
		doLog("getCurrentUserNotificationDoc" + e,"1")
	}	
	
}


function getUserLocale(){
	try{
		return getCurrentUserDoc().getItemValueString("Language")	
	}catch(e){
		return ""
	}
	
}

function isDemo(){
	try{
	var d = getConfigDetails("isDemo")[0];
	return d=="1";
	}catch(e){
		doLog("isdemo " + e,"1")
	}	

}

function isValidRegDomain(email){
	try{
		var emailDomain = @RightBack(email,"@");
		doLog("Checking Email domain " + emailDomain);
		var d = java.util.Vector();
		d = getConfigDetails("RestictEmailRegFromDomains","multi");
		if(d.contains(emailDomain)){
			return false;
		}else{
			return true;
		}
		
	}catch(e){
		doLog("isValidRegDomain error " + e,"1")
	}
}


function g(fldName){
	try{
	var key = "Wiki_S_Valid";
	var tempTreeMap:java.util.TreeMap = new java.util.TreeMap();
	var tempColl:NotesViewEntryCollection = database.getView("(LookupWiki)").getAllEntriesByKey(key,true)
	var tempEntry:NotesViewEntry = tempColl.getFirstEntry();
	var tempCollection:java.util.Collection = null;
	
	while (tempEntry != null) {
	  tempTreeMap.put(tempEntry.getDocument().getUniversalID(), tempEntry.getDocument().getItemValueString(fldName));          
	  tempEntry = tempColl.getNextEntry(tempEntry);
	}
	  
	//tempCollection = tempTreeMap.values();
	//return tempCollection.iterator();
	return tempTreeMap
	}catch(e){
		doLog("function g " + e,"1")
	}	

}


function getError(){
	try{
		var  stackTrace = "";
		var userid = getCookieValueX("userid");
		var fn = getUserDetails(userid,"FullName");
		//stackTrace = "Error for user " + fn + @NewLine();
		//stackTrace += requestScope.error.getErrorText()+ @NewLine() ;
		//stackTrace += requestScope.error.getErrorComponentId()+ @NewLine() ;
		//stackTrace += requestScope.error.getCause()+ @NewLine();
		if(requestScope.error==null){
			return "no error"
		}
		var output = requestScope.error.toString()+"\n";
		if(requestScope.error instanceof com.ibm.xsp.exception.XSPExceptionInfo)
		{
			var codeSnippet = "Cause " + requestScope.error.getErrorText(); 
			var control = requestScope.error.getErrorComponentId();
			var cause = requestScope.error.getCause();
			output += "In the control : " + control + "\n";
        	if(cause instanceof com.ibm.jscript.InterpretException){
            	var errorLine = cause.getErrorLine();
             	var errorColumn = cause.getErrorCol();
             	output += "At line " + errorLine;
             	output += ", column " + errorColumn + " of:\n";
           }else{
           	  output += "In the script:\n";
           }
           output += codeSnippet;
       }
		
		if(requestScope.error !=null){
			var  trace = requestScope.error.getStackTrace();
			for (var  i = 0; i < trace.length; i++){
				stackTrace += trace[i]+ @NewLine() ;
			}
		}else{
			stacktrace = ""
		}
		
		return  output + "\n\n" + stackTrace
		
	}catch(e){
		return  "Error in Stacktrace function " + e;
	}
}

function doLog(msg,error){
	try{
		
		var ag = context.getUserAgent().getUserAgent();
		var path:string = facesContext.getExternalContext().getRequest().getRequestURI();
		var ip:string = facesContext.getExternalContext().getRequest().getRemoteAddr();
		var m:string = facesContext.getExternalContext().getRequest().getMethod();
		var qs:string = facesContext.getExternalContext().getRequest().getQueryString();
		var extlib:string = com.ibm.xsp.extlib.util.ExtLibUtil.getExtLibVersion();
		
		//var r = facesContext.getExternalContext().getRequest()
		//var r = context.getSubmittedValue()
		var db:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(),database.getFilePath());
		var userid = getCookieValueX("userid")
		var ndoc = db.createDocument();
		ndoc.replaceItemValue("Form","Log");
		ndoc.replaceItemValue("Url",ag);
		ndoc.replaceItemValue("Path",path);
		ndoc.replaceItemValue("Method",m);
		ndoc.replaceItemValue("IP",ip);
		
		ndoc.replaceItemValue("QueryString",qs);
		//ndoc.replaceItemValue("Response",r);


		ndoc.replaceItemValue("ExtLib",extlib);
		ndoc.replaceItemValue("DomVersion",session.getNotesVersion());
		ndoc.replaceItemValue("Domain",getConfigDetails("Domain")[0]);
		ndoc.replaceItemValue("Platform",session.getPlatform());
		if(userid!=null){
			ndoc.replaceItemValue("UserID",getUserDetails(userid,"FullName") + " - " + userid);
		}
		if(error!=null){
			ndoc.replaceItemValue("isError","1");
			ndoc.replaceItemValue("Error",msg.toString() + getError());
		}else{
			ndoc.replaceItemValue("Error",msg.toString());
		}
		ndoc.computeWithForm(false,false)
		ndoc.save();
		//context.redirectToPage("oops")
	}catch(e){
		//doLog("DoLog error " + e)
	}
	
}


function getConfigDoc(){
	try{
		var db = sessionAsSigner.getDatabase(database.getServer(),database.getFilePath())
		var profDoc:NotesDocument = db.getView("(LookupFormAndID)").getDocumentByKey("Config",true);
		if(!profDoc){
			profDoc = db.createDocument();
			profDoc.replaceItemValue("Form","Config");
			profDoc.replaceItemValue("Sections","news");
			profDoc.replaceItemValue("StartSection","news");
			profDoc.computeWithForm(false,false);
			profDoc.save();
		}
		return profDoc;
	}		
	catch(e){
		doLog("getConfigDoc" + e,"1")
	}
}

function getConfigDetails(fld,multi){
	try{
		var profDoc = getConfigDoc();
		return $V(profDoc.getItemValue(fld))
	}catch(e){
		doLog("getConfigDetails" + e,"1")
	}	

}

function isAdmin(){
	try{
		var userid = getCookieValueX("userid");
		var admin = getUserDetails(userid,"Admin");
		if(admin=="1") return true
	}catch(e){
		doLog("isAdmin" + e,"1")
	}	

}

function publicDisabled(){
	try{
		if(getConfigDetails("DisablePublic")[0] == "1"){
			return true;
		}else{
			return false;
		}
	}catch(e){
		doLog("publicDisabled" + e,"1")
	}	

}

function isDebugMode(){
	try{
	var userid = getCookieValueX("userid");
	var dm = getUserDetails(userid,"DebugMode");
	if(dm=="1") return true
	}catch(e){
		doLog("isDebugMode" + e,"1")
	}	

}


function isMobileDevice(){
	try{
	var uAgent = context.getUserAgent().getUserAgent();
	if (uAgent.match("iPhone") != null || uAgent.match("iPad") != null || uAgent.match("iPod") != null || uAgent.match("Android") != null){
		return true;
	}else{
		return false;
	}
	}catch(e){
		doLog("isMobileDevice" + e,"1")
	}	

}

function isValidBrowser(){
	try{
		
		// Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11
		// Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0) 
		// Mozilla/5.0 (Windows NT 6.1; WOW64; rv:17.0) Gecko/20100101 Firefox/17.0
		// uAgent.match("Trident") != null ||
		
		var uAgent = context.getUserAgent().getUserAgent();
		if(uAgent){
			//if (uAgent.match("MSIE 8") != null || uAgent.match("MSIE 7") != null || uAgent.match("MSIE 6") != null){
			if (uAgent.match("MSIE 7") != null || uAgent.match("MSIE 6") != null){
				doLog("Not valid browser " + uAgent)
				return false;
			}else{
				return true;
			}	
		}else{
			return false;		
		}
		
	}catch(e){
		doLog("isValidBrowser " + e,"1")
	}	
}


function updateUserOnline(){
	try{
		var userdoc = getCurrentUserDoc();
		if(userdoc){
			var dt = userdoc.getItemValue("OnlineDateTime")
			if(!dt.isEmpty()){
				var dt:java.util.Vector = userdoc.getItemValueDateTimeArray("OnlineDateTime")
				var ndt1:NotesDateTime = session.createDateTime(@Text(dt.get(0)));
				var ndt2:NotesDateTime = session.createDateTime(@Text(dt.get(0)));
				ndt2.setNow();
				var dt3 = ndt2.timeDifference(ndt1);			
				var min = parseInt(dt3/60,0);
				//var hours = parseInt(min/60,0);
				//var days = parseInt(hours/24,0);
				if(min>3){
					userdoc.replaceItemValue("OnlineDateTime",ndt2)
					userdoc.save()
				}
				
				
			}else{
				var dt = session.createDateTime("Today");
				dt.setNow();
				userdoc.replaceItemValue("OnlineDateTime",dt)
				userdoc.save()
			}
		}
	}catch(e){
		return e;
	}
}

function getCurrentUserDoc(){
	try{
	var userid = getCookieValueX("userid");
	var v = database.getView("(LookupUsers)");
	var userdoc = v.getDocumentByKey("User_UNID_" + userid,true);
	return userdoc;
	}catch(e){
		doLog("getCurrentUserDoc" + e,"1")
	}	

	 
}


function openlb(){
	try{
	getComponent("linkbox").setRendered(true);
	}catch(e){
		doLog("openlb " + e,"1")
	}	

}

function getHash(thehash){
	try{
	viewScope.section = thehash;
	}catch(e){
		doLog("getHash " + e,"1")
	}	

}


function getInfo(){
	try{
	var x = "";
	x += "Number of Documents " + database.getAllDocuments().getCount();
	x += "Database size "+ database.getSize();
	return x;
	}catch(e){
		doLog("getInfo " + e,"1")
	}	

}


function getCID(){
	try{
	// return current logged in users userid
	var userid = getCookieValueX("userid");
	return getUserDetails(userid,"UniqueID");
	}catch(e){
		doLog("getCID " + e,"1")
	}	

}
function getCProfDetails(fld){
	try{
	var username = context.getUrlParameter("user");
	var doc = getUserDocByUsername(username);
	if(doc){
		return doc.getItemValueString(fld);	
	}else{
		return "";
	}
	}catch(e){
		doLog("getCProfDetails " + e,"1")
	}	

	
}

function likeUnlike(xspDoc,fldName, id){
	try{
		var fld = java.util.Vector();
		
		fld = xspDoc.getDocument().getItemValue(fldName);
		if(fld.contains(id)){
			fld.removeElement(id);
		}else{
			
			fld.add(id);
		}
		xspDoc.getDocument().replaceItemValue(fldName,fld);
		xspDoc.save();
	}catch(e){
		doLog("likeUnlide " + e,"1")
	}
}

	
function like(xspDoc){
	try{
		
		var actType="";
		var notType = "";
		var gid = context.getUrlParameter("id");
		var doc = xspDoc.getDocument();
		var choice = "";
		var userid = getCookieValueX("userid");
		var fld = java.util.Vector();
		fld = doc.getItemValue("Like");
		if(fld.contains(userid)){
			fld.removeElement(userid);
			choice = "r";
		}else{
			fld.add(userid);
			choice = "a";
		}
		doc.replaceItemValue("Like",fld);
		doc.save();
		
		
		var targetID = doc.getItemValueString("UniqueID");
		var toUserID = doc.getItemValueString("UserID");
		
		var frm = doc.getItemValueString("Form");
		//createNotification2("3", targetID,userid,toUserID);	// post
		if(frm=="Post"){
			if(choice=="a"){
				if(gid!="" && gid!=null){
					createNotification3(2,targetID, toUserID);
					createActivity(targetID,"22",gid);
				}else{
					createNotification3(2,targetID, toUserID);
					createActivity(targetID,"2");
				}
			}else{
				if(gid!="" && gid!=null){
					removeActivity(targetID,"22");
				}else{
					removeActivity(targetID,"2");
				}
			}		
			
		}else{
			if(choice=="a"){
				if(gid!="" && gid!=null){
					createNotification3(2,targetID, toUserID);
					createActivity(targetID,"23",gid);
				}else{
					createNotification3(2,targetID, toUserID);
					createActivity(targetID,"3");
				}
			}else{
				if(gid!="" && gid!=null){
					removeActivity(targetID,"23");
				}else{
					removeActivity(targetID,"3");
				}
			}
		}
		
	}catch(e){
		doLog("like error " + e,"1")
	}
}

function like2(xspDoc){
	try{
		
		var doc = xspDoc.getDocument();
		var userid = getCookieValueX("userid");
		var fld = java.util.Vector();
		fld = doc.getItemValue("Like");
		if(fld.contains(userid)){
			fld.removeElement(userid);
		}else{
			fld.add(userid);
		}
		doc.replaceItemValue("Like",fld);
		doc.save();
	}catch(e){
		doLog("like2 " + e,"1");
	}
}


function eventAction(xspDoc, fldname){
	try{
		
		
		var userid = getCookieValueX("userid");
		var evdoc = xspDoc.getDocument();
		var fld = java.util.Vector();
		var gid = evdoc.getItemValueString("GroupID")
		
		fld1 = evdoc.getItemValue("AttendID");
		if(fld1.contains(userid)){fld1.removeElement(userid)}
		
		fld2 = evdoc.getItemValue("InvitedID");
		if(fld2.contains(userid)){fld2.removeElement(userid)}
		
		fld3 = evdoc.getItemValue("NotAttendID");
		if(fld3.contains(userid)){fld3.removeElement(userid)}
		
		fld4 = evdoc.getItemValue("MaybeAttendID");
		if(fld4.contains(userid)){fld4.removeElement(userid)}
		
		evdoc.replaceItemValue("AttendID",fld1);
		evdoc.replaceItemValue("InvitedID",fld2);
		evdoc.replaceItemValue("NotAttendID",fld3);
		evdoc.replaceItemValue("MaybeAttendID",fld4);
		
		fld = evdoc.getItemValue(fldname);
		fld.add(userid)
		evdoc.replaceItemValue(fldname,fld);
		
		xspDoc.save();
		
		var targetID = xspDoc.getDocument().getItemValueString("UniqueID");
		var toUserID = xspDoc.getDocument().getItemValueString("UserID");
		if(fldname == "AttendID"){
			createActivity(targetID,6,gid)	
		}else{
			removeActivity(targetID,6,gid);	
		}
		
	}catch(e){
		doLog("event action " + e,"1")
	}
}


function createNotification3(type,targetid, toid){
	
	
	try{
		doLog("Running CreateNotification3");
		
		// 1 = Post Comment
		// 2 = Post Like,
		// 3 = Comment Like
		
		var userid = getCookieValueX("userid");
		
		// Enable this when ready
		if(userid == toid){
			// if the current user is commenting or liking his own post, skip
			doLog("not sending notification to current user")
			return false;
		}
		
		var ndoc:NotesDocument;
		
		//var now = new Date(@Now());
		//var dt:java.text.DateFormat = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        //var date = new Date(@Now());
        //var d =  dt.format(date);
		//var d = new Date(@Now());
		
		var userdoc7 = getUserDoc(toid);
		//var no = userdoc7.getItemValueInteger("Notifier");
		
		var ndoc:NotesDocument = database.getView("(LookupNotifications)").getDocumentByKey("N_USID_" + toid,true)
		if(ndoc){
			
			var no = ndoc.getItemValueInteger("Notifier");
			doLog("Adding to existing notification doc");
			//var dt = session.createDateTime(ndoc.getItemValueString(Created));
			//Set notesDateTime = notesItem.DateTimeValue
			//var dt = ndoc.getItemValueDateTimeArray("Created").get(0);
			//var jdt:java.text.DateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			//var date = new Date(dt.toJavaDate());
			//var d = jdt.format(date);
			var dt = session.createDateTime(@Now());
			//var dt = ndoc.getItemValueDateTimeArray("Created").get(0);
			var jdt:java.text.DateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			var date = new Date(dt.toJavaDate());
			var d = jdt.format(date);
			
			var t = userid + "_" + type + "_" + targetid + "_" + d + " CET";
			var fldv1:java.util.Vector = ndoc.getItemValue("FromKey");
			fldv1.insertElementAt(t,0);
			ndoc.replaceItemValue("FromKey",fldv1);
			ndoc.replaceItemValue("Type",type);
			ndoc.replaceItemValue("Notifier",no + 1);
			ndoc.computeWithForm(true,true);
			ndoc.save();
			
				
		}else{
			
			doLog("creating new notification doc")
			ndoc = database.createDocument();
			var dt = session.createDateTime(@Now());
			var jdt:java.text.DateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			var date = new Date(dt.toJavaDate());
			var d = jdt.format(date);
			var t = userid + "_" + type + "_" + targetid + "_" + d + " CET";
			ndoc.replaceItemValue("UserID",toid);
			ndoc.replaceItemValue("FromKey",t);
			ndoc.replaceItemValue("Form","N");
			ndoc.replaceItemValue("Type",type);
			ndoc.replaceItemValue("Notifier",1);
			ndoc.computeWithForm(true,true);
			ndoc.save();
		}
		//userdoc7.replaceItemValue("Notifier",no + 1);
		//userdoc7.save();
		
		var d:NotesDocment = getDoc(targetid);
		if(d.isResponse()){
			unid = d.getParentDocumentUNID();
		}else{
			var unid = d.getUniversalID();	
		}
		
		// SEND MAIL
		
		var email = userdoc7.getItemValueString("Email");
		var fn = userdoc7.getItemValueString("FullName");
		var first = userdoc7.getItemValueString("FirstName");
		var fromuser = getUserDetails(userid,"FullName");
		var name = getConfigDetails("Name")[0];
		
		var txt="";
		if(type==0) txt = "<p>" + fromuser  + " has joined</p>";
		if(type==1) txt = "<p>" + fromuser  + " made a comment on your post</p>";
		if(type==2) txt = "<p>" + fromuser  + " like your post</p>";
		if(type==3) txt = "<p>" + fromuser  + " likes a comment you made</p>";
		
		// we are not handling likes and comments from a group here group.xsp#content=news
		
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var url = getConfigDetails("domain")[0] + "/" + database.getFilePath() 
		var mail = new HTMLMail();
		var to =  fn + " <" + email + ">"
		mail.setTo(to);
		mail.setSubject(name + " Update");
		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
		mail.addHTML("<p>Hello " + first  + "</p>");	
		mail.addHTML(txt);
		mail.addHTML("<p><a href='" + url + "'>Visit " + name + "</a></p>");
		mail.addHTML("<p>You can change the notification settings in your profile</p>");
		mail.addHTML("</div>");
		mail.setSender(emailfrom, name);

		switch(type){
		case 0:
			if(getUserDetails(toid,"SendMail_NewUser") == "1"){
				mail.send();
				doLog("Mail send to " + to + " for notification " + type);
			}else{
				doLog("No mail to user " + to + " for notification " + type + " mail notification switched off");
			}
			break;
			
		case 1:	
			if(getUserDetails(toid,"SendMail_CommentPost") == "1"){
				mail.send();
				doLog("Mail send to " + to);
			}else{
				doLog("No mail to user " + to + " mail notification switched off");
			}
			break;
		case 2:	
			if(getUserDetails(toid,"SendMail_LikePost") == "1"){
				mail.send();
				doLog("Mail send to " + to);
			}else{
				doLog("No mail to user " + to + " mail notification switched off");
			}
			break;
		case 3:	
			if(getUserDetails(toid,"SendMail_LikeComment") == "1"){
				mail.send();
				doLog("Mail send to " + to);
			}else{
				doLog("No mail to user " + to + " mail notification switched off");
			}
			break;
		default:
			mail.send();
			doLog("Mail send to " + to);
		}
		
		
		
		// send mail to user
		// 1 = Post Comment
		// 2 = PostLike,
		// 3 = Comment Like
		
	
	} catch(e){
		doLog("createNotification3 " + e,"1");
	}
}

function removeActivity(targetid,tp){
	
	try{
		
		var userid = getCookieValueX("userid");
		var doc;
		var key ="";
		if(tp=="" || tp ==null){
			key = "A_TID_" + targetid;
		}else{
			key = "A_USID_" + userid + "_TID_" + targetid + "_TYPE_" + tp;	
		}
		
		
		var dc:NotesDocumentCollection = database.getView("(LookupA)").getAllDocumentsByKey(key,true);
		for(var i=1;i<=dc.getCount();i++){
			rdoc = dc.getNthDocument(i);
			if(rdoc){
				rdoc.replaceItemValue("HidDelete","1");
				rdoc.save();
			}		
		}
	}catch(e){
		doLog("removeActivity " + e,"1");
	}
}

function createActivity(targetid,type,groupid,userdoc){
	
	try{
		
		if(userdoc){
			var userid = userdoc.getItemValueString("UserID");
		}else{
			var userid = getCookieValueX("userid");
		}
		if(groupid==null || groupid =="undefined"){
			groupid="";
		}
		
		if(targetid==null || targetid =="undefined"){
			targetid="";
		}
		
		var d = getDoc(targetid);
		
		if(userid!=""){
			var ndoc:NotesDocument;
			ndoc = database.createDocument();
			ndoc.replaceItemValue("Form","A");
			ndoc.replaceItemValue("UserID",userid);
			ndoc.replaceItemValue("GroupID",groupid);
			ndoc.replaceItemValue("TargetNoteID",d.getUniversalID());
			ndoc.replaceItemValue("TargetID",targetid);
			ndoc.replaceItemValue("Type",@Text(type));
			ndoc.computeWithForm(true,true);
			ndoc.save();
			doLog("Activity Created for user " + getUserDetails(userid,"FullName"));
		}else{
			doLog("cookie not found");
		}
		
	} catch(e){
		doLog("createActivity " + e,"1");
	}
}

function getProfileImageUrl(userid, fld){
	try{
	var imgid = getUserDetails(userid,"ImageID");
	var photodoc = database.getView("(LookupPhotos)").getDocumentByKey("Photo_UNID_" + imgid,true)
	if(photodoc){
		if(fld==null || fld==""){
			var url = photodoc.getItemValueString("ImageUrl1")	
		}else{
			var url = photodoc.getItemValueString(fld)
		}
		
		if(url==""){
			return "/images.jpg";
		}else{
			return url;
		}
	}else{
		return "/images.jpg";
	}
	}catch(e){
		doLog("getProfileImageUrl " + e,"1")
	}	

}


function isCurrentUserProfile(){
	try{
	var userid = getCookieValueX("userid");
	var username = context.getUrlParameter("user");
	var userdoc = getUserDocByUsername(username);
	
	if(userdoc){
		var id = userdoc.getItemValueString("UniqueID");
		if(id == userid){
			return true;
		} else{
			return false;
		}
		
	}else{
		return false;
	}
	}catch(e){
		doLog("isCurrentUserProfile " + e,"1")
	}	

}

function isGroupModerator(){
	try{
	var userid = getCookieValueX("userid");
	var groupid = context.getUrlParameter("id");
	var gdoc = database.getView("(LookupGroups)").getDocumentByKey("Group_UNID_" +groupid,true);
	if(gdoc){
	
	var fld:java.util.Vector = gdoc.getItemValue("ModeratorsID");
	if(fld.contains(userid)){
		return true;
	}else{
		return false;
	}
	}else{
		return false;
	}
	}catch(e){
		doLog("isGroupModerator " + e,"1")
	}	

}


function isGroupMember(){
	try{
	var userid = getCookieValueX("userid");
	var groupid = context.getUrlParameter("id");
	var gdoc = database.getView("(LookupGroups)").getDocumentByKey("Group_UNID_" +groupid,true);
	var fld:java.util.Vector = gdoc.getItemValue("MembersID");
	if(fld.contains(userid)){
		return true;
	}else{
		return false;
	}
	}catch(e){
		doLog("isGroupMember" + e,"1")
	}	

}

// Used in ft search
function isGroupMember2(userid,groupid){
	try{
		var gdoc = database.getView("(LookupGroups)").getDocumentByKey("Group_UNID_" +groupid,true);
		var fld:java.util.Vector = gdoc.getItemValue("MembersID");
		if(fld.contains(userid)){
			return true;
		}else{
			return false;
		}
	}catch(e){
		doLog("isGroupMember2 " + e,"1")
	}	

}





function isAdminSectionEnabled(sectionname){
	try{
	var profDoc = getConfigDoc();
	var fld:java.util.Vector = profDoc.getItemValue("Sections");
	if(fld.contains(sectionname)){
		return true;
	}else{
		return false;
	}
	}catch(e){
		doLog("isAdminSectionEnabled " + e,"1")
	}	

}


function isSectionEnabled(sectionname){
	try{
	var userid = getCookieValueX("userid");
	var groupid = context.getUrlParameter("id");
	var gdoc = database.getView("(LookupGroups)").getDocumentByKey("Group_UNID_" +groupid,true);
	var fld:java.util.Vector = gdoc.getItemValue("Sections");
	if(fld.contains(sectionname)){
		return true;
	}else{
		return false;
	}
	}catch(e){
		doLog("isSectionEnabled" + e,"1")
	}	

}

function getImageDoc(imageid){
	try{
	var imagedoc = database.getView("(LookupPhotos)").getDocumentByKey("Photo_UNID_" + imageid,true);
	return imagedoc;	
	}catch(e){
		doLog("getImageDoc" + e,"1")
	}	

}

function getPhotoDetails(photoid,fldname){
	try{
	var imagedoc = database.getView("(LookupPhotos)").getDocumentByKey("Photo_UNID_" + photoid,true);
	return imagedoc.getItemValueString(fldname);
	}catch(e){
		doLog("getPhotoDetails " + e,"1")
	}	

}

function ensureAlbum(from){

	// when uploading pictures, ensure the current user or group has an album, e.g Wall
	try{
	
	var userid = getCookieValueX("userid");

	if(from==2){	// return the first ph	photoalbum found, if not found create a new
		
		var padoc = database.getView("(LookupPhotoAlbum)").getDocumentByKey("PhotoAlbum_PID_" + userid,true)
		profileid = userid;
		groupid="";

	}else{
		
		var padoc = database.getView("(LookupPhotoAlbum)").getDocumentByKey("PhotoAlbum_GROUPID_" + groupid,true)
		var groupid = context.getUrlParameter("id");
		profileid = "";
		
	}
	
	if(padoc){
		doLog("Album exist");
		return padoc.getItemValueString("UniqueID");
	}else{
		doLog("Creating new album");
		padoc = database.createDocument()
		padoc.replaceItemValue("Form","PhotoAlbum");
		padoc.replaceItemValue("GroupID",groupid);
		padoc.replaceItemValue("ProfileID",profileid);
		padoc.replaceItemValue("UserID",userid);
		padoc.replaceItemValue("AlbumName","Album1");
		padoc.computeWithForm(true,true);
		padoc.save();
		doLog("albumid = " + padoc.getItemValueString("UniqueID"));
		return padoc.getItemValueString("UniqueID");
	}
	}catch(e){
		doLog("ensureAlbum " + e,"1")
	}	
}

function getPath(){
	
	// photo conversion require a temporary path
	// let's use temp relative to data dir domino\data\intratmp
	// for linux it will be domino/data/temp
	try{
		var d = session.getEnvironmentString("directory",true)
		var s = java.io.File.separator
		var path = d + s + "intratmp" + s
		var dir:java.io.File = new java.io.File(path);  
		dir.mkdir();
		return path;
	}catch(e){
		doLog("getpath " + e,"1")	
	}
}

function uploadWallPhotos(from,doc,albumID){
	
//importPackage(com.notessidan.se);

	
	
try{
	
	var c=0;
	doLog("uploadWallPhotos start1");
	// save the new photo to a tmpdoc
	//newpost.save();
	var userid = getCookieValueX("userid");
	//albumID = getComponent("comboBox1").getValue();
		
	// If no file was attached, remove the tmpdoc	
	var rt = doc.getDocument().getFirstItem("Body");
	if(rt==null){
		doLog("uploadWallPhotos start2");
//		newPhoto.getDocument().remove(true);
		return;
	}
	
	// get the file
	var v:java.util.Vector = rt.getEmbeddedObjects();
	var it:java.util.Iterator = v.iterator();
	
	var eo:NotesEmbeddedObject = null;
	var newfile:String = null;
	//print("start looping through embedded objects");
	//print("uploadWallPhotos start3");
	
	var newPhotoDoc:NotesDocument = null;
	var rtResized=null;
	var un = "";
	
	// iterate all files, currently can only be one
	while (it.hasNext()) {
	    //print("uploadWallPhotos start4");
	    eo = it.next();
	    un = @Unique(); 
		
		// create a photodoc for the current user or group		
		newPhotoDoc = database.createDocument();
		rtResized = newPhotoDoc.createRichTextItem("Body");	
	
		if(from==1){	// New photo in profile wall or public wall
			newPhotoDoc.replaceItemValue("ProfileID",userid);
		
		}else if(from==2){ // Group
			var groupid = context.getUrlParameter("id");
			newPhotoDoc.replaceItemValue("GroupID",groupid);
		
		} 
		//print("uploadWallPhotos start5");
			
	    newPhotoDoc.replaceItemValue("Form","Photo");
	    newPhotoDoc.replaceItemValue("UserID",userid);
	    newPhotoDoc.replaceItemValue("AlbumID",albumID);
	    
	    //newFile1 = "c:\\temp\\" + un + "_s.jpg";       
	    newFile1 = getPath() + un + "_s.jpg";
	    var jp1:ScaledImageT = new ScaledImageT(eo.getInputStream(), newFile1);
	    jp1.saveScaledInstance( 50,50, newFile1);
	    jp1=null;
	    rtResized.embedObject(lotus.domino.local.EmbeddedObject.EMBED_ATTACHMENT, "", newFile1, null);
		
		//newFile2 = "c:\\temp\\" + un + "_b.jpg";       
		newFile2 = getPath() + un + "_b.jpg";
	    var jp2:ScaledImageT = new ScaledImageT(eo.getInputStream(), newFile2);
	    jp2.resizeFixedWidth( newFile2, 640 );
	    jp2=null;
	    rtResized.embedObject(lotus.domino.local.EmbeddedObject.EMBED_ATTACHMENT, "", newFile2, null);
	    
	    //newFile3 = "c:\\temp\\" + un + "_p.jpg";
	    newFile3 = getPath() + un + "_p.jpg";
	    var jp3:ScaledImageT = new ScaledImageT(eo.getInputStream(), newFile3);
	    jp3.resizeFixedWidth( newFile3, 200 );
	    jp3=null;
	    rtResized.embedObject(lotus.domino.local.EmbeddedObject.EMBED_ATTACHMENT, "", newFile3, null);
	    
	    newPhotoDoc.computeWithForm(false,false);
		newPhotoDoc.save();
		
		eo.close();		// important, causes temporary file on server to be deleted
		eo.recycle();
	    
	    //remove the thumbnail from the filesystem using java reflection syntax
	    //see http://www-10.lotus.com/ldd/nd85forum.nsf/0/ac82b7b0e187ed598525775b00671972?OpenDocument
	    doLog("uploadWallPhotos delete thumbnail at " + newFile1);
	    doLog("uploadWallPhotos delete thumbnail at " + newFile2);
	    doLog("uploadWallPhotos delete thumbnail at " + newFile3);
	    //var file:java.io.File = new java.io.File(newfile);
	    var file1:java.io.File = new java.io.File(newFile1);
	    file1.getClass().getMethod("delete", null).invoke(file1, null);
	    file1 = null;
	    
	    var file2:java.io.File = new java.io.File(newFile2);
	    file2.getClass().getMethod("delete", null).invoke(file2, null);
	    file2 = null;
	    
	    var file3:java.io.File = new java.io.File(newFile3);
	    file3.getClass().getMethod("delete", null).invoke(file3, null);
	    file3 = null;
	    c++;
		    
	}
	
	doc.getDocument().getFirstItem("Body").remove();
	
	var photoid = newPhotoDoc.getItemValueString("UniqueID");
	var url = getPhotoDetails(photoid,"ImageURL2");
	var imgcontent = "<div class='postimg'><img src='/" +url + "'></div>";
	doc.replaceItemValue("Content",doc.getItemValueString("Content") + imgcontent)
	doc.save();
	
	//getComponent("computedField1").setValue("The image= <img src='href=/vwicn160.gif'>");
	//getComponent("msg").setValue(c + " Images added to photo album " + getComponent("comboBox1").getValue());
	//getComponent("upload").setRendered(false);
	
}catch(e){
	doLog("uploadWallPhotos "+ e,"1");
	//getComponent("msg").setValue("Error " + e + " - " + newfile);
}


	
	
}

function hideIfEmpty(doc,component){

	try{
	var v = getComponent(component).getValue();
	if(!doc.isEditable()){
		if(v=="" || v == null){
			return false;
		}else{
			return true;
		}
	}else{
		return true;
	}
	
	}catch(e){
		
		return true;
	}
}

function saveForumPost(){
try{
	var userid = getCookieValueX("userid");
	var groupid = context.getUrlParameter("id");
	newforumpost.replaceItemValue("GroupID",groupid);
	newforumpost.replaceItemValue("UserID",userid);
	var content = getComponent("inputTextarea1").getValue();
	var x = @ReplaceSubstring(content,@NewLine(),"<br />");
	newforumpost.replaceItemValue("Content",x);
	newforumpost.save();
	database.getView("(LookupForumPosts)").refresh();
}catch(e){
	doLog("saveForumPost " + e,"1")
}	

}

function saveItemPost(){
try{
	var userid = getCookieValueX("userid");
	var groupid = context.getUrlParameter("id");
	newitem.replaceItemValue("GroupID",groupid);
	newitem.replaceItemValue("UserID",userid);
	var content = getComponent("contentbox").getValue();
	var x = @ReplaceSubstring(content,@NewLine(),"<br />");
	newitem.replaceItemValue("Content",x);
	newitem.save();
	database.getView("(LookupItem)").refresh();
}catch(e){
	doLog("saveItemPost " + e,"1")
}	

}

function saveForumPostComment(){
	try{
	var groupid = context.getUrlParameter("id");
	var userid = getCookieValueX("userid");
	newComment.replaceItemValue("UserID",userid);
	
	var content = getComponent("inputTextarea2").getValue();
	var x = @ReplaceSubstring(content,@NewLine(),"<br />");
	newComment.replaceItemValue("Content",x);
	newComment.replaceItemValue("GroupID",groupid);
	
	newComment.save();
	newComment.replaceItemValue("Content","");
	}catch(e){
		doLog("saveForumPostComment " + e,"1")
	}	

	
}

function getCurrentProfileImageUrl(fldname){
	try{
		var username = context.getUrlParameter("user");
		var userdoc = getUserDocByUsername(username);
		
		if(userdoc){
			var profid = userdoc.getItemValueString("UniqueID");
			var id = getUserDetails(profid,"ImageID");
			var imagedoc = getImageDoc(id);
			var url = imagedoc.getItemValueString(fldname);
			if(url==""){
				return "/images.jpg";
			}else{
				return url;
			}
		}
	}catch(e){
		return "/images.jpg";
	}
}



function getCurrentUserImageUrl(){
	try{
	
		var userid = getCookieValueX("userid");
		var id = getUserDetails(userid,"ImageID");
		var imagedoc = getImageDoc(id);
		var url = imagedoc.getItemValueString("ImageUrl1");
		if(url==""){
			return "/images.jpg";
		}else{
			return url;
		}
	}catch(e){
		return "/images.jpg";
	}
}

function getCurrentGroupImageUrl(){
	try{
		var groupid = context.getUrlParameter("id");
		var gdoc = getDoc(groupid);
		var photoid = gdoc.getItemValueString("ImageID")
		var imagedoc = getDoc(photoid);
		var url = imagedoc.getItemValueString("ImageUrl1");
		if(url==""){
			return "/group50.jpg";
		}else{
			return url;
		}
	}catch(e){
		return "/group50.jpg";
	}
}


function getUserDoc(userid){
	try{
		if(userid!=""){
			var v = database.getView("(LookupUsers)");
			var userdoc = v.getDocumentByKey("User_UNID_" + userid,true);
			return userdoc;
		}
	}catch(e){
		doLog("getUserDoc " + e,"1")
	}	

}
function getGroupDoc(groupid){
	try{
	var groupdoc = database.getView("(LookupGroups)").getDocumentByKey("Group_UNID_" + groupid,true);
	return groupdoc;
	}catch(e){
		doLog("getGroupDoc " + e,"1")
	}	

}
function getUserDocByUsername(username){
	try{
	var userdoc = database.getView("(LookupUsers)").getDocumentByKey("User_USER_" + username,true);
	return userdoc;
	}catch(e){
		doLog("getUserDocByUsername "+ e,"1")
	}	

}


function removeDomCookies(name){
	try{
	var response = facesContext.getExternalContext().getResponse();
	var c = new javax.servlet.http.Cookie(name,"");
	var path = "/"
	c.setMaxAge(0);
	c.setPath(path);
	response.addCookie(c);
	}catch(e){
		doLog("removeDomCookies " + e,"1")
	}	

}

function addCookieX(name,value,type){

	try{
	
		var response = facesContext.getExternalContext().getResponse();
		var c = new javax.servlet.http.Cookie(name,value);
		//doLog("SE get add cookieX");
		var path = "/" + @LowerCase(@Implode(session.evaluate("@WebDbName"))) + "/";
		//var path = "/" + @LowerCase(@Implode(session.evaluate("@WebDbName"))) 
		//var path = "/";
		if(type=="store"){
			c.setMaxAge(400000);	
			c.setPath(path);
			//c.setPath(path);
		}else if(type=="remove"){
			c.setMaxAge(0);
			c.setPath(path);
		}else if(type=="session"){
			c.setMaxAge(-1);
			c.setPath(path);
		}
		
		response.addCookie(c);
		
	
	}catch(e){
		doLog("AddCookieX " + e,"1") 
	}
}








function saveStreamComment(){
	
	try{
		// ccStream
		var gid = context.getUrlParameter("id");
		var userid = getCookieValueX("userid")
		var x = getComponent("inputTextarea1").getValue();
		//var respdoc = database.createDocument();
		newcomment.replaceItemValue("Form","Comment");
		newcomment.replaceItemValue("UserID",userid);
		var cont = @ReplaceSubstring(x,@NewLine(),"<br />");
		newcomment.replaceItemValue("Content",cont);
		newcomment.replaceItemValue("GroupID",gid);
		newcomment.replaceItemValue("ParentUserID",post.getDocument().getItemValueString("UserID"));
		//newcomment.makeResponse(post.getDocument());
		newcomment.save();
		
		
		// save the userid to the post/parent.
		var fld = java.util.Vector();
		fld = post.getItemValue("CommentUserID");
		if(!fld.contains(userid)){
			fld.add(userid)
			@Unique(post.replaceItemValue("CommentUserID",fld))
			post.save();
		}
		
		database.getView("(LookupPosts)").refresh();
		getComponent("inputTextarea1").setValue("");
		
		var commentID = newcomment.getDocument().getItemValueString("UniqueID");
		var toUserID = post.getDocument().getItemValueString("UserID");
		//createNotification2("2",commentID,userid,toUserID);
		
		// We have already saved all the userids that have commented in a unique field in the post
		// now loop all userids and create a notification for them
		for(var i=0;i<fld.size();i++)
		{
			if(userid!=fld.get(i)){
				createNotification3(1,commentID, fld.get(i));
			}
		}
		createNotification3(1,commentID, toUserID);
		
		// Removed due to new activity stream
		/*
		var gid = context.getUrlParameter("id");
		if(gid!="" && gid!=null){
			createActivity(commentID,21,gid );	
		}else{
			createActivity(commentID,1 );
		}
		*/
		
	}catch(e){
		doLog("saveStreamComment " + e,"1");
	}
	
}

function isValidGroup(){
	try{
		var gid = context.getUrlParameter("id");
		if(gid!=""){
			var v = database.getView("(LookupGroups)")
			var doc = v.getDocumentByKey("Group_UNID_" + gid,true);
			if(doc){
				return true
			}
		}
	}catch(e){
		doLog("isValidGroup " + e,"1")
	}
}


function getDoc(id){
	try{
		var v = database.getView("(LookupAllID)")
		var doc = v.getDocumentByKey(id,true);
		return doc;
	}catch(e){
		doLog("getDoc " + e,"1")
	}
}
function getDocRemoved(id){
	try{
		var v = database.getView("(LookupAllIDRemoved)")
		var doc = v.getDocumentByKey(id,true);
		return doc;
	}catch(e){
		doLog("getDocRemoved " + e,"1")
	}
}


function getEventDetails(eventid, fld){
	try{
		var v = database.getView("(LookupFormAndID)")
		var key = "Event" + eventid;
		var evdoc = v.getDocumentByKey(key,true);
		if(evdoc){
			return evdoc.getItemValueString(fld);	
		}else{
			return "event not found - " + key;
		}
	}catch(e){
		doLog("getEventDetails "+ e,"1")
	}
}


function getGroupDetails(groupid, fld,multi){
	try{
		
		var v = database.getView("(LookupFormAndID)")
		var key = "Group" + groupid;
		var grdoc = v.getDocumentByKey(key,true);
		if(grdoc){
			return $A(grdoc.getItemValue(fld))
			//return grdoc.getItemValue(fld).toArray();
		}else{
			//doLog("getGroupDetails " + key)
			return "getGroupDetails " + key;
		}
	}catch(e){
		doLog("getGroupDetails " + e,"1")
	}
}
function getGroupDetails2(groupid, fld){
	try{
		var v = database.getView("(LookupFormAndID)")
		var key = "Group" + groupid;
		var grdoc = v.getDocumentByKey(key,true);
		if(grdoc){
			return grdoc.getItemValue(fld)	
		}else{
			return null
		}
	}catch(e){
		doLog("getGroupDetails2 " + e,"1")
	}
}




function getUserDetails(userid, fld, multi){
	try{
		var v = database.getView("(LookupFormAndID)")
		if(!v){
			return "view not found";
		}
		if(userid!=""){
			var key = "User" + userid;
			var userdoc = v.getDocumentByKey("User" + userid,true);
			if(userdoc){
				if(multi!="" && multi!=null){
					return userdoc.getItemValue(fld).toArray();	
				}else{
					return userdoc.getItemValueString(fld);
				}
			}else{
				return "";
			}
		}
	}catch(e){
		doLog("getUserDetails" + e,"1");
		return ""
	}
}


function getDocDetails(form, userid, fld){
	try{
		var v = database.getView("(LookupFormAndID)")
		if(!v){
			return "view not found";
		}
		var key = form + userid;
		var doc = v.getDocumentByKey(key,true);
		if(doc){
			return doc.getItemValueString(fld);	
		}else{
			return "Doc not found - " + key;
		}
	}catch(e){
		doLog("getDocDetails " + e,"1")
	}
}




function toggleLibraryFiles(){
	
	try{
	//ccLibrary
	
	var icon = getComponent("exp");
	var p = getComponent("filesPanel");
	if(p.rendered){
		p.setRendered(false);
		icon.setUrl("/expand.gif");
	}else{
		p.setRendered(true);
		icon.setUrl("/collapse.gif");
	}
	}catch(e){
		doLog("toggleLibraryFiles " + e,"1")
	}	

}

// Helper for inconsistent API
// Wrap around @DbLookup/@DbColumn/@Trim/@Unique calls to have an array returned
function $A( object ){
	try{
 // undefined/null -> empty array
 if( typeof object === 'undefined' || object === null){ return []; }
 
 // Collections (Vector/ArrayList/etc) -> convert to Array
 if( typeof object.toArray !== 'undefined' ){
  return object.toArray();
  
 }
 
 // Array -> return object unharmed 
 if( object.constructor === Array ){ return object; }  
 
 // Return array with object as first item
 return [ object ];
	}catch(e){
		doLog("$A " + e,"1")
	}	

}








function sendNewMessage(sendToId){
	try{
	doLog("Running Send New Message SendToId = " + sendToId + getUserDetails(sendToId,"FullName"))
	var userid = getCookieValueX("userid");
	//var sendToId = getComponent("sendToID").getValue();
	
	if(userid==sendToId){
		getComponent("msg").setValue("You cannot send a message to yourself, sorry!");
		return false;
	}
	newmessage.replaceItemValue("OriginFromID",userid);
	newmessage.replaceItemValue("SendToID",sendToId);	//new
	newmessage.replaceItemValue("FromID",userid);
	newmessage.replaceItemValue("OriginSendToID",sendToId);

	var x = getComponent("inputTextarea1").getValue();
	var cont = @ReplaceSubstring(x,@NewLine(),"<br />");
	newmessage.replaceItemValue("Body",cont);
	newmessage.replaceItemValue("UnreadID",sendToId);
	//newmessage.replaceItemValue("Unread",sendToId);	//userid to show as unread for
	newmessage.replaceItemValue("ModDate",@Now());
	newmessage.save();
	
	var first = getUserDetails(sendToId,"FirstName");
	var fn = getUserDetails(sendToId,"FullName");
	var email = getUserDetails(sendToId,"Email");
	var name = getConfigDetails("Name")[0];
	if(email=="" || email ==null || email.indexOf("@")==-1){
		doLog("Could not send message to " + fn + " not valid email");
		return false;
	}
	
	var emailfrom = getConfigDetails("EmailFrom")[0]
//	var url = getConfigDetails("domain")[0] + "/" + database.getFilePath() 
	var url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=messages&noteid=" + newmessage.getDocument().getUniversalID();
	var mail = new HTMLMail();
	var to =  fn + " <" + email + ">"
	mail.setTo(to);
	mail.setSubject("New private message recieved in " + name);
	mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
	mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
	mail.addHTML("<p>Hi " + first  + "</p>");
	mail.addHTML("<p>You have recieved a new private message from " + getUserDetails(userid,"FullName")+ "</p>");
	mail.addHTML("<p>Subject: " + newmessage.getItemValueString("Subject") + "</p>");
	mail.addHTML("<p>" + newmessage.getItemValueString("Body") + "</p>");
	mail.addHTML("<p><a href='" + url + "'>Open Message</a></p>");
	

	mail.addHTML("<p>You can change the notification settings in your profile</p>");
	mail.addHTML("</div>");
	mail.setSender(emailfrom, name);
	
	if(getUserDetails(sendToId,"SendMail_PrivateMessage") == "1"){
		doLog("Sending mail to " + to);
		mail.send();
		doLog("Mail sent to " + email);
	}else{
		doLog("No notification Mail send to " + to + " user tunrned this off");
	}
	//mail.send();
	//doLog("Mail send to " + to);
	
	
	newmessage.replaceItemValue("SendTo","");
	newmessage.replaceItemValue("Subject","");
	newmessage.replaceItemValue("Body","");
	//sessionScope.put("messagedisplay",1);
	//getComponent("msg").setValue("Message has been sent");
	}catch(e){
		doLog("sendNewMessage " + e,"1")
	}	

}

function saveMessageComment(){
	
	try{
		// ccMessages
		
		var userid = getCookieValueX("userid");
		var x = getComponent("addcomment").getValue();
		newreply.replaceItemValue("Form","Comment");
		newreply.replaceItemValue("UserID",userid);
		newreply.replaceItemValue("Hide","1");	// Important, this hide message comments from activity stream
		var cont = @ReplaceSubstring(x,@NewLine(),"<br />");
		newreply.replaceItemValue("Content",cont);
		//newreply.getDocument().makeResponse(onemessage.getDocument());
		newreply.save();
		
		// update parent/message
		var unid = onemessage.getDocument().getUniversalID()

		var parentdoc:NotesDocument = database.getDocumentByUNID(unid);
		var sendToId = parentdoc.getItemValueString("SendToID");
		var fromId = parentdoc.getItemValueString("FromID");
		if(userid==sendToId){
			toId = fromId;
		}else{
			toId = sendToId;
		}
		var dt = session.createDateTime(@Now());
		parentdoc.replaceItemValue("SendToID",toId);
		parentdoc.replaceItemValue("FromID",userid);
		parentdoc.replaceItemValue("ModDate",dt);
		parentdoc.replaceItemValue("UnreadID",toId);
		
	
	//	message.replaceItemValue("UnreadID",sendToId);	//userid to show as unread for
		//message.getDocument().computeWithForm(false,false);
		parentdoc.computeWithForm(false,false)
		parentdoc.save();
		
		var first = getUserDetails(toId,"FirstName");
		var fn = getUserDetails(toId,"FullName");
		var email = getUserDetails(toId,"Email");

		
		if(email=="" || email ==null || email.indexOf("@")==-1){
			//email = "thomas.adrian@consili.se"
			doLog("Could not send message to " + fn + " not valid email");
			return false;
		}

		
		var emailfrom = getConfigDetails("EmailFrom")[0];
		var name = getConfigDetails("Name")[0];

		var resp=null;
		var msgContent = "<div style='padding:10px'>Message sent" + parentdoc.getCreated() + " by " + getUserDetails(parentdoc.getItemValueString("UserID"),"FullName") + "</div>" 
		var msgContent = "<div style='padding:10px'>" + parentdoc.getItemValueString("Body") + "</div>" 
		var dc = parentdoc.getResponses();
		for(var i=1;i<=dc.getCount();i++){
			resp = dc.getNthDocument(i)
			msgContent+= "<div style='margin:10px;padding:10px;background-color:#FFF'>"
			msgContent+= "<div>Reply sent " + resp.getCreated() + " by " + getUserDetails(resp.getItemValueString("UserID"),"FullName") + "</div>"
			msgContent+= "<div style='padding:10px'>" + resp.getItemValueString("Content") + "</div>"
			msgContent+= "</div>"
		}
		
		
//		var url = getConfigDetails("domain")[0] + "/" + database.getFilePath() 
		var url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=messages&noteid=" + parentdoc.getUniversalID();
		var mail = new HTMLMail();
		var to =  fn + " <" + email + ">"
		mail.setTo(to);
		mail.setSubject("New private message reply recieved in " + name );
		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
		mail.addHTML("<p>Hi " + first  + "</p>");
		mail.addHTML("<p>You have recieved a new message reply from " + getUserDetails(userid,"FullName")+ "</p>");
		mail.addHTML("<p>Subject: " + parentdoc.getItemValueString("Subject") + "</p>");
		mail.addHTML(msgContent);
		mail.addHTML("<p><a href='" + url + "'>Open Message</a></p>");
		mail.addHTML("<p>You can change the notification settings in your profile</p>");
		mail.addHTML("</div>");
		
		mail.setSender(emailfrom, name);

		doLog("Sending mail to " + to);
		if(getUserDetails(sendToId,"SendMail_PrivateMessage") == "1"){
			doLog("Sending mail to " + to);
			mail.send();
			doLog("Mail sent to " + email);
		}else{
			doLog("No notification Mail send to " + to + " user tunrned this off");
		}
		getComponent("addcomment").setValue("");
		//getComponent("msg").setValue("Message has been sent");
	}catch(e){
		doLog("saveMessageComment " + e,"1");
	}
}

function getCookieValueX(cookieName){
	//doLog("getCookieValueX for: " + cookieName, "1");
	try{
		/*
		if(cookieName.equals('userid')){
			//I have a section that erases cookies. If it does that the scoped variable should be there
			if(cookie.get(cookieName).getValue() == null || cookie.get(cookieName).getValue() == 'undefined'){
				doLog("getCookieValueX returning sessionScope null/undef", "1");
				if(sessionScope.containsKey('userid')){
					return sessionScope.userid;
				} else {
					return "";
				}
			} else {
				doLog("getCookieValueX returning cookie in if", "1");
				return cookie.get(cookieName).getValue();			
			}
		}
		doLog("getCookieValueX not userid", "1");
		*/
		return cookie.get(cookieName).getValue();
	}catch(e){
		//doLog("getCookieValueX Error " + e, "1");
		return ""
	}
}    


function getCookieValueY(cookieName){
	try{
	var request = facesContext.getExternalContext().getRequest(); 
	var cookies = request.getCookies();
	if(cookies!=null){
		for(var i=0; i<cookies.length; i++) {
		     var c = cookies[i];
		     if(cookieName.equals(c.getName())){
		     	return(c.getValue());
		     }
		}
	}
	}catch(e){
		doLog("getCookieValueY " + e,"1")
	}	

}    

function removeCookieX(cookieName){
try{
	// NOT WORKING
	var request = facesContext.getExternalContext().getRequest();
//	request.setContentType("text/html"); 
	var cookies = request.getCookies();
	for(var i=0; i<cookies.length; i++) {
	     var c = cookies[i];
	     if(cookieName.equals(c.getName())){
	     	c.setMaxAge(-1);
	     }
	}
}catch(e){
	doLog("removeCookieX " + e,"1")
}	

}

/** * Get the ISO week date week number */ 
Date.prototype.getWeek = function () {
	 // Create a copy of this date object 
	 var target = new Date(this.valueOf()); 
	// ISO week date weeks start on monday 
	// so correct the day number 
	var dayNr = (this.getDay() + 6) % 7; 
	// Set the target to the thursday of this week so the 
	// target date is in the right year 
	target.setDate(target.getDate() - dayNr + 3); 
	// ISO 8601 states that week 1 is the week 
	// with january 4th in it 
	var jan4 = new Date(target.getFullYear(), 0, 4); 
	// Number of days between target date and january 4th 
	var dayDiff = (target - jan4) / 86400000;
	
	 // Calculate week number: Week 1 (january 4th) plus the 
	 // number of weeks between target date and january 4th

	var weekNr = 1 + Math.ceil(dayDiff / 7); 
	return weekNr;
	
	//Here is an example of how you can use of the getWeek method. 
	//var dt = new Date(); 
	//var wk = dt.getWeek();
	 
}

function getAgo(datetime){

	
	try{
		if(datetime=="" || datetime == null){
			return "no date time";
		}
		
		var today:NotesDateTime = session.createDateTime(datetime);
		today.setNow();
		var created:NotesDateTime = currentDocument.getDocument().getCreated()
		var diff = today.timeDifference(created).toFixed(0);
		var min = parseInt(diff/60,0);
		var hours = parseInt(min/60,0);
		var days = parseInt(hours/24,0);
		/*
		var ndt1:NotesDateTime = session.createDateTime(datetime);
		var ndt2:NotesDateTime = session.createDateTime(datetime);
		ndt2.setNow();
		
		var v = "ndt1 = " + ndt1.getLocalTime() + " ndt2 = " + ndt2.getLocalTime();
		var dt3 = ndt2.timeDifference(ndt1);

		var min = parseInt(dt3/60,0);
		var hours = parseInt(min/60,0);
		var days = parseInt(hours/24,0);
	*/
	
		if (days==1){
			return " " + strings.getString('dayago') 
		}else if(days>1){
			return days + " " + strings.getString('daysago') 
		}else if(hours==1){
			return " " + strings.getString('hourago')
		}else if(hours>1){
			return hours + " " + strings.getString('hoursago') 
		}else if(min==1){
		 	return + " " + strings.getString('minuteago') 
		}else if(min>1){
			return min + " " + strings.getString('minutesago')
		}else if(min==0){
			return " " + strings.getString('lessminuteago') 
		}else{
			 doLog("getAgo Error - min: " + min + " hours: " + hours + " days: " + days + " diff: " + dt3 + " dates: " + v)
			 return "Error " + min + " Minutes ago";
		}
	}catch(e){
		doLog("getAgo " + e,"1")
	}	
	
}



function getAgo2(datetime){
	
	try{
		if(datetime=="" || datetime == null){
			return "no date time";
		}
		
		var today:NotesDateTime = session.createDateTime(datetime);
		today.setNow();
		var created:NotesDateTime = session.createDateTime(datetime);
		var diff = today.timeDifference(created).toFixed(0);
		var min = parseInt(diff/60,0);
		var hours = parseInt(min/60,0);
		var days = parseInt(hours/24,0);
		if (days==1){
			return " " + strings.getString('dayago') 
		}else if(days>1){
			return days + " " + strings.getString('daysago')
		}else if(hours==1){
			return " " + strings.getString('hourago')
		}else if(hours>1){
			return hours + " " + strings.getString('hoursago')
		}else if(min==1){
		 	return + " " + strings.getString('minuteago')
		}else if(min>1){
			return min + " " + strings.getString('minutesago')
		}else if(min==0){
			return " " + strings.getString('lessminuteago')
		}else{
			 doLog("getAgo Error - min: " + min + " hours: " + hours + " days: " + days + " diff: " + dt3 + " dates: " + v)
			 return "Error " + min + " Minutes ago";
		}
	}catch(e){
		doLog("getAgo " + e,"1")
	}	
}

function savePublicStreamPost(){

	try{
		
		validateUser();
		
		var userid = getCookieValueX("userid");
		var linktxt = getComponent("computedField1").getValue();
		var linkvideo = getComponent("fldMovies").getValue();
		var content = getComponent("shareBox").getValue();
		
		// v1.7
		if(getConfigDetails("PreventHTML")[0] =="1"){
			content = com.ibm.xsp.acf.StripTagsProcessor.instance().processMarkup(content);	
		}
		
		

		
		var x = @ReplaceSubstring(content,@NewLine(),"<br />");
		
		// Truncate long words'
		//var chunklen = 90;      //the length of the chunks you require
		//var rxp = new RegExp( '(.{'+chunklen+'})', 'g' );
		//var x = v.replace( rxp, '$1<br />' );
		
		
		
		//print("xyz linktxt");
		if(linktxt!="" && linktxt!=null){
			newpost.replaceItemValue("TypeOfPost","1")
			newpost.replaceItemValue("ContentLink",linktxt);
		}
		if(linkvideo!="" && linkvideo!=null){
			newpost.replaceItemValue("TypeOfPost","5")
			newpost.replaceItemValue("VideoLink",linkvideo);
		}
		
		newpost.replaceItemValue("Content",x);

		//print("xyz type");
		if(compositeData.type == "Public"){	// Public post, only UserID
			newpost.replaceItemValue("UserID",userid);
			newpost.replaceItemValue("BelongTo","Public");
			newpost.replaceItemValue("ProfileID",userid);	// belong to profile even if public
			newpost.save();
			//database.getView("(LookupPosts)").refresh();
			
		}else if(compositeData.type == "User"){		// User Profile post, set UserID + ProfileID
			
			// Not used anymore
			var profilename = context.getUrlParameter("user");
			var profiledoc = getUserDocByUsername(profilename);
			var profileid = profiledoc.getItemValueString("UserID");
			newpost.replaceItemValue("ProfileID",profileid);
			newpost.replaceItemValue("UserID",userid);
			newpost.replaceItemValue("BelongTo","Profile");
			newpost.save();
			
			var targetid = newpost.getItemValueString("UniqueID");
			//var targetid = profileid;
			createNotification3(4,targetid, profileid)
			createActivity(targetid,4 )
			
		}else if(compositeData.type == "Group"){		// User group post, set UserID + GroupID
			
			var groupid = context.getUrlParameter("id");	
			newpost.replaceItemValue("UserID",userid);
			newpost.replaceItemValue("GroupID",groupid);
			newpost.replaceItemValue("BelongTo","Group");
			newpost.save();
			
		}else{
			
			doLog("Error no composite data");
			newpost.setValue("ErrorMsg","No compositeData");
			
		}
		if(newpost.getItemValueString("Files")!=""){
			newpost.replaceItemValue("TypeOfPost","2")
			newpost.save();
		}
		
		
		getComponent("inputText1").setValue("http://");
		if(newpost.getItemValueString("ImageURL")!="" || newpost.getItemValueString("ImageURLFull")!=""){
			newpost.replaceItemValue("TypeOfPost","3")
			newpost.save();
			convertStreamPhoto(newpost);
		}
		newpost.replaceItemValue("Content","");
		var cf = getComponent("computedField1");
		if(cf) cf.setValue("");
	
		// if user filtered the stream when posting, remove the filter, only public!
		sessionScope.remove("tp");
		var sl = getComponent("selectionLink")
		if(sl){
			sl.setText("All");
		}
		
		
	}catch(e){		doLog("Error Savepublicstreampost" + e,"1");
			
	}
}

function savePublicStreamPostMobile(){

	try{
		
		var userid = getCookieValueX("userid");
		var content = getComponent("shareBox").getValue();
		var x = @ReplaceSubstring(content,@NewLine(),"<br />");
		newpost.replaceItemValue("Content",x);
		newpost.replaceItemValue("UserID",userid);
		newpost.replaceItemValue("BelongTo","Public");
		newpost.replaceItemValue("ProfileID",userid);	// belong to profile even if public
		newpost.save();
		getComponent("shareBox").setValue("");
		
		
	}catch(e){
		doLog("Error Savepublicstreampostmobile " + e,"1");
			
	}
}

function saveStreamEvent(evname,evplace,sd,time){
	try{
		var userid = getCookieValueX("userid");
		var groupid = context.getUrlParameter("id");
		var edoc = database.createDocument();
		edoc.replaceItemValue("Form","Event");
		edoc.replaceItemValue("EventName",evname);
		edoc.replaceItemValue("EventPlace",evplace);
		edoc.replaceItemValue("StartDate",sd);
		edoc.replaceItemValue("StartTime",time);
		edoc.replaceItemValue("UserID",userid);
		edoc.replaceItemValue("GroupID",groupid);
		edoc.computeWithForm(true,true)
		edoc.save();
		
		var targetID = edoc.getItemValueString("UniqueID");
		if(groupid){
			//createActivity(targetID,20,groupid);	
		}else{
			//createActivity(targetID,8);
		}
		
		return targetID
		
	}catch(e){
		doLog("saveStreamEvent " + e,"1");
	}
}

function saveNewEvent(){
	try{
		var userid = getCookieValueX("userid");
		var groupid = context.getUrlParameter("id");
		newEvent.replaceItemValue("UserID",userid);
		newEvent.replaceItemValue("GroupID",groupid);
		var sd = newEvent.getItemValueString("StartDate");
		var ed = newEvent.getItemValueString("EndDate");
		if(ed==""){
			newEvent.replaceItemValue("EndDate",sd)
		}
		newEvent.save();
		var targetID = newEvent.getItemValueString("UniqueID");
		if(groupid!="" && groupid !=null){
			//createActivity(targetID,20,groupid);
			doLog("Group Event saved OK")
		}else{
			//createActivity(targetID,8);
			doLog("Public Event saved OK")
		}
		
		sendMailToPeople(newEvent,"8")		
		
		database.updateFTIndex(true);
	}catch(e){
		doLog("SaveNewEvent " + e,"1")
		
	}
}

function cleanupNotifications(){

	// if targetid is hiddelete or deleted then remove the notification
	try{
	
	var flag = 0;
	var targetid = "";
	var userid = getCookieValueX("userid");
	var key = "N_USID_" + userid;
	var doc:NotesDocument = database.getView("(LookupNotifications)").getDocumentByKey(key,true);
	if(doc){
		var xdoc:NotesDocument;
		var fld = doc.getItemValue("FromKey");
		for(var i=0;i<fld.size();i++){
			targetid = @Word(fld.get(i),"_",3);
			doLog("cleanupNotifications targetid = " + targetid)
			xdoc = getDocRemoved(targetid);
			if(xdoc){
				doLog("cleanupNotifications removed targetid= " + targetid);
				fld.removeElementAt(i); 
				flag = 1;
			}
		}
		if(flag==1){
			doc.replaceItemValue("FromKey",fld)
			doc.save()
		}
	}else{
		doLog("cleanupNotifications no notification found");
	}
	
	}catch(e){
		doLog("cleanupNotifications Error " + e,"1");
	}
		
}

function getCurrentUserDetails(fld){
	try{
		var v = database.getView("(LookupFormAndID)")
		var userid = getCookieValueX("userid");
		var key = "User" + userid;
		var userdoc = v.getDocumentByKey("User" + userid,true);
		if(userdoc){
			return userdoc.getItemValueString(fld);	
		}else{
			return "userdoc not found - " + key;
		}
		
		
	}catch(e){
		doLog("getCurrentUserDetails Error " + e,"1")
		return e;
	}
}


function businessDays(beginDate:NotesDateTime, endDate:NotesDateTime)
{
	try{
	var numberOfDays = 0;
	var dateCount:NotesDateTime = beginDate;
	var dayOfWeek:Integer;
	while(dateCount < endDate){
		dayOfWeek = @Weekday(dateCount.getDateOnly());
		if (!(dayOfWeek == 1 || dayOfWeek == 7)){
			numberOfDays++;
		}
		dateCount.adjustDay(1);
	}
	return numberOfDays;
	}catch(e){
		doLog("businessDays " + e,"1")
	}	

}

function setEditMode(doc:NotesXSPDocument, editmode:boolean) {
	try {
		var cl:java.lang.Class = com.ibm.domino.xsp.module.nsf.NotesContext.getCurrent().getModule().getModuleClassLoader().loadClass("com.ibm.xsp.model.domino.wrapped.DominoDocument");
		
		var method:java.lang.Method;
		var paramTypes = new Array();
		paramTypes[0] = java.lang.Boolean.TYPE;
		method = cl.getMethod("setEditable", paramTypes);
		var params = new Array();
		params[0] = new java.lang.Boolean(editmode);
		method.invoke(doc, params);	
	} catch (e) {
		doLog("setEditMode error: "+e,"1");
	}
}

function getSortedCollectionIDs(viewname, viewkey,fldName){
try{
	theView = database.getView(viewname); //get the Notes View
	Collection = theView.getAllEntriesByKey(viewkey,true) //get collection

	var items = new java.util.TreeMap(); //create treemap
	entry = Collection.getFirstEntry();
	while (entry!=null){ //loop over all entrys
		var it:NotesItem = entry.getDocument().getFirstItem(fldName);
		if(it.getType() == 1024){
			items.put(@Text(entry.getDocument().getItemValueDateTimeArray(fldName)[0].toJavaDate()) + @Unique(),entry.getDocument().getUniversalID()); //put (key, ID)
		}else{
			items.put(entry.getDocument().getItemValueString(fldName) + @Unique(),entry.getDocument().getUniversalID()); //put (key, ID)
		}
		
		//key can be scoped -> nice possibilty to get "sort by column"
		entry = Collection.getNextEntry();
	}
	
	var array = new Array(); //create array with return values
	i=0;
	
	while (!items.isEmpty()){ //get all values from treemap
		array.push(items.pollFirstEntry().getValue());
		//i++;
	}
	
	return array;
}catch(e){
	doLog("getSortedCollectionIDs " + e,"1")
}	

}



//Sorts a NotesDocumentCollection by item name
//@param col, unsorted NotesDocumentCollection
//@param iName, the name of the item to sort the collection by.
//@return sorted NotesDocumentCollection
//@author Ulrich Krause
//@version 1.0
function sortColByItemName(col:NotesDocumentCollection, iName:String) {

try{	
	var rl:java.util.Vector = new java.util.Vector();
	var doc:NotesDocument = col.getFirstDocument();
	var tm:java.util.TreeMap = new java.util.TreeMap();

	while (doc != null) {
	   tm.put(doc.getItemValueString(iName), doc);                   
	   doc = col.getNextDocument(doc);
	}

	var tCol:java.util.Collection = tm.values();
	var tIt:java.util.Iterator  = tCol.iterator();
	
	while (tIt.hasNext()) {
	   rl.add(tIt.next());
	}

	return rl;  
}catch(e){
	doLog("sortColByItemName " + e,"1")
}	

}

function sortColByItemName2(view:NotesView, iName:String) {
	try{
	var col = view.getAllEntries();
	var rl:java.util.Vector = new java.util.Vector();
	var entry:NotesViewEntry = col.getFirstEntry();
	//var doc:NotesDocument = entry.getDocument();
	var tm:java.util.TreeMap = new java.util.TreeMap();

	while (entry != null) {
		doc = entry.getDocument()		
	 	tm.put(doc.getItemValueString(iName), doc);
	  	entry = col.getNextEntry(entry);
	}

	var tCol:java.util.Collection = tm.values();
	var tIt:java.util.Iterator  = tCol.iterator();
	
	while (tIt.hasNext()) {
	   rl.add(tIt.next());
	}

	return rl;  
	}catch(e){
		doLog("sortColByItemName2 " + e,"1")
	}	

}

var $U = {
		 
		  /* 
		  /* function that always returns an array for the input value
		   */
		  toArray : function(input) {
		    try {
		       
		      if (typeof input === "undefined" || input === null) {
		        //return empty array
		        return [];  
		      }
		       
		      if (typeof input === "string") {
		        //convert string to array (or empty array)
		        return ( input.length > 0 ? [input] : [] );
		      }
		         
		      if (typeof input === "java.util.Vector") {
		         
		        //Normally we would use toArray here, but this returns an Object array.
		        //If you try to use that in a doc.replaceItemValue call, it fails.
		        //sample code:
		        //var v = getComponent("input1").getValue();    //returns a Vector if the component contains multiple values
		        //v = $U.toArray(v)   //returns an array of Objects
		        //doc.replaceItemValue("someOtherField", v);    //fails
		         
		        //the solution I used here is to create a JS array and copy the all the Vector's values
		        var a = [];
		        var it = input.iterator();
		        while (it.hasNext() ) {
		          a.push( it.next() );
		        }
		        return a;
		      }
		       
		      if (typeof input.toArray !== "undefined") {
		        return input.toArray();
		      }
		       
		      if ( input.constructor === Array ) {
		        //return input if it's already an array
		        return input;
		      } 
		   
		      //return input as an array
		      return [ input ];
		       
		    } catch(e) {
		      print("$U.toArray: " + e.toString());
		    }
		  }
		}

function asVector(obj) {
	try{
	if(typeof obj === "java.util.Vector") {
		
		return obj;
	} else {
		var x:java.util.Vector = new java.util.Vector();
	
		x.add(obj);
		return x;
	}
	}catch(e){
		doLog("asVector " + e,"1")
	}	

}
function $V(o:java.util.Vector){
	try{
		if(typeof o === "string"){
			if(o==""){
				return null
			}else{
				return o
			}
		}
		
		if(o.isEmpty){
			o.add("")
		}
		return o
	}catch(e){
		doLog("$V " + e,"1")
	}	

}

function sortColByDateItem(dc:NotesDocumentCollection, iName:String) {
	try{	
		var rl:java.util.Vector = new java.util.Vector();
		
		//var doc:NotesDocument = entry.getDocument();
		var tm:java.util.TreeMap = new java.util.TreeMap();
		var doc:NotesNotesDocument = dc.getFirstDocument();
		
		while (doc != null) {
		 	tm.put(doc.getItemValueDateTimeArray(iName)[0].toJavaDate(), doc);
		  	doc = dc.getNextDocument(doc);
		}
		var tCol:java.util.Collection = tm.values();
		
		var tIt:java.util.Iterator  = tCol.iterator();
		
		while (tIt.hasNext()) {
		   rl.add(tIt.next());
		}
		
		return rl;  
	}catch(e){
		doLog("sortColByDateItem " + e,"1")
	}
}


/*
 * 
 Type=0: joined intranet
Type=2 : like Post in public
Type=3 : like comment in public
Type=5 : Joined a group
Type=6 : Attended an event
Type=7 : Connected to someone
Type=10 : User changed profile photo
Type=11: User got an updated profile basic
Type=12: User got an updated profile work
Type=13: User got an updated profile Contact
Type=14: Added a photo to user profile
Type=15: Added a photo to user group
Type=16: Added a file to group
Type=17: Group basic updated
Type=18: Moderator changed group image
Type=19: User out of office
Type=22: like a post in group
Type=23: like a comment in group
 */

function getTimeElapsed(ndt1:NotesDateTime){
	 try{
	  var ndt2:NotesDateTime = session.createDateTime("Today");
	  ndt2.setNow();
	  var dt3:NotesDateTime = ndt2.timeDifference(ndt1);
	 
	  var min = parseInt(dt3/60,0);
	  var hours = parseInt(min/60,0);
	  var days = parseInt(hours/24,0);
	   
	  if(days>0 && days <1){
	    return "1 day ago";
	  }else if(days>0){
	    return days + " days ago";
	  }else if(hours>0 && hours<2){
	    return "1 hour ago";
	  }else if(hours>1){
	    return hours + " hours ago";
	  }else if(min>0){
	    return min + " minutes ago";
	  }else if(min==0){
	    return "less than a minutes ago";
	  }else{
	    return "Error "
	  }
		}catch(e){
			doLog("getTimeElapsed " + e,"1")
		}	

}

function getContent(frm){
	try{
	var keys={}
	switch(frm){
	case "Post":
		keys["fld"] = "Content";
		keys["page"] = "home.xsp";
		keys["section"] = "news";
		break
	case "Idea":
		keys["fld"] = "Subject";
		keys["page"] = "home.xsp";
		keys["section"] = "idea";
		break
		
	case "Company":
		keys["fld"] = "CompanyName";
		keys["page"] = "home.xsp";
		keys["section"] = "crm";
		break
	case "ForumTopic":
		keys["fld"] = "Subject";
		keys["page"] = "home.xsp";
		keys["section"] = "forum";
		break
	case "User":
		keys["fld"] = "FullName";
		keys["page"] = "user.xsp";
		keys["section"] = "news";
		break
	case "Wiki":
		keys["fld"] = "Subject";
		keys["page"] = "home.xsp";
		keys["section"] = "wiki";
		break
	case "Ticket":
		keys["fld"] = "Subject";
		keys["page"] = "home.xsp";
		keys["section"] = "helpdesk";
		break
	case "Doc":
		keys["fld"] = "Subject";
		keys["page"] = "home.xsp";
		keys["section"] = "blog";
		break
	case "Announcement":
		keys["fld"] = "Subject";
		keys["page"] = "home.xsp";
		keys["section"] = "announcements";

		break
	default:
		c = "Subject"
	}
	return keys
	}catch(e){
		doLog("getContent " + e,"1")
	}	

}

function typeAhead(searchValue){

	try{
		var searchView:NotesView = database.getView("(LookupSearch)");
	    var nvec:NotesViewEntryCollection = searchView.getAllEntriesByKey(searchValue, false);
		var entry:NotesViewEntry = nvec.getFirstEntry();
		var resultCount:int = 0;
		var matches = {};
		while (entry != null) {
	    	var matchDoc:NotesDocument = entry.getDocument();
			var form = matchDoc.getItemValueString("Form");
			var docunid = matchDoc.getUniversalID();
			var gid = matchDoc.getItemValueString("GroupID")
			var userid = matchDoc.getItemValueString("UserID");
			var imageid = getUserDetails(userid,"ImageID");
			var imagedoc = getImageDoc(imageid);
			var created = getTimeElapsed(matchDoc.getItemValueDateTimeArray("Created")[0])
			var conta = matchDoc.getItemValueString(getContent(form)["fld"])
			var contb = com.ibm.xsp.acf.StripTagsProcessor.instance().processMarkup(conta);
			var contc = @Length(conta)>40 ? @Left(contb,37) + "..." : contb;
			if(imagedoc){
				var url = imagedoc.getItemValueString("ImageUrl1");	
			}else{
				var url =  "/images.jpg";
			}
			if(form=="User"){
				var theurl = getContent(form)["page"] + "?user=" + userid
				var cr = "Member since " + created;
			}else if(gid!=""){
				var theurl = getContent(form)["page"] + "?id=" + gid + "#content=" + getContent(form)["section"] + "&action=openDocument&documentId=" + docunid
			}else{
				var theurl = getContent(form)["page"] + "#content=" + getContent(form)["section"] + "&action=openDocument&documentId=" + docunid
				var cr = "Created " + created;
			}
			
			
		    var cont:string = matchDoc.getItemValueString("UniqueID");
		    if (!(matches[cont])) { // skip if already stored
		    	resultCount++;
		        matches[cont] = {
		        	content: contc,
		        	url: theurl,
		            form: matchDoc.getItemValueString("Form"),
		            userid: matchDoc.getItemValueString("UserID"),
		            created: cr,
		            imgurl: url
		        };
		    }
			if (resultCount > 9) {
				entry = null; // limit the results to first 10 found
			} else {
				entry = nvec.getNextEntry(entry);
			}
		    
			
		}
		
		var returnList = "<ul>";
		for (var matchName in matches) {
	        var match = matches[matchName];
	        var matchDetails:string = [
	            "<li class=\"dropdownli\"><span onclick=\"javascript:location.href='./" + match.url + "'\" class=\"clicktable\"><table><tr><td><img src=\".",
	            match.imgurl,
	            "\"/></td><td valign=\"top\"><p class=\"test\"><strong>",
	            match.content,
	            "</strong></p><p><span class=\"informal\">",
	            match.created,
	            "<br/>",
	            match.form,
	            "</span></p></td></tr></table></span></li>"
	        ].join("");
	        returnList += matchDetails;
	    }
	    
	    returnList += "</ul>";
		return returnList;
	}catch(e){
		doLog("typeahead " + e,"1")
	}
}


function getUserImage(userid,fld){
	try{
		var imageid = getUserDetails(userid,"ImageID");
		var imagedoc = getImageDoc(imageid);
		if(imagedoc){
			return imagedoc.getItemValueString("ImageUrl1");	
		}else{
			return "/images.jpg";
		}
	}catch(e){
		return "/images.jpg";
	}
}

function reverseCollection(vec:NotesViewEntryCollection):NotesViewEntryCollection
{
	try{
    var result:NotesViewEntryCollection = database.getViews().elementAt(0).getAllEntriesByKey("bidon", true);
    var entry:NotesViewEntry = vec.getLastEntry();

    while (entry != null)
    {
        var tmpentry:NotesViewEntry = vec.getPrevEntry(entry);
        result.addEntry(entry);
        entry.recycle();
        entry = tmpentry;
    }
    return result;
	}catch(e){
		doLog("reverseCollection " + e,"1")
	}	


}


/*
function isCacheInvalid(key, cacheInterval){

	var currentTime = new Date().getTime();
	if (!applicationScope.containsKey(key + "_time")){
		applicationScope.put(key + "_time", currentTime);
	  	return true;
	}
	var diffInSecs = Math.ceil((currentTime - applicationScope.get(key + "_time")) / 1000);
	if (diffInSecs < cacheInterval) {
	return false;
	}else {
		applicationScope.put(key + "_time", currentTime);
		return true;
	}
}

function getControlPanelFieldString(){
	var userid = getCookieValueX("userid");
	synchronized(applicationScope){
		if(isCacheInvalid("controlpanel_" + userid, 10)){
			//var controlPanels = database.getView("lookupControlPanel");
			//var controlPanel = controlPanels.getFirstDocument();
			applicationScope.put("controlpanel_" + userid, userid);
			controlPanel = null;
			controlPanels = null;
		}else{
			applicationScope.remove("controlpanel_" + userid);
		}
	}
	return applicationScope.get("controlpanel_" + userid);
}


 * Everytimme this function is called, add current userid/time, and remove all expired 
 
function store(){
	var userid = getCookieValueX("userid");
	var currentTime = new Date().getTime();
	var hm:java.util.HashMap = (applicationScope.online || new java.util.HashMap());
	
	i:java.util.iterator = hm.keySet().iterator();
	while(i.hasNext()) {
		var entry = i.next();
		if(hm.entrySet())
	}
	
	// loop the hashmap, remove expired id's
	for(i=0;i<hm.size();i++){
		var uid = hm.get(i)
	}
	if(hm.containsKey(userid))
		
		applicationScope.online.put(“key,"value");
	
		
	}
	// Store a new time for current user
	hm.put(userid,currentTime);
	
		
}

if(isCacheInvalid(userid, 10)){
*/

function addUserToProfile(user:String){
	try{
	var d:NotesDocument = getConfigDoc();
	var v = new java.util.Vector();
	v = d.getItemValue("UserActivity");
	
	if(v.contains(user)){
		
	}else{
		v.add(0,user);
		v.setSize(10);
		d.replaceItemValue("UserActivity",v);
		d.save();
	}
	}catch(e){
		doLog("addUserToProfile " + e,"1")
	}	

}
	
function updateOnline(){
	//doLog("Running updateOnline");
	try{
		var userid = getCookieValueX("userid");
		if(userid!=""){
			var v="";
			var hm:java.util.HashMap = (applicationScope.online || new java.util.HashMap());
			var currentTime = new Date().getTime();
			hm.put(userid,currentTime)
			
	 		var it:java.util.iterator = hm.entrySet().iterator();
	    	while(it.hasNext()){
	    		var k = it.next();
	        	if(isTimeValid(k.getValue(),17)){
	        	}else{
	        		it.remove();
	        	}
		    }
	    	addUserToProfile(userid);
	    	applicationScope.online = hm;
		}
	}catch(e){
		doLog("updateOnline Error " + e,"1")
	}
}

function isTimeValid(time,interval){
	try{
		var currentTime = new Date().getTime();
		var diffInSecs = Math.ceil((currentTime - time) / 1000);
		if (diffInSecs < interval) {
			return true;
		}else {
			return false;
		}
	}catch(e){
		doLog("isTimeValid " + e,"1")
	}	

}

function getGroupImageUrl(groupid, fld){
	try{
		var imgid = getGroupDetails(groupid,"ImageID")[0];
		var photodoc = database.getView("(LookupPhotos)").getDocumentByKey("Photo_UNID_" + imgid,true)
		
		if(photodoc){
			if(fld==null || fld==""){
				var url = photodoc.getItemValueString("ImageUrl1")	
			}else{
				var url = photodoc.getItemValueString(fld)
			}
			
			if(url==""){
				return "/group50.jpg";
			}else{
				return url;
			}
		}else{
			return "/group50.jpg";
		}
	}catch(e){
		doLog("getGroupImageUrl " + e,"1");
		return "/group50.jpg";
	}
}

function searchInStream(){
	try{
	var tp = viewScope.get("tp");
	var uids = viewScope.get("uids");
	var x = "";
	
	if(tp==5){
		// People user is following.stored in viewscope
		if(uids=="" || uids==null) return;
		for(var i=0;i<uids.size();i++)
		{
			if(i==0){
				//x+= "FIELD UserID Contains \"" + uids.get(i) + "\" ";	
				x+= "[UserID] Contains \"" + uids.get(i) + "\" ";
			}else{
				//x+= " OR FIELD UserID Contains \"" + uids.get(i) + "\"";
				x+= " OR [UserID] Contains \"" + uids.get(i) + "\"";
			}
			
		}
		x = "(" + x + ") AND ([BelongTo] Contains \"Public\")";

	}else if(tp==6){
		
		// lists
		if(uids=="" || uids==null) return;
		for(var i=0;i<uids.size();i++)
		{
			if(i==0){
				//x+= "FIELD UserID Contains \"" + uids.get(i) + "\" ";	
				x+= "[UserID] Contains \"" + uids.get(i) + "\" ";
			}else{
				//x+= " OR FIELD UserID Contains \"" + uids.get(i) + "\"";
				x+= " OR [UserID] Contains \"" + uids.get(i) + "\"";
			}
			
		}
		x = "(" + x + ") AND ([BelongTo] Contains \"Public\")";	

	}else if(tp==20){
		
		// my groups
		var x="";
		if(uids=="" || uids==null) return;
		for(var i=0;i<uids.size();i++)
		{
			if(i==0){
				//x+= "FIELD UserID Contains \"" + uids.get(i) + "\" ";	
				x+= "[GroupID] Contains \"" + uids.get(i) + "\" ";
			}else{
				//x+= " OR FIELD UserID Contains \"" + uids.get(i) + "\"";
				x+= " OR [GroupID] Contains \"" + uids.get(i) + "\"";
			}
			
		}
		x = "(" + x + ")";	

		
	}else if(tp==11){
		// Links
		x = "[TypeOfPost] Contains \"1\" AND [BelongTo] Contains \"Public\"";	
	}else if(tp==12){
		// Files
		x = "[TypeOfPost] Contains \"2\" AND [BelongTo] Contains \"Public\"";
	}else if(tp==13){
		// Photo
		x = "[TypeOfPost] Contains \"3\" AND [BelongTo] Contains \"Public\"";
	}else if(tp==14){
		// Event
		x = "[TypeOfPost] Contains \"4\" AND [BelongTo] Contains \"Public\"";
	}else if(tp==17){
		// YouTube
		x = "[TypeOfPost] Contains \"5\" AND [BelongTo] Contains \"Public\"";
	}else if(tp==15){
		// Event
		x = "[Like] IS PRESENT AND [BelongTo] Contains \"Public\"";
	}else if(tp==16){
		// Event
		x = "[CommentUserID] IS PRESENT AND [BelongTo] Contains \"Public\"";
	}else if(tp==19){
		// not yet
		x = "";
	}else if(tp==18){
		// post tags
		var tag = viewScope.get("tag");
		x = "[Tags] Contains \"" + tag + "\" AND [BelongTo] Contains \"Public\"";
		//doLog(x)

	}else{
		
		
	}
	if(x!=""){
//		doLog("Search in sream " + x);
	}
	return x;
	}catch(e){
		doLog("Search in stream error " + e,"1")
	}	

}

function isRegDisabled(){
	try{
	var d = getConfigDetails("RegDisabled")[0];
	if(d=="1"){
		return true
	}else{
		return false
	}
	}catch(e){
		doLog("isRegDisabled " + e,"1")
	}	

}


function saveNewAnnouncement(){
	try{
		
		var userid = getCookieValueX("userid");
		newannouncement.replaceItemValue("UserID",userid);
		var dt = session.createDateTime(@Now());
		newannouncement.getDocument().replaceItemValue("PublishedAt",dt);
		newannouncement.getDocument().replaceItemValue("Published","1");
		newannouncement.save()
		
		sendMailToPeople(newannouncement,"1")
		
		var d = getComponent("dynC");
		var unid = newannouncement.getDocument().getUniversalID();
		d.show("announcements",{action:'openDocument',documentId:unid})

		//var sc = "pn('Success','Announcement is published')";
		//view.postScript(sc)
		
	}catch(e){
		doLog("saveNewAnnouncement " + e,"1")
	}
}

function saveNewHelpdesk(){
	try{
		if(param.containsKey("id")) {
			var gid = param.get("id");
			newticket.replaceItemValue("GroupID",gid); 
		}
		var userid = getCookieValueX("userid");
		newticket.replaceItemValue("UserID",userid);
		
		var sub:java.util.Vector = newticket.getItemValue("AssignedToID")
		sub.add(userid)
		newticket.replaceItemValue("FollowupID",sub);
		newticket.save();
		sendAssignedNewHelpdesk(newticket)
		
		sendMailToPeople(newticket,"4")
		var d = getComponent("dynC");
		var unid = newticket.getDocument().getUniversalID();
		d.show("helpdesk",{action:'openDocument',documentId:unid})

//		var d = getComponent("dynC");
//		d.show("helpdesk")
		
		
	}catch(e){
		print("xyz New Ticket Error " + e,"1");

	}
}

function saveNewWiki(){
	
	try{
		var groupid = context.getUrlParameter("id");
		var userid = getCookieValueX("userid");
		newwiki.replaceItemValue("GroupID",groupid);
		newwiki.replaceItemValue("UserID",userid);
		newwiki.replaceItemValue("Status","Valid");
		newwiki.save();
		
		sendMailToPeople(newwiki,"3")
		
		var d = getComponent("dynC");
		var unid = newwiki.getDocument().getUniversalID();
		d.show("wiki",{action:'openDocument',documentId:unid})

	}catch(e){
		print("New Wiki Error " + e,"1");

	}
	
}
function saveNewBlogg(){

	var gid = context.getUrlParameter("id");
	var userid = getCookieValueX("userid");
	newdoc.replaceItemValue("UserID",userid);
	newdoc.replaceItemValue("GroupID",gid);
	var dt = session.createDateTime(@Now());
	newdoc.getDocument().replaceItemValue("PublishedAt",dt);
	newdoc.getDocument().replaceItemValue("Published","1");
	newdoc.save()

	sendMailToPeople(newdoc,"5")
	var d = getComponent("dynC");
	var unid = newdoc.getDocument().getUniversalID();
	d.show("blog",{action:'openDocument',documentId:unid})
	
}


function saveNewFiles(){
	try{
		var groupid = context.getUrlParameter("id");
		var userid = getCookieValueX("userid");
		if(groupid=="" || groupid == null){
			newfile.replaceItemValue("BelongTo","P");
		}else{
			newfile.replaceItemValue("GroupID",groupid);
		}
		newfile.replaceItemValue("UserID",userid);
		newfile.save();
		
		sendMailToPeople(newfile,"2")
		
		//doLog("File saved Ok")
		//var dc = getComonent("dynC");
		//dc.show("files");

		//var sc = "pn('Success','file has been added')";
		//view.postScript(sc)
		

	
}catch(e){
		print("saveNewFiles" + e);
		//getComponent("msg2").setValue(e);
		
}
	
}

function sendApprovalMail(cdoc:NotesXspDocument){
	
	// send a mail to all the userids in the currentapproversID field
	// all approvers will recieve mail if there is a valid email.	
	
	try{
		
		var url = "";
		var txt = "";
		var subj = ""
		var loginurl = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/";
		var gid = cdoc.getItemValueString("GroupID");
		var cuserid = getCookieValueX("userid");
		var by = getUserDetails(cuserid,"FullName");
		var name = getConfigDetails("Name")[0]
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var date = getGenericDateFormat()
		var fn = getUserDetails(cuserid,"FullName");
		var ddoc = cdoc.getDocument();		
		var wl = ddoc.getItemValue("WorkflowLog");
		//var vdoc = getUserDoc(userid) 
		//if(!cdoc) return false;                                
		
  		if(gid!=""){
			var gn = getGroupDetails(gid,"GroupName")[0]
//			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "#content=workflow&documentId=" + cdoc.getDocument().getUniversalID()
			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=workflow&noteid=" + cdoc.getDocument().getUniversalID()
			txt = "You have been assigned a new workflow approval request in team room " + gn + " from " + by 
			txt += "<br>Subject: " + cdoc.getItemValueString("Subject")
			//txt += "<br>Approval Message: " + cdoc.getItemValueString("MessageToApprovers")
			subj = "New approval request"
		}else{
			//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp#content=workflow&documentId=" + cdoc.getUniversalID()
			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=workflow&noteid=" + cdoc.getDocument().getUniversalID()
			txt = "You have been assigned a new workflow approval request from " + by
			txt += "<br>Subject: " + cdoc.getItemValueString("Subject")
			//txt += "<br>Approval Message: " + cdoc.getItemValueString("MessageToApprovers")
			subj = "New approval request"
		}
		
		var approvers:java.util.Vector = cdoc.getItemValue("CurrentApproversID");
		for(var i=0;i<approvers.size();i++){
			
			var userid = approvers[i]
			var userdoc = getUserDoc(userid);
			if(!userdoc) return false;
			
				var email = userdoc.getItemValueString("Email");
				if(email.indexOf("@")>0 && email.indexOf(".")>0){
				
					var fn = userdoc.getItemValueString("FullName");
					var first = userdoc.getItemValueString("FirstName");
					
			  		var mail = new HTMLMail();
			  		var to =  fn + " <" + email + ">"
			  		mail.setTo(to);
			  		mail.setSubject(name + " " + subj);
			  		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
			  		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
			  		mail.addHTML("<p>Hi " + first  + "</p>");	
			  		mail.addHTML("<p>" + txt + "</p>");
			  		//mail.addHTML("<p>Below you find the link to the new content, if you are not logged in then please login and click the link below a second time</p>")
			  		//mail.addHTML("<p>Below you find the link to the new comment, if you are not logged in then please login by clicking <a href='" + loginurl + "'>here</a> and then click the link below</p>")
			  		mail.addHTML("<p><a href='" + url + "'>Click here to open the request in " + name + "</a></p>");
			  		mail.addHTML("</div>");
			  		mail.setSender(emailfrom, name);
			  		mail.send();
			  		wl.insertElementAt(date + " " + fn + " Mail sent to " + getUserDetails(userid,"FullName"),0);
			  		doLog("Sent approval mail " + to)
		
				}else{
					wl.insertElementAt(date + " " + fn + " Mail not sent to " + getUserDetails(userid,"FullName") + " - not valid email",0);
					doLog("Email to " + email + " not sent - not valid email or not in group")
				}
	  		
	  		ddoc.replaceItemValue("WorkflowLog",wl)
	  		ddoc.save()
	  		
		}
		
	}catch(e){
		doLog("sendApprovalMail " + e, "1")
	}
}
	
function sendAssignedNewHelpdesk(cdoc:NotesXspDocument){
	try{
		
		var url = "";
		var txt = "";
		var subj = ""
		var loginurl = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/";
		var gid = cdoc.getItemValueString("GroupID");
		var cuserid = getCookieValueX("userid");
		var by = getUserDetails(cuserid,"FullName");
		var name = getConfigDetails("Name")[0]
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var date = getGenericDateFormat()
		var fn = getUserDetails(cuserid,"FullName");
		var ddoc = cdoc.getDocument();		
		
		//var vdoc = getUserDoc(userid) 
		//if(!cdoc) return false;                                
		
  		if(gid!=""){
			var gn = getGroupDetails(gid,"GroupName")[0]
//			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "#content=workflow&documentId=" + cdoc.getDocument().getUniversalID()
			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=helpdesk&noteid=" + cdoc.getDocument().getUniversalID()
			txt = "You have been assigned a new helpdesk case in team room " + gn + " from " + by 
			txt += "<br>Subject: " + cdoc.getItemValueString("Subject")
			//txt += "<br>Approval Message: " + cdoc.getItemValueString("MessageToApprovers")
			subj = "Assigned new helpdesk case " + cdoc.getItemValueString("Subject")
		}else{
			//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp#content=workflow&documentId=" + cdoc.getUniversalID()
			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=helpdesk&noteid=" + cdoc.getDocument().getUniversalID()
			txt = "You have been assigned a new helpdesk case from " + by
			txt += "<br>Subject: " + cdoc.getItemValueString("Subject")
			//txt += "<br>Approval Message: " + cdoc.getItemValueString("MessageToApprovers")
			subj = "Assigned new helpdesk case " + cdoc.getItemValueString("Subject")
		}
		
		var ass:java.util.Vector = cdoc.getItemValue("AssignedToID");
		for(var i=0;i<ass.size();i++){
			
			var userid = ass[i]
			var userdoc = getUserDoc(userid);
			if(!userdoc) return false;
			
				var email = userdoc.getItemValueString("Email");
				if(email.indexOf("@")>0 && email.indexOf(".")>0){
					var fn = userdoc.getItemValueString("FullName");
					var first = userdoc.getItemValueString("FirstName");
			  		var mail = new HTMLMail();
			  		var to =  fn + " <" + email + ">"
			  		mail.setTo(to);
			  		mail.setSubject(name + " " + subj);
			  		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
			  		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
			  		mail.addHTML("<p>Hi " + first  + "</p>");	
			  		mail.addHTML("<p>" + txt + "</p>");
			  		//mail.addHTML("<p>Below you find the link to the new content, if you are not logged in then please login and click the link below a second time</p>")
			  		//mail.addHTML("<p>Below you find the link to the new comment, if you are not logged in then please login by clicking <a href='" + loginurl + "'>here</a> and then click the link below</p>")
			  		mail.addHTML("<p><a href='" + url + "'>Click here to open the helpdesk case in " + name + "</a></p>");
			  		mail.addHTML("</div>");
			  		mail.setSender(emailfrom, name);
			  		mail.send();
			  		doLog("Sent assignemnt mail " + to)
		
				}else{
					doLog("Helpdesk assignemnt email to " + email + " not sent - not valid email or not in group")
				}
		}
		
	}catch(e){
		doLog("sendApprovalMail " + e, "1")
	}
}


function sendMailToPeople(cdoc:NotesXspDocument,notkey:string){

	try{
		var url = "";
		var txt = "";
		var subj = ""
		var loginurl = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/";
		var gid = cdoc.getItemValueString("GroupID");
		var userid = getCookieValueX("userid");
		var by = getUserDetails(userid,"FullName");
		var name = getConfigDetails("Name")[0]
		var emailfrom = getConfigDetails("EmailFrom")[0]
			
		switch(cdoc.getItemValueString("Form")){
			case "User":
				url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/"
				txt = "The new user '" + cdoc.getItemValueString("FullName") + "' have joined " + name  
				subj = "New user have joined"
				break;

			case "Announcement":
				//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp#content=announcements&documentId=" + cdoc.getDocument().getUniversalID()
				url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=announcements&noteid=" + cdoc.getDocument().getUniversalID()
				txt = "New Announcement have been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				subj = "New Announcement"
				break;
			case "Library":
				subj = "New File"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "#content=files&documentId=" + cdoc.getDocument().getUniversalID()
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=files&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New file has been created in team room " + gn + " by " + by + "<br>File: " + cdoc.getItemValueString("Attachments")
				}else{
					//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp#content=files&documentId=" + cdoc.getUniversalID()
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=files&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New public file has been added by " + by + "<br>File : " + cdoc.getItemValueString("Attachments")
				}
				break;
			case "Wiki":
				subj = "New Wiki"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "#content=wiki&documentId=" + cdoc.getDocument().getUniversalID()
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=wiki&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New wiki has been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=wiki&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New public wiki has been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
				break;
				
			case "Ticket":
				subj = "New Helpdesk case"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=helpdesk&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New helpdesk case has been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=helpdesk&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New public helpdesk case has been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
				break;
			case "Doc":
				subj = "New Blog entry"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=blog&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Blog has been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=blog&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New blog has been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
				break;
			case "Poll":
				subj = "New Poll added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=polls&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Poll has been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=polls&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Poll has been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
				break;

			case "Idea":
				subj = "New Idea"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=idea&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Idea has been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=idea&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New idea has been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
				break;
			case "ForumTopic":
				subj = "New Forum Topic"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=forum&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Forum topic has been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=forum&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Forum topic been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
				break;
			case "Event":
				subj = "New Event"
				if(gid!=""){
					//http://www.intrapages.com/intrademo.nsf/event.xsp?eid=domo-92mk6s
					var gn = getGroupDetails(gid,"GroupName")[0]
					//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/event.xsp?eid=" + cdoc.getItemValueString("UniqueID")
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=events&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Event been created in team room " + gn + " by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}else{
					//url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/event.xsp?eid=" + cdoc.getItemValueString("UniqueID")
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=events&noteid=" + cdoc.getDocument().getUniversalID()
					txt = "New Event been created by " + by + "<br>Subject: " + cdoc.getItemValueString("Subject")
				}
			default:
				
		}
		
		// check if user have ticked in their profile to recieve mail
		var dc:NotesDocumentCollection = database.getView("(LookupUsersNotifications)").getAllDocumentsByKey(notkey,true)
		var userdoc = dc.getFirstDocument()
		if(!userdoc){
			doLog("No users found to send new content mail to '" + txt + "' key=" + notkey)
			return false;
		}
		while(userdoc!=null){
	
			var email = userdoc.getItemValueString("Email");
			var usid = userdoc.getItemValueString("UserID");
			var flag = 0;
			if(gid!=""){
				 if(isUserGroupMember(usid,gid)){
					 flag=1;
				 }
			}else{
				flag=1;
			}
			
			if(email.indexOf("@")>0 && email.indexOf(".")>0 && flag==1){
			
				var fn = userdoc.getItemValueString("FullName");
				var first = userdoc.getItemValueString("FirstName");
				
		  		var mail = new HTMLMail();
		  		var to =  fn + " <" + email + ">"
		  		mail.setTo(to);
		  		mail.setSubject(name + " " + subj);
		  		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
		  		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
		  		mail.addHTML("<p>Hi " + first  + "</p>");	
		  		mail.addHTML("<p>" + txt + "</p>");
		  		//mail.addHTML("<p>Below you find the link to the new content, if you are not logged in then please login and click the link below a second time</p>")
		  		//mail.addHTML("<p>Below you find the link to the new comment, if you are not logged in then please login by clicking <a href='" + loginurl + "'>here</a> and then click the link below</p>")
		  		mail.addHTML("<p><a href='" + url + "'>Click here to open " + name + "</a></p>");
		  		mail.addHTML("<p>You can change your notification settings in your profile</p>");
		  		
		  		mail.addHTML("</div>");
		  		mail.setSender(emailfrom, name);
		  		mail.send();			                                      		
		  		doLog("Sent new content mail to " + to)

			}else{
				doLog("Email to " + email + " not sent - not valid or not in group")
			}
			userdoc = dc.getNextDocument(userdoc)
		}

	}catch(e){
		doLog("sendMailToPeople " + e,"1")
	}
}
	

function isUserGroupMember(userid,groupid){
	try{
		var gdoc = database.getView("(LookupGroups)").getDocumentByKey("Group_UNID_" +groupid,true);
		var fld:java.util.Vector = gdoc.getItemValue("MembersID");
		if(fld.contains(userid)){
			return true;
		}else{
			//doLog("user " + userid + " not in group " + groupid)
			return false;
		}
		
	}catch(e){
			doLog("isUserGroupMember" + e,"1")
	}	

	
}



function saveContentComments(){
	
	try{
	// this is for ccComments
	
	//var gid = context.getUrlParameter("id");
	var pdoc = database.getDocumentByUNID(compositeData.unid);
	if(pdoc){
	}
	
		var userid = getCookieValueX("userid")
		var gid = pdoc.getItemValueString("GroupID");
		var x = getComponent("inputTextarea1").getValue();
		newcomment.replaceItemValue("Form","Comment");
		newcomment.replaceItemValue("UserID",userid);
		var cont = @ReplaceSubstring(x,@NewLine(),"<br />");
		newcomment.replaceItemValue("Content",cont);
		newcomment.replaceItemValue("GroupID",gid);
		newcomment.replaceItemValue("ParentUserID",pdoc.getItemValueString("UserID"));
		newcomment.save();
	
		// save the userid to the parent - Notifications
		var fld = java.util.Vector();
		fld = pdoc.getItemValue("CommentUserID");
		if(!fld.contains(userid)){
			fld.add(userid)
			@Unique(pdoc.replaceItemValue("CommentUserID",fld))
		}
	
		pdoc.replaceItemValue("LastCommentID",userid)
		pdoc.save();
	
		database.getView("(Lookuptopics)").refresh();
		getComponent("inputTextarea1").setValue("");
		sendNewCommentMailToPeople(pdoc,newcomment);
		database.updateFTIndex(true);
		
	}
	catch(e){
		doLog("saveContentComments error " + e,"1")
	}
}


function sendNewCommentMailToPeople(parentDoc:NotesDocument, newComment:NotesDocument){

	try{
		var url = "";
		var txt = "";
		var subj = ""
		var loginurl = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/";
		var gid = parentDoc.getItemValueString("GroupID");
		var cuserid = getCookieValueX("userid");
		var by = getUserDetails(cuserid,"FullName");
		var name = getConfigDetails("Name")[0]
		var emailfrom = getConfigDetails("EmailFrom")[0]
			
		switch(parentDoc.getItemValueString("Form")){
			case "Task":
				subj= "Task comment added"
				url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=tasks&noteid=" + parentDoc.getUniversalID()
				txt = "New Task comment has been created by " + by + "<br>Comment: " + newComment.getItemValueString("Content")
				break;
			case "Announcement":
				subj= "Announcement comment added"
				url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=announcements&noteid=" + parentDoc.getUniversalID()
				txt = "New Announcement comment have been created by " + by + "<br>Comment: " + newComment.getItemValueString("Content")
				break;
			case "Library":
				subj= "File comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=files&noteid=" + parentDoc.getUniversalID()
					txt = "New file comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Attachments")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=files&noteid=" + parentDoc.getUniversalID()
					txt = "New file comment has been added by " + by + "<br>File : " + parentDoc.getItemValueString("Attachments")
				}
				break;
				
			case "Workflow":
				subj= "Workflow comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=workflow&noteid=" + parentDoc.getUniversalID()
					txt = "New workflow comment has been added in team room " + gn + " by " + by + "<br>Comment: " + newComment.getItemValueString("Content")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=workflow&noteid=" + parentDoc.getUniversalID()
					txt = "New workflow comment has been added by " + by + "<br>Comment: " + newComment.getItemValueString("Content")
				}
				break;
			case "Poll":
				subj= "Poll comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=workflow&noteid=" + parentDoc.getUniversalID()
					txt = "New poll comment has been added in team room " + gn + " by " + by + "<br>Comment: " + newComment.getItemValueString("Content")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=workflow&noteid=" + parentDoc.getUniversalID()
					txt = "New poll comment has been added by " + by + "<br>Comment: " + newComment.getItemValueString("Content")
				}
				break;

				
			case "Wiki":
				subj= "Wiki comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=wiki&noteid=" + parentDoc.getUniversalID()
					txt = "New wiki comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp#content=wiki&documentId=" + parentDoc.getUniversalID()
					txt = "New wiki comment has been added by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}
				break;
				
			case "Ticket":
				subj= "Helpdesk comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=helpdesk&noteid=" + parentDoc.getUniversalID()
					txt = "New helpdesk case comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=helpdesk&noteid=" + parentDoc.getUniversalID()
					txt = "New helpdesk case comment has been added by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}
				break;
			case "Doc":
				subj= "Blog comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=blogk&noteid=" + parentDoc.getUniversalID()
					txt = "New blogg comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=blog&noteid=" + parentDoc.getUniversalID()
					txt = "New blogg comment has been added by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}
				break;
			case "Idea":
				subj= "Idea comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=ideak&noteid=" + parentDoc.getUniversalID()
					txt = "New idea comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=idea&noteid=" + parentDoc.getUniversalID()
					txt = "New Idea comment has been added by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}
				break;
			case "ForumTopic":
				subj= "Forum Topic comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=forum&noteid=" + parentDoc.getUniversalID()
					txt = "New forum comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=forum&noteid=" + parentDoc.getUniversalID()
					txt = "New forum comment has been added by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}
				break;
			case "Event":
				subj= "Event comment added"
				if(gid!=""){
					var gn = getGroupDetails(gid,"GroupName")[0]
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=forum&noteid=" + parentDoc.getUniversalID()
					txt = "New event comment has been added in team room " + gn + " by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}else{
					url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=forum&noteid=" + parentDoc.getUniversalID()
					txt = "New event comment has been added by " + by + "<br>Subject: " + parentDoc.getItemValueString("Subject")
				}
				break;


			default:
				
		}
		
		var v:java.util.Vector = pdoc.getItemValue("FollowupID");

		for(userid in v){
			
			// do not send mail if it is the user created the comment  
			if(userid != cuserid){
			
				var email = getUserDetails(userid,"Email")
				var flag = 0;
				if(gid!=""){
					 if(isUserGroupMember(userid,gid)){
						 flag=1;
					 }
				}else{
					flag=1;
				}
				
				if(email.indexOf("@")>0 && email.indexOf(".")>0 && flag==1){
				
					var fn = getUserDetails(userid,"Fullname")
					var first = getUserDetails(userid,"FirstName")
					
			  		var mail = new HTMLMail();
			  		var to =  fn + " <" + email + ">"
			  		mail.setTo(to);
			  		mail.setSubject(name + " - " + subj);
			  		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
			  		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
			  		mail.addHTML("<p>Hello " + first  + "</p>");	
			  		mail.addHTML("<p>" + txt + "</p>");
			  		mail.addHTML("<p><a href='" + url + "'>Click here to open and see the new comment</a></p>");
			  		mail.addHTML("<p>You recieved this comment message becuase you have subscribed, if you do not want to recieve future emails, please untick the available checkmark</p>");
			  		
			  		mail.addHTML("</div>");
			  		mail.setSender(emailfrom, name);
			  		mail.send();			                                      		
			  		doLog("Sent new comment mail to " + to)
	
				}else{
					doLog("Email to " + email + " not sent - not valid or not in group")
				}
			}else{
				doLog("not sending comment mail to the user created he comment " + cuserid)
			}
		}

	}catch(e){
		doLog("sendNewCommentMailToPeople " + e,"1")
	}
}


function saveNewIdea(){
	try{
		if(param.containsKey("id")) {
			var gid = param.get("id");
			newidea.replaceItemValue("GroupID",gid); 
		}
		var userid = getCookieValueX("userid");
		newidea.replaceItemValue("UserID",userid);
		newidea.save();
	
		sendMailToPeople(newidea,"6")		
		
		var d = getComponent("dynC");
		d.show("idea")
		
		
	}catch(e){
		print("xyz New idea Error " + e,"1");

	}
}

function saveNewPolls(){
	try{
		if(param.containsKey("id")) {
			var gid = param.get("id");
			newpoll.replaceItemValue("GroupID",gid); 
		}
		var userid = getCookieValueX("userid");
		newpoll.replaceItemValue("UserID",userid);
		newpoll.save();
	
		sendMailToPeople(newpoll,"10")		
		
		var d = getComponent("dynC");
		d.show("polls")
		
		
	}catch(e){
		print("xyz New idea Error " + e,"1");

	}
}


function saveNewForumTopic(){
	try{
		var groupid = context.getUrlParameter("id");
		var userid = getCookieValueX("userid");
		newtopic.replaceItemValue("GroupID",groupid);
		newtopic.replaceItemValue("UserID",userid);
		newtopic.save();
		
		sendMailToPeople(newtopic,"7")
		var d = getComponent("dynC");
		var unid = newtopic.getDocument().getUniversalID();
		d.show("forum",{action:'openDocument',documentId:unid})

		
	}catch(e){
		print("xyz New Forum Error " + e,"1");

	}
}



function content(type){
	try{
		// type should be the same as the lowercase form name
		switch(@LowerCase(type)){
		case "announcement":
			return strings.getString('announcement');
			break;
		case "wiki":
			return strings.getString('wiki');
			break;
		case "blog":
			return strings.getString('blogg');
			break;
		case "library":
			return strings.getString('library');
			break;	
		case "idea":
			return strings.getString('idea');
			break;
		case "photo":
			return strings.getString('photo');
			break;
		case "company":
			return strings.getString('company');
			break;
		case "ticket":
			return strings.getString('ticket');
			break;
		case "forumtopic":
			return strings.getString('forumtopic');
			break;
		case "event":
			return strings.getString('event');
			break;
		case "group":
			return strings.getString('group');
			break;
		case "post":
			return strings.getString('post');
			break;
		case "user":
			return strings.getString('user');
			break;
		case "contact":
			return strings.getString('contact');
			break;
		case "comment":
			return strings.getString('comment');
			break;
		case "message":
			return strings.getString('message');
			break;
		case "list":
			return strings.getString('list');
			break;
		default:
			return "Error";
			break;
		}
	}catch(e){
		doLog("Content translation error " + e,"1")
	}
}

/**
 * getDatasource
 * Resolves a datasource from a custom control
 * 
 * @param componentId    id of the component containing the datasource
 * @param dsName    name of the datasource in the component
 * @author Sven Hasselbach
 */
 function getDatasource( componentId:String, dsName:String ) {
    try{
       var data:java.util.ArrayList = getComponent( componentId ).getAttributes().get("data");
       if( data == null )
          return null;
                     
       var it:java.util.Iterator = data.iterator();
       var obj = null;
       while( it.hasNext() ){
          obj = it.next();
          if( obj.getVar() == dsName )
             return obj;
       }
    }catch(e){
       print( e );
    }
}

 
function deleteAndComments(doc:NotesDocument){
	try{
		var frm = doc.getItemValueString("Form");
		doc.replaceItemValue("HidDelete","1");
		doc.save();
		var x=1;
		var dc:NotesDocumentCollection = doc.getResponses();
		var rdoc:NotesDocument=null;
		for(var i=1;i<dc.getCount();i++){
			rdoc = dc.getNthDocument(i);
			if(rdoc.getItemValueString("Form") == "Comment"){
				rdoc.replaceItemValue("HidDelete","1");
				rdoc.save();
				x++;
			}
		}
		doLog("Removed a " + frm + " + " + x + " Comments")
	}catch(e){
		doLog("deleteAndComments error " + e,"1")
	}
}

function isValidEmail(email){
	
	// Simple 
	var filter = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
	
	// use this for advanced
	//var filter = /^([0-9a-zA-Z-!\'%&\*\+\/=\?^`{}\|$~]([-.!\'%&\*\+\/=\?^`{}\|$~\w]*[0-9a-zA-Z\-!\'%&\*\+\/=\?^`{}\|$~])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]*\.)+[a-zA-Z]{2,9})$/
	return filter.test(email);
}

function sendAdminMassMail(){
	try{
	
		var dc:NotesDocumentCollection = null;
		var sendToCombo = getComponent("sendToChoice").getValue();
		
		var c=0;
		switch(sendToCombo){
		case "1":	// send to All active members
			dc = database.search("Form = \"User\" & Active = \"1\"");
			doLog("1" + dc.getCount());
			break;
		case "2": // send to All not active members
			dc = database.search("Form = \"User\" & Active = \"0\"");
			doLog("2" + dc.getCount());
			break;
		case "3": // send to me
			dc = database.createDocumentCollection();
			var d = getCurrentUserDoc();
			dc.addDocument(d)
			doLog("3" + dc.getCount());
			break;

		default:
			

			doLog("Error");
			break;
		}
		
		if(!dc){
			doLog("no hits");
			return
		}

	  	var rt = getComponent("inputRichText2").getValue();
	  	var rt = @ReplaceSubstring(rt,"\n","");	// ett måste trick
	  	var subject = getComponent("subj").getValue();
	  	var inkllink = getComponent("checkBox2").getValue();
	  	var name = getConfigDetails("Name")[0]
	  	var emailfrom = getConfigDetails("EmailFrom")[0]
	  	
	  	doLog(rt);
	  	doLog(subject);
			
		// send mail
		var mail=null;
		var sarr = java.util.Vector();
		
		for(var i=1;i<=dc.getCount();i++){
		
			var d:NotesDocument = dc.getNthDocument(i);
			var fn = d.getItemValueString("FullName")
			var url = getConfigDetails("domain")[0] + "/" + database.getFilePath()
			var name = getConfigDetails("Name")[0];
			var email = d.getItemValueString("Email")
			//var email = "thomas.adrian@consili.se"
			if(isValidEmail(email)){
			
				
				var to =  fn + " <" + email + ">"
				mail = new HTMLMail();
		 		mail.setTo(to);
		 		mail.setSubject(subject);
		 		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");		 		
		 		mail.addHTML(rt);
		 		if(inkllink=="1"){
		 			mail.addHTML("<p><a href='" + url + "'>" + name + "</a></p>");	
		 		}
		 		mail.addHTML("</div>");
		 		mail.setSender(emailfrom, name);
		 		sarr.add(email)
		 		doLog("sending mail to " + to)
		 		mail.send();
				mail = null
			}else{
				doLog("Email not valid for user " + fn + " " + email)
			}
		}
		var it = onemail.getDocument().getFirstItem("MailSentTo");
		if(it){
			it.appendToTextList(@Text(@Now()) + " - " + sarr.toString())
			onemail.save()
		}else{
			onemail.getDocument().replaceItemValue("MailSentTo",@Text(@Now()) + " - " + sarr.toString())
			onemail.save()
		}
		

	}catch(e){
		doLog("Massmail error " + e,"1")		
	}
}

function getFieldDate(doc,fldName){
	var itDate = doc.getFirstItem(fldName);
	if (itDate != null) {
		if (itDate.getDateTimeValue() != null) {
			return itDate.getDateTimeValue().toJavaDate();    	
		}
	}
}


function getHomePath(){
	var domain = getConfigDetails("Domain")[0]
	doLog("SE gethomepath");
	var path = @LowerCase(@Implode(session.evaluate("@WebDbName")))
	var url = context.getUrl()
	if(@Contains(url,"localhost")){
		var red = "http://localhost/" + path + "/home.xsp";	
	}else{
		var red = domain + "/" + path + "/home.xsp";
	}
	return red
}


function shareContentOnStream(contentDoc){
	
	try{
		var page="";
		var unid = contentDoc.getUniversalID();
		var gid = context.getUrlParameter("id")
		var userid = getCookieValueX("userid");
		var doc:NotesDocument = database.createDocument();
		doc.replaceItemValue("Form","Post");
		doc.replaceItemValue("UserID",userid);
		doc.replaceItemValue("Type","6");
		var c:String="";
		var u:String="";
		
		
		// Special for team room
		if(contentDoc.getItemValueString("Form") == "Group"){
			c= "<div class='tRoomShareContainer'>";
				c+= "<span class='tRoomLeft'><img src='./" + getGroupImageUrl(gid, "ImageURL1") + "'></span>"
				c+= "<span class='tRoomRight'><a href='group.xsp?id=" + gid + "'>" + getGroupDetails(gid,"GroupName")[0] + "</a>";
				c+= "<p>" + groupdoc.getItemValueString("GroupDescription") + "</p>";
				c+= "</span>";
			c+="</div>";
			
			doc.replaceItemValue("BelongTo","Public");
			doc.replaceItemValue("ContentLink",c);
			doc.replaceItemValue("Content",getComponent("sharecommentbox").getValue());

			doc.computeWithForm(false,false)
			doc.save(false,false)
			database.updateFTIndex(true)
			return
			
		}

		
		if(gid!=""){
			doc.replaceItemValue("BelongTo","Group");
			doc.replaceItemValue("GroupID",gid);
			page= "./group.xsp?id=" + gid
		}else{
			doc.replaceItemValue("BelongTo","Public");
			page= "./home.xsp"
		}
		c+= "<div class='shareContainer'>"
		
		c+= "<div class='shareTitle'>"
		subj = contentDoc.getItemValueString("Subject");
		if(subj=="") subj= "- no title-"
			
		switch(contentDoc.getItemValueString("Form")){
			case "Announcement":
				var u = "<a href='./home.xsp#content=announcements&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn015.gif'>&nbsp;" + u;	
				break;
			case "Event":
				var u = "<a href='" + page + "#content=events&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn063.gif'>&nbsp;" + u;	
				break;
			case "Library":
				var u = "<a href='" + page + "#content=files&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn005.gif'>&nbsp;" + u;	
				break;
			case "Doc":
				var u = "<a href='" + page + "#content=blog&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn030.gif'>&nbsp;" + u;	
			break;
			case "Idea":
				var u = "<a href='" + page + "#content=idea&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn031.gif'>&nbsp;" + u;	
			break;
			case "Photo":
				var u = "<a href='" + page + "#content=photos&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn013.gif'>&nbsp;" + u;	
			break;
			case "Wiki":
				var u = "<a href='" + page + "#content=wiki&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./wiki.jpg'>&nbsp;" + u;	
				break;
			case "Company":
				var u = "<a href='" + page + "#content=crm&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn072.gif'>&nbsp;" + u;	
			break;
			case "Ticket":
				var u = "<a href='" + page + "#content=helpdesk&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn120.gif'>&nbsp;" + u;	
			break;
			case "ForumTopic":
				var u = "<a href='" + page + "#content=forum&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn058.gif'>&nbsp;" + u;	
			break;
			case "Poll":
				var u = "<a href='" + page + "#content=polls&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./poll.gif'>&nbsp;" + u;	
			break;
			case "Task":
				var u = "<a href='" + page + "#content=tasks&documentId=" + unid + "'>" + subj + "</a>"
				c+= "<img src='./vwicn082.gif'>&nbsp;" + u;	
			break;
			
			
		}
		c+="</div>";
		c+="</div>";
			
		doc.replaceItemValue("ContentLink",c);
		doc.replaceItemValue("Content",getComponent("sharetext").getValue());

		doc.computeWithForm(false,false)
		doc.save(false,false)
		database.updateFTIndex(true)
		
	}catch(e){
		doLog("sharecontentonstream error " + e)		
	}
	
}

function getDateValue(doc,fld){
	try{
		var it = doc.getFirstItem("Start")
		if(it.getType()==1024){
			return it.getValueDateTimeArray[0]
		}else{
			return null
		}
		
	}catch(e){
		doLog("getDateValue " + e, "1")
		return null
	}
}

function getGenericDateFormat(){
	var jdt:java.text.DateFormat = new java.text.SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss Z");
	var datex = new Date(@Now());
	var date = jdt.format(datex);
	return date
}



function handleLinks(){

	// If user is not logged in and have a link to a resource, store it in scope and redirect after login
	// if user is logged in make a new url
	
	try{
		
		var userid = getCookieValueX("userid");
		var noteid = context.getUrlParameter("noteid")
		var content = context.getUrlParameter("content")
		if(noteid=="" || content == ""){
			return 
		}
		
		var gid = context.getUrlParameter("id")
		var pn = getPageName();
		var domain = getConfigDetails("Domain")[0]
		var path = @LowerCase(@Implode(session.evaluate("@WebDbName")))
		var red = domain + "/" + path + "/start.xsp";
		var url = context.getUrl();
		
		if(userid=="" || userid==null){
			
			if(noteid!="" && noteid!=null){
			
				var cdoc = database.getDocumentByUNID(noteid)
				
				if(!cdoc) return
				
				if(cdoc.getItemValueString("HidDelete")=="1"){
					sessionScope.put("linkmsg","The requested document has been deleted")
					return 
				}else{
					
					sessionScope.put("linkmsg","You will be redirected to the requested document after login")
					if(gid!=""){
						if(@Contains(url,"localhost")){
							var newurl = "http://localhost/" + path + "/group.xsp?id=" + gid + "#content=" + content + "&action=openDocument&documentId=" + noteid
							sessionScope.put("dynC_url",newurl)
							//facesContext.getExternalContext().redirect("http://localhost/" + path + "/start.xsp");
						}else{
							var newurl = domain + "/" + path + "/group.xsp?id=" + gid + "#content=" + content + "&action=openDocument&documentId=" + noteid
							sessionScope.put("dynC_url",newurl)
							//facesContext.getExternalContext().redirect(red);					
						}				
					}else{
						if(@Contains(url,"localhost")){
							var newurl = "http://localhost/" + path + "/home.xsp#content=" + content + "&action=openDocument&documentId=" + noteid
							sessionScope.put("dynC_url",newurl)
							//facesContext.getExternalContext().redirect("http://localhost/" + path + "/start.xsp");
						}else{
							var newurl = domain + "/" + path + "/home.xsp#content=" + content + "&action=openDocument&documentId=" + noteid
							sessionScope.put("dynC_url",newurl)
							//facesContext.getExternalContext().redirect(red);
						}				
					}
				}
			}
		}else{
			// user is logged in
			
			if(gid!=""){
				if(@Contains(url,"localhost")){
					var newurl = "http://localhost/" + path + "/group.xsp?id=" + gid + "#content=" + content + "&action=openDocument&documentId=" + noteid
					//sessionScope.put("dynC_url",newurl)
					facesContext.getExternalContext().redirect(newurl);
				}else{
					var newurl = domain + "/" + path + "/group.xsp?id=" + gid + "#content=" + content + "&action=openDocument&documentId=" + noteid
					//sessionScope.put("dynC_url",newurl)
					facesContext.getExternalContext().redirect(newurl);					
				}				
			}else{
				if(@Contains(url,"localhost")){
					var newurl = "http://localhost/" + path + "/home.xsp#content=" + content + "&action=openDocument&documentId=" + noteid
					//sessionScope.put("dynC_url",newurl)
					facesContext.getExternalContext().redirect(newurl);
				}else{
					var newurl = domain + "/" + path + "/home.xsp#content=" + content + "&action=openDocument&documentId=" + noteid
					//sessionScope.put("dynC_url",newurl)
					facesContext.getExternalContext().redirect(newurl);
				}				
			}
		}
		
	
		
	}catch(e){
		doLog("not logged in link " + e,"1")
	}
}

function sendAllApprovedMail(cdoc:NotesXspDocument){
	
	// send a mail to all the userids in the currentapproversID field
	// all approvers will recieve mail if there is a valid email.	
	
	try{
		
		var url = "";
		var txt = "";
		var subj = ""
		var loginurl = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/";
		var gid = cdoc.getItemValueString("GroupID");
		var cuserid = getCookieValueX("userid");
		var by = getUserDetails(cuserid,"FullName");
		var name = getConfigDetails("Name")[0]
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var date = getGenericDateFormat()
		var fn = getUserDetails(cuserid,"FullName");
		var ddoc = cdoc.getDocument();		
		var wl = ddoc.getItemValue("WorkflowLog");
		var subj = cdoc.getItemValueString("Subject")
		
  		if(gid!=""){
			var gn = getGroupDetails(gid,"GroupName")[0]
			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/group.xsp?id=" + gid + "&content=workflow&noteid=" + cdoc.getDocument().getUniversalID()
			txt = "Your workflow " +  subj + " is now closed"

		}else{
			url = getConfigDetails("domain")[0] + "/" + database.getFilePath() + "/home.xsp?content=workflow&noteid=" + cdoc.getDocument().getUniversalID()
			txt = "Your workflow " +  subj + " is now closed"
		}
	
		var userid = ddoc.getItemValueString("UserID");
		var userdoc = getUserDoc(userid);
		if(!userdoc) return false;
		var email = userdoc.getItemValueString("Email");
		if(email.indexOf("@")>0 && email.indexOf(".")>0){
			var fn = userdoc.getItemValueString("FullName");
			var first = userdoc.getItemValueString("FirstName");
	  		var mail = new HTMLMail();
	  		var to =  fn + " <" + email + ">"
	  		mail.setTo(to);
	  		mail.setSubject(name + " " + subj);
	  		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
	  		mail.addHTML("<p><h3>Notification from " + name + "</h3></p>");
	  		mail.addHTML("<p>Hi " + first  + "</p>");	
	  		mail.addHTML("<p>" + txt + "</p>");
	  		//mail.addHTML("<p>Below you find the link to the new content, if you are not logged in then please login and click the link below a second time</p>")
	  		//mail.addHTML("<p>Below you find the link to the new comment, if you are not logged in then please login by clicking <a href='" + loginurl + "'>here</a> and then click the link below</p>")
	  		mail.addHTML("<p><a href='" + url + "'>Click here to open the document " + name + "</a></p>");
	  		mail.addHTML("</div>");
	  		mail.setSender(emailfrom, name);
	  		mail.send();
	  		wl.insertElementAt(date + " " + fn + " Final Mail sent to " + getUserDetails(userid,"FullName"),0);
	  		doLog("Sent approval mail " + to)

		}else{
			wl.insertElementAt(date + " " + fn + " Final Mail not sent to " + getUserDetails(userid,"FullName") + " - not valid email",0);
			doLog("Email to " + email + " not sent - not valid email or not in group")
		}
  		
  		ddoc.replaceItemValue("WorkflowLog",wl)
  		ddoc.save()
	  		
		
	}catch(e){
		doLog("sendAllApprovedMail " + e, "1")
	}
}

function DbColumnArray(server, dbname, cache, unique, sortit, viewname, column) {
	  var cachekey = "dbcolumn_"+dbname+"_"+@ReplaceSubstring(viewname," ","_")+"_"+@ReplaceSubstring(column," ","_");
	  // if cache is specified, try to retrieve the cache from the sessionscope
	  if (cache.equalsIgnoreCase('cache')) { 
	    var result = sessionScope.get(cachekey);
	  }
	  // if the result is empty, no cache was available or not requested,
	  //    do the dbcolumn, convert to array if not, cache it when requested
	  if (!result) {
	    // determine database to run against
	    var db = "";
	    if (!dbname.equals("")) { // if a database name is passed, build server, dbname array
	      if (server.equals("")){
	        db = new Array(@DbName()[0],dbname); // no server specified, use server of current database
	      } else {
	        db = new Array(server, dbname)
	      } 
	    }
	    var result = @DbColumn(db, viewname, column);
	    if (result && unique.equalsIgnoreCase("unique")) result = @Unique(result);
	    if (result && typeof result == "string") result = new Array(result);
	    if (result && sortit.equalsIgnoreCase("sort")) result.sort();
	    if (result && cache.equalsIgnoreCase('cache')) sessionScope.put(cachekey,result);
	   } 
	  return result;
}

function DbLookupArray(server, dbname, cache, unique, sortit, viewname, keyname, field) {
	  var cachekey = "dblookup_"+dbname+"_"+@ReplaceSubstring(viewname," ","_")+"_"+@ReplaceSubstring(keyname," ","_")+"_"+@ReplaceSubstring(field," ","_");
	  // if cache is specified, try to retrieve the cache from the sessionscope
	  if (cache.equalsIgnoreCase('cache')) { 
	    var result = sessionScope.get(cachekey);
	  }
	  // if the result is empty, no cache was available or not requested,
	  //    do the dblookup, convert to array if not, cache it when requested
	  if (!result) {
	    // determine database to run against
	    var db = "";
	    if (!dbname.equals("")) { // if a database name is passed, build server, dbname array
	      if (server.equals("")){
	        db = new Array(@DbName()[0],dbname); // no server specified, use server of current database
	      } else {
	        db = new Array(server, dbname)
	      } 
	    }
	    var result = @DbLookup(db, viewname, keyname, field);
	    if (result && unique.equalsIgnoreCase("unique")) result = @Unique(result);
	    if (result && typeof result == "string") result = new Array(result);
	    if (result && sortit.equalsIgnoreCase("sort")) result.sort();
	    if (result && cache.equalsIgnoreCase('cache')) sessionScope.put(cachekey,result);
	  }
	  return result;
	}


function getSortedDirectoryArray(){
	
	var d = null
	var id = "";
	var fn = ""
	var id = "";
	var dc = database.getView("(LookupUsers)").getAllDocumentsByKey("User",true)
	var ar = new Array();
	for(var i=1;i<dc.getCount();i++){
		d = dc.getNthDocument(i);
		fn = d.getItemValueString("FirstName");
		ln = d.getItemValueString("LastName");
		em = d.getItemValueString("Email");
		id = d.getItemValueString("UniqueID");
		if(isValidEmail(em)){
			ar.push(fn + " " + ln + "|" + id);	
		}else{
			ar.push(fn + " " + ln + " (no email) |" + id);
		}
		
	}
	
	ar.sort(function (a, b) { 
                   if (a.toLowerCase() > b.toLowerCase()) return 1; 
                   else if (a.toLowerCase() < b.toLowerCase()) return -1; 
                   else return 0; 
           } 
     ); 
	return ar
	
}