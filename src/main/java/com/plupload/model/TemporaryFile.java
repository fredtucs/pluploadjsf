/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.plupload.model;

import java.io.Serializable;

/**
 * Class representing the temporary files. An uploaded file goes to a temporary
 * folder before being permanently pesisted. The file's informations are stored
 * in an instance of this class.
 *
 * @author Tiago Peres França
 * @version 0.2
 */
public class TemporaryFile implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 2284927320699196653L;
	// name of the file, containing it's extension
	private String name;
	// absolute path to the temporary file
	private String temporaryPath;
	// MIME Content Type identified by the browser
	private String contentType;
	// file size in bytes
	private Long size;

	public TemporaryFile() {
	}

	/**
	 * @return the name of the file, containing it's extension
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name of the file, containing it's extension
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the absolute path to the temporary file
	 */
	public String getTemporaryPath() {
		return temporaryPath;
	}

	/**
	 * @param temporaryPath
	 *            absolute path to the temporary file
	 */
	public void setTemporaryPath(String temporaryPath) {
		this.temporaryPath = temporaryPath;
	}

	/**
	 * @return the MIME Content Type identified by the browser
	 */
	public String getContentType() {
		return contentType;
	}

	/**
	 * @param contentType
	 *            MIME Content Type identified by the browser
	 */
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	/**
	 * @return the file size in bytes
	 */
	public Long getSize() {
		return size;
	}

	/**
	 * @param size
	 *            file size in bytes
	 */
	public void setSize(Long size) {
		this.size = size;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		TemporaryFile other = (TemporaryFile) obj;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (size == null) {
			if (other.size != null)
				return false;
		} else if (!size.equals(other.size))
			return false;
		return true;
	}

}
