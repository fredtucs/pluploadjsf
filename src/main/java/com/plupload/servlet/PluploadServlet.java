package com.plupload.servlet;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.WriteAbortedException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;

import com.plupload.model.AttributesPackage;
import com.plupload.model.TemporaryFile;

/**
 * Handles the multi-part MIME encoded POST from Plupload.
 * 
 * @author Shad Aumann, JSF adaptation: Tiago Peres França
 */
public class PluploadServlet extends HttpServlet {
	static private final long serialVersionUID = 3447685998419256747L;
	static private final String RESP_SUCCESS = "{}";
	static private final String RESP_ERROR = "{\"jsonrpc\" : \"2.0\", \"error\" : {\"code\": 101, \"message\": \"Failed to open input stream.\"}, \"id\" : \"id\"}";
	static private final String RESP_ERROR_DEL = "{\"jsonrpc\" : \"2.0\", \"error\" : {\"code\": 300, \"message\": \"Failed to delete stream.\"}, \"id\" : \"id\"}";
	static public final String SEP = System.getProperty("file.separator");
	static public final String TMP = System.getProperty("java.io.tmpdir");
	static public final String JSON = "application/json";
	static public final int BUF_SIZE = 4096;

	// variable to reference the Plupload ManagedBean stored in session
	private AttributesPackage atts;

	/**
	 * Handles an HTTP POST request from Plupload.
	 * 
	 * There's a problem with the approach used by this method, read it in
	 * "com.plupload.component.SimpleQueueRenderer#encodeEnd" description.
	 * 
	 * @param req
	 *            The HTTP request
	 * @param resp
	 *            The HTTP response
	 * @author Shad Aumann, JSF adaptation: Tiago Peres França
	 * @version 0.2
	 */
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		String action = req.getParameter("action");
		String name = req.getParameter("name");
		Long size = Long.parseLong(req.getParameter("size") == null ? "0" : req.getParameter("size"));

		HttpSession session = req.getSession(false);
		if (session == null) {
			atts = (AttributesPackage) getServletContext().getAttribute("plupload_attributes");
		} else {
			atts = (AttributesPackage) session.getAttribute("plupload_attributes");
			if (atts == null) {
				atts = (AttributesPackage) getServletContext().getAttribute("plupload_attributes");
			}
		}

		String responseString = RESP_SUCCESS;
		if (action == null) {
			boolean isMultipart = ServletFileUpload.isMultipartContent(req);

			if (isMultipart) {
				ServletFileUpload upload = new ServletFileUpload();

				try {
					FileItemIterator iter = upload.getItemIterator(req);
					while (iter.hasNext()) {
						FileItemStream item = iter.next();
						InputStream input = item.openStream();

						// Handle a multi-part MIME encoded file.
						if (!item.isFormField()) {
							atts.getFiles().add(saveUploadFile(input, item));
						}
					}
				} catch (FileUploadException e) {
					responseString = e.getMessage();
					throw new IOException(e.getMessage());
				}
			} else {
				responseString = RESP_ERROR;
			}
		} else if (action.equalsIgnoreCase("removeAll") && atts != null) {
			for (TemporaryFile tf : atts.getFiles()) {
				try {
					File temp = new File(tf.getTemporaryPath());
					temp.delete();
				} catch (Exception e) {
					responseString = RESP_ERROR_DEL;
				}
			}
		} else if (atts != null) {

			for (TemporaryFile tf : atts.getFiles()) {
				if (tf.getName().equals(name) && tf.getSize().longValue() == size) {
					try {
						File temp = new File(tf.getTemporaryPath());
						temp.delete();
						atts.getFiles().remove(tf);
					} catch (Exception e) {
						responseString = RESP_ERROR_DEL;
					}
					break;
				}
			}
		}

		resp.setContentType(JSON);
		byte[] responseBytes = responseString.getBytes();
		resp.setContentLength(responseBytes.length);
		ServletOutputStream output = resp.getOutputStream();
		output.write(responseBytes);
		output.flush();
	}

	// private void messageResponse(String message, HttpServletResponse resp)
	// throws ServletException, IOException {
	// resp.setContentType(JSON);
	// byte[] responseBytes = message.getBytes();
	// resp.setContentLength(responseBytes.length);
	// ServletOutputStream output = resp.getOutputStream();
	// output.write(responseBytes);
	// output.flush();
	//
	// }

	/**
	 * Saves the given file item (using the given input stream) to the web
	 * server's local temp directory.
	 * 
	 * @param input
	 *            The input stream to read the file from
	 * @param item
	 *            The multi-part MIME encoded file
	 * @author Shad Aumann, JSF adaptation: Tiago Peres França
	 * @version 0.1
	 */
	private TemporaryFile saveUploadFile(InputStream input, FileItemStream item) throws IOException {
		File localFile = File.createTempFile("plupload", null);
		BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(localFile));
		byte[] data = new byte[BUF_SIZE];
		long size = 0;
		long maxSize = atts.getMaxFileSize();

		int count;
		while ((count = input.read(data, 0, BUF_SIZE)) != -1 && ((size += count) <= maxSize || maxSize == 0)) {
			output.write(data, 0, count);
		}

		if (size > atts.getMaxFileSize() && maxSize > 0) {
			input.close();
			output.close();
			localFile.delete();
			throw new WriteAbortedException("File exceeded size quota", null);
		}

		input.close();
		output.flush();
		output.close();

		TemporaryFile temp = new TemporaryFile();
		temp.setContentType(item.getContentType());
		if (item.getName().contains("\\"))
			temp.setName(FilenameUtils.getName(item.getName()));
		else
			temp.setName(item.getName());
		temp.setSize(size);
		temp.setTemporaryPath(localFile.getAbsolutePath());

		return temp;
	}

}
