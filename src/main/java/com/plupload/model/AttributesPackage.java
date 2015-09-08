/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.plupload.model;

import java.io.Serializable;
import java.util.List;

/**
 * Class representing the package of attributes to be sent from the component
 * (com.plupload.component.SimpleQueueComponent) to the servlet
 * (com.plupload.servlet.PluploadServlet).
 *
 * @author Tiago Peres França
 * @version 0.2
 */
public class AttributesPackage implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 822387735750140038L;
	private List<TemporaryFile> files;
	private long maxFileSize;

	public AttributesPackage(List<TemporaryFile> files, long maxFileSize) {
		this.files = files;
		this.maxFileSize = maxFileSize;
	}

	/**
	 * @return the files
	 */
	public List<TemporaryFile> getFiles() {
		return files;
	}

	/**
	 * @param files
	 *            the files to set
	 */
	public void setFiles(List<TemporaryFile> files) {
		this.files = files;
	}

	/**
	 * @return the maxFileSize
	 */
	public long getMaxFileSize() {
		return maxFileSize;
	}

	/**
	 * @param maxFileSize
	 *            the maxFileSize to set
	 */
	public void setMaxFileSize(long maxFileSize) {
		this.maxFileSize = maxFileSize;
	}
}
