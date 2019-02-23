
function forgottPassword(){
	
	try{
		var em = getComponent("em").getValue();
		if(em==""){
			getComponent("msg").setValue("User not found");
			return false;
		}
		if(!isValidEmail(em)){
			getComponent("msg").setValue("Not a valid email");
			return false;
		}
		var dc = database.search("Form='User' & Email='" + em  + "'");
		var d = dc.getFirstDocument();
		if(d){
			
			if(d.getItemValueString("Password")==""){
				var soc = "";
				if(d.getItemValueString("FacebookID")!="") soc+= "Facebook";
				if(d.getItemValueString("LinkedinID")!="") soc+= " Linkedin";
				if(d.getItemValueString("TwitterID")!="") soc+= " Twitter";
				if(soc==""){
					getComponent("msg").setValue("No password - try Domino login")	
				}else{
					getComponent("msg").setValue("You have no password, We found previous logins from you using " + soc)
				}
				return false;
			}
			
			var fpk = @Unique();	// genreate a forgot password key and set that on user
			var cid = d.getItemValueString("UniqueID");
			var fn = d.getItemValueString("FirstName");		
			var pw = d.getItemValueString("Password");
			var name = getConfigDetails("name")[0]
			var emailfrom = getConfigDetails("EmailFrom")[0]
			var domain = getConfigDetails("domain")[0]
			var url = domain + "/" + database.getFilePath() + "/fpw.xsp?e=" + em + "&k=" + fpk;
			d.replaceItemValue("ForgPassKey",fpk);
			d.save();
			
			var mail = new HTMLMail();
			mail.setTo(em);
			mail.setSubject("Reset you password at " + name);
			mail.addHTML("<p><h1>Reset password for " + name + "</h1></p>");
			
			mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
			mail.addHTML("<p>Dear " + fn  + "</p>");
			mail.addHTML("<p><a href='" + url + "'>Click here to reset your password</a></p>");
			mail.addHTML("</div>");
			mail.setSender(emailfrom, name);
			mail.send();
			doLog("Change passoword mail send to " + em)
			getComponent("msg").setValue("Instructions on how to change your password has been sent to your email, check your mail! (also check spam folder)")
			getComponent("fpw").setRendered(false);
			
		}else{
			getComponent("msg").setValue("User not found")
			
		}
	}catch(e){
		doLog("fpw error " + e,"1")
		//viewScope.put("msg1",e);
			
	}
}

function registration(){

	try{
		var fn = getComponent("firstName1").getValue();
		var ln = getComponent("lastName1").getValue();
		var em = getComponent("email1").getValue();
		var pw = getComponent("password1").getValue();
		var epw = session.evaluate("@Password('" + pw + "')");
		
		//var sec1 = getComponent("computedField1").getValue();
		//var sec2 = getComponent("inputText1").getValue();

		if(!isValidRegDomain(em)){
			var dom = @RightBack(em,"@");
			doLog("Registration failed - for user " + em + " Domain " + dom + " is not allowed");
			getComponent("msg").setValue("You are not authorized to register using an email from domain " + dom);
			return false;
		}
		
		if(@Contains(@LowerCase(fn),"test") || @Contains(@LowerCase(ln),"test")){
			getComponent("msg").setValue("Please enter your real name");
			//getComponent("inputText1").setValue("");
			return false;
		}
		
//		if(sec1!=sec2){
//			getComponent("msg").setValue("Security code error");
//			getComponent("inputText1").setValue("");
//			return false;
//		}

		var dc = database.search("Form='User' & Email='" + em  + "'");
		var d = dc.getFirstDocument();
		if(d){
			getComponent("msg").setValue("user " + em + " already exit")
			return false;
		}

		
/*		
		if(em!="notessidan@gmail.com"){
			var dc = database.search("Form='User' & Email='" + em  + "'");
			var d = dc.getFirstDocument();
			if(d){
				getComponent("msg").setValue("user " + em + " already exit")
				return false;
			}
		}
*/		
				
		newuser.setValue("UniqueID",@Unique());
		newuser.setValue("Password",epw);	
		newuser.save();
		
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var domain = getConfigDetails("domain")[0]
		var cid = newuser.getItemValueString("UniqueID");
		var url = domain + "/" + database.getFilePath() + "/activate.xsp?sc=login&cid=" + cid;
		var name = getConfigDetails("Name")[0];
			//var sender = "noreply@intrapages.com";
		
		var mail = new HTMLMail();
		mail.setTo(em);
		mail.setSubject("Please activate your new account at " + name);
		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
		mail.addHTML("<p><h3>Please activate your new account at " + name + "</h3></p>");
		mail.addHTML("<p>Hello " + fn  + ", Thank you for signing up to " + name + "</p>");
		mail.addHTML("<p>Your login username is : " + em + "</p>");
		mail.addHTML("<p><a href='" + url + "'>Click here to activate your account</a></p>");
		mail.addHTML("</div>");
		mail.setSender(emailfrom, name);
		mail.send();
		
		getComponent("msg").setValue("Registration successful, check your mail! (also check spam folder)")
		getComponent("reg").setRendered(false);
		//context.redirectToPage("start");
		
		
	}catch(e){
		doLog("registration " + e,"1");
		
	}
}

function resetpassword(){
	
	try{
		var msg = getComponent("msg");
		var pw1 = getComponent("pw1").getValue();
		var pw2 = getComponent("pw2").getValue();
		if(pw1!=pw2 || pw1==""){
			msg.setValue("Password not same or not valid")
			return false;
		}
		
		var email = context.getUrlParameter("e");
		var key = context.getUrlParameter("k");
		var userdoc = database.getView("(LookupUsersEmailAll)").getDocumentByKey(email,true);
		if(!userdoc){
			getComponent("msg").setValue("Invalid user")
		}
		
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var name = getConfigDetails("Name")[0]
		var domain = getConfigDetails("domain")[0]
		var url = domain + "/" + database.getFilePath()
		var fullname = userdoc.getItemValueString("Fullname");		
		var fkey = userdoc.getItemValueString("ForgPassKey");
		if(fkey!="" && fkey==key){
		
			if(userdoc.getItemValueString("Active") == "1"){	
				var enewpw = @Implode(session.evaluate("@Password('" + pw1 + "')"));
				userdoc.replaceItemValue("Password",enewpw)
				userdoc.replaceItemValue("ForgPassKey","")
				userdoc.save();
				
				var mail = new HTMLMail();
				mail.setTo(email);
				mail.setSubject("Your new password at " + name);
				mail.addHTML("<p><h1>You have changed your password at " + name + "</h1></p>");
				mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
				mail.addHTML("<p>Dear " + fullname + "</p>");
				mail.addHTML("<p>Your password: " + pw1 + "</p>")
				mail.addHTML("<p><a href='" + url + "'>Click here to login</a></p>");
				mail.addHTML("</div>");
				mail.setSender(emailfrom, name);
				mail.send();
				doLog("New password mail sent to user " + email)
				getComponent("msg").setValue("You have successfully changed your password")
				getComponent("cpw").setRendered(false);
			}else{
			
				// user not active, first time password
					
				var enewpw = @Implode(session.evaluate("@Password('" + pw1 + "')"));
				userdoc.replaceItemValue("Password",enewpw)
				userdoc.replaceItemValue("ForgPassKey","")
				userdoc.replaceItemValue("Active","1")
				userdoc.save();
				
				var mail = new HTMLMail();
				mail.setTo(email);
				mail.setSubject("Confirmation successful at " + name);
				mail.addHTML("<p><h1>You have confirmed your membership at " + name + "</h1></p>");
				mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:100%;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
				mail.addHTML("<p>Welcome " + fullname + " to " + name + "</p>");
				mail.addHTML("<p>Your password: " + pw1 + "</p>")
				mail.addHTML("<p><a href='" + url + "'>Click here to visit " + name + "</a></p>");
				mail.addHTML("</div>");
				mail.setSender(emailfrom, name);
				mail.send();
				doLog("First time password set for user " + email)
				getComponent("msg").setValue("Password was set successfully, you can now login")
				getComponent("cpw").setRendered(false);
				
			}
			
		}else{
			getComponent("msg").setValue("You are not allowed to perform that operation for email " + email)
			doLog("User change password failed email: " + email + " key: " + key)
		}
			
	
	}catch(e){
		//getComponent("msg").setValue(e)
		doLog("fpw Error" +  e,"1")
}

}

function activateUser(){
	
	
	 //Two activations possible, login activiation and email confirmation activiation (if twitter or linkedin user)
	
	try{
		var domain = getConfigDetails("domain")[0]
		var url = domain + "/" + database.getFilePath()
		
		var cid = context.getUrlParameter("cid");
		var sc = context.getUrlParameter("sc");
		if(cid!=""){
			var udoc = getDoc(cid);
			if(udoc){
				switch(sc){
				case "email":
					// Twitter or linkedin
					// check if user have an unconfimed email
					var uce = udoc.getItemValueString("UnconfirmedEmail");
					if(uce!=""){
						// move the email to the real email field so we can send mail to user
						// when logging in using twitter or linkedin we need to use the twitterID or linkedINID
						udoc.replaceItemValue("Email",uce);
						udoc.replaceItemValue("UnconfirmedEmail","");
						udoc.save();
						getComponent("msg").setValue("Email confirmed");
					}else{
						getComponent("msg").setValue("Error - No email to confirm");
					}
					break;
				case "login":
					var a = udoc.getItemValueString("Active");
					if(a=="1"){
						getComponent("msg").setValue("You have already confirmed")			
					}else{
						udoc.replaceItemValue("Active","1");	
						udoc.save();
						getComponent("msg").setValue("Confirmation successfull, you can now login")			
					}
					break;
				default:
					getComponent("msg").setValue("not supported")
					break;
				}
			}else{
				getComponent("msg").setValue("Confirmation failed!")
			}
			//context.redirectToPage("start.xsp?sc=login");
		}
	}catch(e){
		doLog("activate user error" + e,"1")
	}
}


function inviteUserFromAdmin(){
	try{
		
		var d:NotesDateTime = session.createDateTime("Today");
		d.setNow();
		
		// send an invite to the user with a link to fpw - resetpassword()
		var usdoc:NotesDocument = dct.getDocument();
		var senderId = getCookieValueX("userid");
		var sendername = getUserDetails(senderId,"FullName");
		var emailfrom = getConfigDetails("EmailFrom")[0]
		var domain = getConfigDetails("domain")[0];
		var name = getConfigDetails("Name")[0];
		var em = usdoc.getItemValueString("Email");
		//var fpk = usdoc.getItemValueString("ForgPassKey"); 
		//var pw = usdoc.getItemValueString("PWTemp");
		var fn = usdoc.getItemValueString("FirstName");
		
		var fpk = @Unique();	// genreate a new key sent with the mail
		usdoc.replaceItemValue("ForgPassKey",fpk);
		
		usdoc.replaceItemValue("DateTimeInvited",d);
		usdoc.save();

		var cid = usdoc.getItemValueString("UniqueID");
		//var url = domain + "/" + database.getFilePath() + "/start.xsp?sc=login&cid=" + cid;
		var url = domain + "/" + database.getFilePath() + "/fpw.xsp?e=" + em + "&k=" + fpk;
		
		var mail = new HTMLMail();
		mail.setTo(em);
		mail.setSubject(name + " Invitation from " + getUserDetails(senderId,"FullName"));
		mail.addHTML( "<div style='font-family:verdana;font-size:10px;width:500px;background-color:#F2F2F2;border:1px solid #C0C0C0;padding:20px'>");
		mail.addHTML("<p><h3>" + name + " Invitation</h3></p>");
		mail.addHTML("<p>Hello " + fn + ", You have been invited by " + getUserDetails(senderId,"FullName") + " to join " + name + "</p>");
		mail.addHTML("<p>A new user have already been created for you, you need to click link below to activate your account and specify a password</p>");
		mail.addHTML("<p>Your login username: " + em + "</p>");
		mail.addHTML("<p><a href='" + url + "'>Click here to activiate your account and login</a></p>");
		mail.addHTML("</div>");
		mail.setSender(emailfrom, name);
		mail.send();
//		var sc = "pn('Success','Invitation sent')"
//		view.postScript(sc)
//		getComponent("invMsg").setValue("Invitation sent to " + em)
		doLog("Invition mail sent to " + em);
		
		//usdoc.replaceItemValue("DateTimeInvited",@Now().toJavaDate())
		//usdoc.save();
	}catch(e){
		doLog("InviteUserFromAdmin Error "+ e,"1")
	}
}