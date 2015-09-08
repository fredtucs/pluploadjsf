/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.plupload.util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.plupload.model.TemporaryFile;

/**
 * Usefull methods for file transfering
 *
 * @author Tiago Peres França
 * @version 0.2
 */
public class FileTransferer {

	public static final String FILE_SEPARATOR = System.getProperty("file.separator");

	/**
	 * Transfer temporary files in a list to a definitive location, mantaining
	 * its original name (in case it doesn't exist already). If the file already
	 * exists a number will be writen before its extension. Example: If
	 * example.jpg already exists, example[1].jpg is created.
	 * 
	 * @param files
	 *            list of temporary files
	 * @param newPath
	 *            path to the definitive location of the temporary files
	 * @return list containing the definitive paths for each of the moved files
	 * 
	 * @author Tiago Peres França
	 * @version 0.2
	 */
	public static List<String> transferTemporaryFiles(List<TemporaryFile> files, String newPath) {
		List<String> paths = new ArrayList<String>();
		for (TemporaryFile file : files) {
			File tempFile = new File(file.getTemporaryPath());
			File newPathD = new File(newPath);
			if (!newPathD.exists()) {
				newPathD.mkdir();
			}
			if (tempFile.exists()) {
				String newFilePath = newPathD.getAbsolutePath() + FILE_SEPARATOR + file.getName();
				int alreadyExists = 0;
				try {
					while (!tempFile.renameTo(new File(newFilePath))) {
						alreadyExists++;
						StringBuilder pathBuilder = new StringBuilder();
						pathBuilder.append(newPath + FILE_SEPARATOR);
						pathBuilder.append(filename(file.getName()));
						pathBuilder.append("(");
						pathBuilder.append(alreadyExists);
						pathBuilder.append(")");
						pathBuilder.append("." + extractFileExtension(file.getName()));
						newFilePath = pathBuilder.toString();
					}
					paths.add(newFilePath);
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}
		}
		return paths;
	}

	private static String filename(String fullPath) {
		int dot = fullPath.lastIndexOf(".");
		int sep = fullPath.lastIndexOf(FILE_SEPARATOR);
		return fullPath.substring(sep + 1, dot);
	}

	private static String extractFileExtension(String fullPath) {
		int dotInd = fullPath.lastIndexOf('.');
		return (dotInd > 0 && dotInd < fullPath.length()) ? fullPath.substring(dotInd + 1) : null;
	}
}
