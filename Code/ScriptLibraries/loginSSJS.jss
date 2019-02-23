function loginTwitterUser(userjson){
	try{
		doLog("Twitter login " + userjson)
	    var userjson = eval("(" + userjson + ")");
	    var firstname = @ProperCase(@Left(userjson.name," "));
	    var lastname = @ProperCase(@RightBack(userjson.name," "));
	    var screenname = userjson.screen_name;
	    if (firstname=="") firstname = "NoFirstName";
	    if (lastname=="") lastname = "NoLastName";
	    
	    var fbemail:string = userjson.id;
	    if(fbemail){
	
	    	fbemail = "twitter_" + fbemail;
			var dt = session.createDateTime("Today");
			dt.setNow();
					
			//lookup user email, if no email will find the twitter id in view
			// view disply both email and twitterid
			doLog("finding >" + fbemail + "< in view lookupUserEmail")
			var v:NotesView = database.getView("(LookupUsersEmail)");
			v.refresh();
			
			var pdoc = v.getDocumentByKey(fbemail,true) //active users - email or twitter id
			if(pdoc){
				
				doLog("found " + fbemail + "< in view lookupUserEmail")
				// twitter user already got a profile here - just login user
				var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
				spw = @Middle(spw,"(",")");	// remove brackets
				pdoc.replaceItemValue("LoginToken",spw);
				pdoc.replaceItemValue("LastLoggedin",dt);
				pdoc.replaceItemValue("LastLoggedInUsing","4");
				pdoc.replaceItemValue("TwitterID",fbemail);
				pdoc.save();
				
				addCookieX("userid",pdoc.getItemValueString("UserID"),"session");
				addCookieX("xid",spw,"session");
				doLog("Twitter login " + fbemail)
				context.redirectToPage("home");
				
			}else{
				// twitter user email not found in intra, create a new profile and login user 
				
				doLog("not found twitter_" + fbemail + " in view lookupUserEmail")
		    	var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
				spw = @Middle(spw,"(",")");	// remove brackets
		    
		    	var newdoc:NotesDocument = database.createDocument()
				newdoc.replaceItemValue("FirstName", firstname)
				newdoc.replaceItemValue("LastName", lastname)
				newdoc.replaceItemValue("Active", "1")
				newdoc.replaceItemValue("Email", fbemail);
				newdoc.replaceItemValue("TwitterID",fbemail);
				//newdoc.replaceItemValue("UnconfirmedEmail",@Text(fbemail));
				newdoc.replaceItemValue("Form", "User")
				newdoc.replaceItemValue("LastLoggedin",dt);
				newdoc.replaceItemValue("FirstTimeFlag","1");
				
				dt = session.createDateTime("Today");
				dt.setNow()
				newdoc.replaceItemValue("DateJoined", dt);
				
				//newdoc.replaceItemValue("DateJoined",@Now());
				newdoc.replaceItemValue("LoginToken",spw);
				newdoc.replaceItemValue("UniqueID",@Unique());
				newdoc.replaceItemValue("Site_Twitter","http://www.twitter.com/" + screenname);
				newdoc.replaceItemValue("LastLoggedInUsing","4");
				newdoc.computeWithForm(false,false)
				newdoc.save(false,false);
				createActivity("",0,"",newdoc);
		
				addCookieX("userid",newdoc.getItemValueString("UserID"),"session");
				addCookieX("xid",spw,"session");
				sendMailToPeople(newdoc,"9")
				doLog("twitter create + login " + fbemail)
		    	context.redirectToPage("home");
		    }
		    
		   }else{
			   
				return "Could not authorize you from twitter, click back button to try again";
		   		doLog("No id found on twitter data")
		   }
	    
//	    	doLog("twitter data " + firstname + lastname)
	}catch(e){
		
		doLog("logintwitterUser Error " + e,"1");
	    _dump(e);
	    return e;

	}

	
}


function loginLinkedinUser(userjson){
	
	/*
	<?xml version="1.0" encoding="UTF-8" standalone="yes"?> <person> <first-name>Thomas</first-name> <last-name>Adrian</last-name> <headline>Computer Software Consultant and Professional</headline> <site-standard-profile-request> <url>http://www.linkedin.com/profile?viewProfile=&amp;key=6013635&amp;authToken=ozv8&amp;authType=name&amp;trk=api*a174788*s183010*</url> </site-standard-profile-request> </person>
	 { "firstName": "Thomas", "headline": "Computer Software Consultant and Professional", "lastName": "Adrian", "siteStandardProfileRequest": {"url": "http://www.linkedin.com/profile?viewProfile=&key=6013635&authToken=ozv8&authType=name&trk=api*a174788*s183010*"} }
	
	2013-02-01 seem like linkedin changed the json url we use to get the user id,
	This is the new json, get the id parameter instead of key seem to fix this
	{
		  "firstName": "Thomas",
		  "headline": "Computer Software Consultant and Professional",
		  "lastName": "Adrian",
		  "siteStandardProfileRequest": {"url": "http://www.linkedin.com/profile/view?id=6013635&authType=name&authToken=ozv8&trk=api*a174788*s183010*"}
		}
	
	*/
	try{
		
		doLog("Linkedin login json: 	" + userjson)
	    var userjson = eval("(" + userjson + ")");
	    var firstname = @ProperCase(userjson.firstName);
	    var lastname = @ProperCase(userjson.lastName);
	    var url = userjson.siteStandardProfileRequest.url;
	    //var url:java.net.URL = new java.net.URL(url)

	    //var k = GetUrlParameter(url,"key") 
	    var k = GetUrlParameter(url,"id")
 		doLog("linkedin url" + url);
	    doLog("linkedin key" + k);
 	 		
	  	var fbemail:String = k;
	  //   var fbemail:String = userjson.id;
 		
	    if(fbemail){
	    	fbemail = "linkedin_" + fbemail;
			var dt = session.createDateTime("Today");
			dt.setNow();
					
			//lookup user email, if no email will find the linkedin id in view
			// view disply both email and linkedin id
			var v:NotesView = database.getView("(LookupUsersEmail)");
			v.refresh();
			
			var pdoc = v.getDocumentByKey(fbemail,true)//active users - email or twitter id
			if(pdoc){
			
				doLog("found " + fbemail + "< in view lookupUserEmail")
				// facebook user already got a profile here - just login user
				var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
				spw = @Middle(spw,"(",")");	// remove brackets
				pdoc.replaceItemValue("LoginToken",spw);
				pdoc.replaceItemValue("LastLoggedin",dt);
				pdoc.replaceItemValue("LastLoggedInUsing","5");
				pdoc.replaceItemValue("LinkedinID",fbemail);
				pdoc.save();
				
				addCookieX("userid",pdoc.getItemValueString("UserID"),"session");
				addCookieX("xid",spw,"session");
				doLog("linkedin login " + fbemail)
				context.redirectToPage("home");
				
			}else{
				doLog("not found " + fbemail + "< in view lookupUserEmail")
				// facebook user email not found in intra, create a new profile and login user 
				
		    	var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
				spw = @Middle(spw,"(",")");	// remove brackets
		    
		    	var newdoc:NotesDocument = database.createDocument()
				newdoc.replaceItemValue("FirstName", firstname)
				newdoc.replaceItemValue("LastName", lastname)
				newdoc.replaceItemValue("Active", "1")
				newdoc.replaceItemValue("Email", fbemail);
				newdoc.replaceItemValue("LinkedinID",fbemail);
				newdoc.replaceItemValue("Form", "User")
				newdoc.replaceItemValue("LastLoggedin",dt);
				newdoc.replaceItemValue("FirstTimeFlag","1");
				
				var dt:NotesDateTime = session.createDateTime(@Now());
				dt.setNow()
				newdoc.replaceItemValue("DateJoined", dt);
				//newdoc.replaceItemValue("DateJoined",@Now());
				
				newdoc.replaceItemValue("LoginToken",spw);
				newdoc.replaceItemValue("UniqueID",@Unique());
				newdoc.replaceItemValue("Site_LinkedIn",url);
				newdoc.replaceItemValue("LastLoggedInUsing","5");
				newdoc.computeWithForm(false,false)
				newdoc.save(false,false);
				createActivity("",0,"",newdoc);
		
				addCookieX("userid",newdoc.getItemValueString("UserID"),"session");
				addCookieX("xid",spw,"session");
				
				sendMailToPeople(newdoc,"9")
				doLog("linkedin create + login " + fbemail)
		    	context.redirectToPage("home");
		    }
		    
		   }else{
			   
				return "Could not authorize you from linkedin, click back button to try again";
		   		doLog("No id found on linkedin data")
		   }
	    
	    	//doLog("linkedin data " + firstname + lastname)
	}catch(e){
		
		doLog("loginlinkedin Error " + e,"1");
	    _dump(e);
	    return e;

	}
	
		
}



// We get email from facebook so this need no email confirmation
function loginFBUser(userjson){

	try{
		doLog("Facebook login " + userjson)
	    var userjson = eval("(" + userjson + ")");
	    var firstname = @ProperCase(userjson.first_name);
	    var lastname = @ProperCase(userjson.last_name);
	    var fbemail = userjson.email;
	    
	    var fbid = userjson.id;
	    if(fbemail){
	    	var fbid = "facebook_" + fbid;
			var dt = session.createDateTime("Today");
			dt.setNow();
					
			var pdoc = database.getView("(LookupUsersEmail)").getDocumentByKey(fbemail,true)
			if(pdoc){
				
				// facebook user already got a profile here - just login user
				var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
				spw = @Middle(spw,"(",")");	// remove brackets
				pdoc.replaceItemValue("LoginToken",spw);
				pdoc.replaceItemValue("LastLoggedin",dt);
				pdoc.replaceItemValue("LastLoggedInUsing","3");
				pdoc.replaceItemValue("FacebookID",fbid);
				pdoc.save();
				
				addCookieX("userid",pdoc.getItemValueString("UserID"),"session");
				addCookieX("xid",spw,"session");
				doLog("Facebook login " + fbemail)
				context.redirectToPage("home");
				
			}else{
				
				
				//Try to retrieve the fb image
				/*
				var imgUrl = "http://graph.facebook.com/" + fbid + "/picture?type=large
				saveImage(imgUrl, "c:\fbimg.jpg" 
				var newimgdoc:NotesDocument = database.createDocument()
				newimgdoc.replaceItemValue("Photo")
				var rt:NotesRichTextItem = newimgdoc.createRichTextItem("Body")
				rt.embedObject(lotus.domino.local.EmbeddedObject.EMBED_ATTACHMENT, "", imgUrl, null);
				newimgdoc.save();
				
				
				//newFileOrg = getPath() + un + "_org.jpg"
				*/
				
				// facebook user email not found in intra, create a new profile and login user 
				
		    	var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
				spw = @Middle(spw,"(",")");	// remove brackets
		    
		    	var newdoc:NotesDocument = database.createDocument()
				newdoc.replaceItemValue("FirstName", firstname)
				newdoc.replaceItemValue("LastName", lastname)
				newdoc.replaceItemValue("Active", "1")
				newdoc.replaceItemValue("Email", fbemail);
				newdoc.replaceItemValue("FacebookID",fbid);
				newdoc.replaceItemValue("Form", "User")
				newdoc.replaceItemValue("LastLoggedin",dt);
				newdoc.replaceItemValue("FirstTimeFlag","1");

				var dt:NotesDateTime = session.createDateTime(@Now());
				dt.setNow()
				newdoc.replaceItemValue("DateJoined", dt);

				
				//newdoc.replaceItemValue("DateJoined",@Now());
				newdoc.replaceItemValue("LoginToken",spw);
				newdoc.replaceItemValue("UniqueID",@Unique());
				//newdoc.replaceItemValue("Site_Fb","");
				newdoc.replaceItemValue("LastLoggedInUsing","3");
				newdoc.computeWithForm(false,false)
				newdoc.save(false,false);
				createActivity("",0,"",newdoc);
		
				addCookieX("userid",newdoc.getItemValueString("UserID"),"session");
				addCookieX("xid",spw,"session");
				
				sendMailToPeople(newdoc,"9")
				doLog("Facebook create + login " + fbemail)
		    	context.redirectToPage("home");
		    }
		    
		   }else{
			   
				return "Could not authorize you from facebook, click back button to try again";
		   		doLog("No email found on facebook data")
		   }
	    
	    	//doLog("Facebook data " + firstname + lastname)
	}catch(e){
		
		doLog("loginFBUser Error " + e,"1");
	    _dump(e);
	    return e;

	}
}
function GetUrlParameter(url,param) {
	 var val = "";
	 var qs = url;
	 var start = url.indexOf(param);

	 if (start != -1) {
	  start += param.length + 1;
	  var end = qs.indexOf("&", start);
	  if (end == -1) {
	   end = qs.length
	  }
	  val = qs.substring(start,end);
	 }
	 return val;
}

function loginUser(){
	try{
		var us = getComponent("username").getValue();
		var pw = getComponent("password").getValue();
		
		if(us==""){
			viewScope.Msg = "Not a valid email"
			//getComponent("msg").setValue("Not a valid email");
			doLog("not valid email");
			return false;
		}
		
		if(pw==""){
			viewScope.Msg = "You should login using Domino"
			getComponent("msg").setValue("You should login using Domino");
			doLog("You have no password on this sire, maybe you should login using a social service?");
			return false;
		}
		
		var epw = @Implode(session.evaluate("@Password('" + pw + "')"));
		var spw = @Implode(session.evaluate("@HashPassword('" + pw + "')"));
		spw = @Middle(spw,"(",")");	// login token, remove brackets
		var flag=0;
		var udoc:NotesDocument = database.getView("(LookupUsersEmail)").getDocumentByKey(us,true)
		if(udoc){
			if(epw == udoc.getItemValueString("Password")){
				doLog("Database " + database.getFilePath() + " Login " + us);
				udoc.replaceItemValue("LoginToken",spw);
				udoc.save()
				var userid = udoc.getItemValueString("UserID");
				
				viewScope.Msg = "Login successfull"
				//getComponent("msg").setValue("Login successfull");
				
				var rem = getComponent("rem").getValue();
				if(rem==1){
					addCookieX("userid",userid,"store");
					addCookieX("xid",spw,"store");
					
				}else{
					addCookieX("userid",userid,"session");
					addCookieX("xid",spw,"session");
				}
				
				
				var dt = session.createDateTime("Today");
				dt.setNow(); 
					
				if(udoc.getItemValueString("FirstTimeFlag")=="")
				{
					udoc.replaceItemValue("FirstTimeFlag","1");
					var dt:NotesDateTime = session.createDateTime(@Now());
					dt.setNow()
					udoc.replaceItemValue("DateJoined", dt);
					//udoc.replaceItemValue("DateJoined",@Now());
					udoc.save();
					// we cannot use create activity here, cookie userid not yet available, use udoc instead
					//var targetID = udoc.getItemValueString("UserID");
					createActivity("",0,"",udoc);
					sendMailToPeople(udoc,"9")
				}
				udoc.replaceItemValue("LastLoggedInUsing","1");
				udoc.replaceItemValue("LastLoggedin",dt);
				udoc.save();
				
				
				doLog("User login " + getUserDetails(userid,"FullName"))
				return true;
				//context.redirectToPage(redirec);
				//context.reloadPage();
				
			}else{
				viewScope.Msg = "Username or password incorrect"
				//getComponent("msg").setValue("Username or password incorrect");
				doLog("Password Incorrect for user " + us)
				return false
			}
		}else{
			viewScope.Msg = "Username or password incorrect"
			//getComponent("msg").setValue("Username or password incorrect");
			doLog("Username Incorrect user " + us)
			return false
		}
		
	}catch(e){
		doLog("Login Error " + e,"1");
		//getComponent("msg").setValue("Error " + e);
		return false
	}
}

function dominoLogin(){
	
	try{
		
		// This function is used in start.xsp
		// We support both logged in domino users as well as registered anonymous users
		// If user is logged in to domino, create the profile and cookies automatically 
		// If user is logged in to domino we do not check the users password
		// If this function return true the cookie is created and user is logged in.
		
		// Find out if user is lgged in to Domino
		var name:String = @UserName();
		var ddDmail = "";
		
		if(name!="Anonymous"){
		
			// v1.5 
			var lv = new java.util.Vector();
			var lv:java.util.Vector = getConfigDetails("LoginTypes")
			if(!lv.contains("2")){
				doLog("Login using Domino tried but not allowed in config")
				return;
			}
			
			
			// User is logged in to domino
			var dd = getConfigDetails("DominoDirectory")[0]
			if(dd==""){
				var db = sessionAsSigner.getDatabase(database.getServer(),"names.nsf")
			}else{
				var db = sessionAsSigner.getDatabase(database.getServer(),dd)
			}
			
			var doc = db.getView("($Users)").getDocumentByKey(name,true)
			if(doc){
				
				// User found in Domino Directory, now look and see if profile found
				
				// Last logged in date
				var dt = session.createDateTime("Today");
				dt.setNow();
				
				ddEmail = doc.getItemValueString("InternetAddress");
				if(ddEmail==""){
					ddEmail = doc.getItemValueString("MailAddress");
				}
				var pdoc = database.getView("(LookupUsersEmail)").getDocumentByKey(ddEmail,true)
				if(pdoc){

					// This user is logged in to domino and also has a profile here
					// Now, Create cookie and login user
					
					//var epw = @Implode(session.evaluate("@Password('" + pw + "')"));
					var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
					spw = @Middle(spw,"(",")");	// remove brackets
					pdoc.replaceItemValue("LoginToken",spw);
					pdoc.replaceItemValue("LastLoggedin",dt);
					pdoc.replaceItemValue("LastLoggedInUsing","2");
					pdoc.save();
					
					addCookieX("userid",pdoc.getItemValueString("UserID"),"session");
					addCookieX("xid",spw,"session");
					doLog("Domino user login " + ddEmail)
					context.redirectToPage("home");
					return true;
					
				}else{
					
					// User is logged in to domino but does not have a profile here, 
					// create a profile, create a cookie and login user

					var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
					spw = @Middle(spw,"(",")");	// remove brackets
					
					var newdoc:NotesDocument = database.createDocument()
					newdoc.replaceItemValue("FirstName", @ProperCase(doc.getItemValueString("FirstName")))
					newdoc.replaceItemValue("LastName", @ProperCase(doc.getItemValueString("LastName")))
					newdoc.replaceItemValue("Active", "1")
					newdoc.replaceItemValue("Email", ddEmail);
					newdoc.replaceItemValue("Form", "User")
					newdoc.replaceItemValue("LastLoggedin",dt);
					newdoc.replaceItemValue("FirstTimeFlag","1");

					var dt:NotesDateTime = session.createDateTime(@Now());
					dt.setNow()
					newdoc.replaceItemValue("DateJoined", dt);
					//newdoc.replaceItemValue("DateJoined",@Now());
					
					newdoc.replaceItemValue("LoginToken",spw);
					newdoc.replaceItemValue("UniqueID",@Unique());
					newdoc.replaceItemValue("LastLoggedInUsing","2");
					newdoc.computeWithForm(false,false)
					newdoc.save(false,false);
					createActivity("",0,"",newdoc);

					addCookieX("userid",newdoc.getItemValueString("UserID"),"session");
					addCookieX("xid",spw,"session");
					
					sendMailToPeople(newdoc,"9")
					doLog("Domino user create + login " + ddEmail)
					context.redirectToPage("home");
					return true;
				}
			}else{
				
				// User not found in Domino Directory, just exit
				return false
			}	
		}else{
			// Anonymous user, just exit
			return false
		}
		
			
	}catch(e){
		doLog("dominoLogin"  + e,"1")
		return false
	}
	
	
}


function windowsLogin(){
	
	try{
		
		// This function is used in start.xsp
		var lv = new java.util.Vector();
		var lv:java.util.Vector = getConfigDetails("LoginTypes")
		if(!lv.contains("6")){
			doLog("Login using Windows tried but not allowed in config")
			return;
		}
		
		// Login user using Active directory credentials
	
		var dt = session.createDateTime("Today");
		dt.setNow();
		
		var ldapurl = getConfigDetails("ADLdapUrl")[0]
		var whereToSearch = getConfigDetails("ADLdapWhereToSearch")[0]
		var usernamePrincipal = getComponent("ad_username").getValue()
		var pw = getComponent("ad_password").getValue()
		
		if(ldapurl ==""| whereToSearch=="" || usernamePrincipal=="" || pw==""){
			viewScope.Msg = "Missing information"
			return
		}
		
		// Authorisation is made using the "userPrincipalName" in AD
		
		
		var ad = com.intrapages.LdapCalls();
		var fullName = ad.getADUser(ldapurl, whereToSearch,usernamePrincipal,pw)
		if(fullName ==""){
			viewScope.Msg = "Wrong username, password, user do not exist or no contact with server"
			return
		}
		
		ADEmail = usernamePrincipal;
		
		var pdoc = database.getView("(LookupUsersEmail)").getDocumentByKey(ADEmail,true)
		if(pdoc){

			// Windows credentials ok and user already got a profile
			// Now, Create cookie and login user
			
			//var epw = @Implode(session.evaluate("@Password('" + pw + "')"));
			var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
			spw = @Middle(spw,"(",")");	// remove brackets
			pdoc.replaceItemValue("LoginToken",spw);
			pdoc.replaceItemValue("LastLoggedin",dt);
			pdoc.replaceItemValue("LastLoggedInUsing","6");
			pdoc.save();
			
			addCookieX("userid",pdoc.getItemValueString("UserID"),"session");
			addCookieX("xid",spw,"session");
			doLog("Windos AD user login " + ADEmail)
			context.redirectToPage("home");
			return true;
			
		}else{
			
			// First time Windows login 
			// create a profile, create a cookie and login user

			var spw = @Implode(session.evaluate("@HashPassword(@Unique)"));
			spw = @Middle(spw,"(",")");	// remove brackets
			
			var newdoc:NotesDocument = database.createDocument()
			newdoc.replaceItemValue("FirstName", @ProperCase(@Left(fullName," ")))
			newdoc.replaceItemValue("LastName", @ProperCase(@RightBack(fullName," ")))
			newdoc.replaceItemValue("Active", "1")
			newdoc.replaceItemValue("Email", ADEmail);
			newdoc.replaceItemValue("Form", "User")
			newdoc.replaceItemValue("LastLoggedin",dt);
			newdoc.replaceItemValue("FirstTimeFlag","1");

			var dt:NotesDateTime = session.createDateTime(@Now());
			dt.setNow()
			newdoc.replaceItemValue("DateJoined", dt);
			//newdoc.replaceItemValue("DateJoined",@Now());
			
			newdoc.replaceItemValue("LoginToken",spw);
			newdoc.replaceItemValue("UniqueID",@Unique());
			newdoc.replaceItemValue("LastLoggedInUsing","6");
			newdoc.computeWithForm(false,false)
			newdoc.save(false,false);
			createActivity("",0,"",newdoc);

			addCookieX("userid",newdoc.getItemValueString("UserID"),"session");
			addCookieX("xid",spw,"session");
			
			sendMailToPeople(newdoc,"9")
			doLog("Windows AD user create + login " + ADEmail)
			context.redirectToPage("home");
			return true;	
		}
		
			
	}catch(e){
		doLog("AD Login"  + e,"1")
		return false
	}
	
	
}