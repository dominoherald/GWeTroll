function base64ToNotesItemAttachment(imageString, questionDoc) {
	try{
		var shortstr = @Right(imageString,",");
		//dBar.info("String: " + shortstr);
		session.setConvertMime(false);
		if(questionDoc.hasItem('sigImage')){
			questionDoc.removeItem('sigImage');
			questionDoc.save();
		}
		var mime:NotesMIMEEntity = questionDoc.createMIMEEntity('sigImage');
		var streamIn:NotesStream = session.createStream();
		var streamOut:NotesStream = session.createStream();
		streamIn.writeText(shortstr);
		streamIn.setPosition(0);
		mime.setContentFromText(streamIn, 'binary', NotesMIMEEntity.ENC_BASE64);
		mime.getContentAsBytes(streamOut, true);
		var mheader:NotesMIMEHeader = mime.createHeader('Content-Disposition');
		mheader.setHeaderValAndParams('attachment; filename=\"image.png\"');
		if(questionDoc.save()){
			//dBar.info("doc saved");
		}
		session.setConvertMime(true);
	} catch(e){
		//dBar.error(e.toString());
	};
}
