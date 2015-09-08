/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.plupload.component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

import javax.faces.application.Resource;
import javax.faces.application.ResourceDependencies;
import javax.faces.application.ResourceDependency;
import javax.faces.component.UIComponent;
import javax.faces.component.UIInput;
import javax.faces.component.UIViewRoot;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.plupload.model.AttributesPackage;
import com.plupload.model.TemporaryFile;

/**
 *
 * @author Fredy Tuco
 * @since 20/05/2014
 * @version 0.1
 */
@ResourceDependencies({
    @ResourceDependency(library = "plupload", name = "jquery/ui/jquery-ui.js"),
    @ResourceDependency(library = "plupload", name = "plupload.full.min.js"),
    @ResourceDependency(library = "plupload", name = "jquery.ui.plupload.css"),
    @ResourceDependency(library = "plupload", name = "jquery.ui.plupload.js"),})
public class SimpleQueueRenderer extends UIInput {

    private List<TemporaryFile> files;
    private long maxFileSize;
    private HttpSession session;
    private String clientId;

    /**
     * Builds the component
     *
     * @param context The FacesContext
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    @Override
    public void encodeBegin(FacesContext context) throws IOException {

        files = (ArrayList<TemporaryFile>) getAttributes().get("value");
        // maximum size per file (in bytes), 0 if there's no limit.
        String maxFileSizeStr = (String) getAttributes().get("maxFileSize");
        maxFileSize = (maxFileSizeStr != null) ? Long.parseLong(maxFileSizeStr) : 0;

        HttpServletRequest req = (HttpServletRequest) context.getExternalContext().getRequest();
        session = req.getSession(true);

        // render
        renderImports(context);
        renderScript(context);
        renderReplacebleCode(context);
    }

    /**
     * Render all the imports needed by the component. Called by "encodeBegin"
     * method.
     *
     * @param context The FacesContext
     * @throws IOException
     * @author Tiago Peres França
     * @version 0.2
     */
    private void renderImports(FacesContext context) throws IOException {

        // get language
        String lang = (String) getAttributes().get("language");
        Resource language = null;
        if (lang != null) {
            language = createResource(lang + ".js", "plupload/i18n");
        }

        // get writer
        ResponseWriter writer = context.getResponseWriter();

        if (!hasResourceJquery(context)) {
            writer.startElement("script", this);
            writer.writeAttribute("type", "text/javascript", null);
            writer.writeAttribute("src", createResource("jquery/jquery.js", "plupload"), null);
            writer.endElement("script");
        }

        // import language script
        if (language != null) {
            writer.startElement("script", this);
            writer.writeAttribute("type", "text/javascript", null);
            writer.writeAttribute("src", language.getRequestPath(), null);
            writer.endElement("script");
        }

    }

    public static boolean hasResourceJquery(FacesContext context) {

        UIViewRoot viewRoot = context.getViewRoot();
        ListIterator<UIComponent> iter = (viewRoot.getComponentResources(context, "head")).listIterator();
        while (iter.hasNext()) {
            UIComponent resource = (UIComponent) iter.next();
            String rname = (String) resource.getAttributes().get("name");
            if (rname.contains("jquery") && !rname.contains("ui")) {
                return true;
            }
        }

        return false;

    }

    /**
     * Render the javascript that will be used by the component. Called by
     * "encodeBegin".
     *
     * @param context The FacesContext
     * @throws IOException
     * @author Tiago Peres França
     * @version 0.2
     */
    private void renderScript(FacesContext context) throws IOException {
        // get attributes
        // path for the plupload's servlet.
        clientId = getClientId(context);

        String servletPath = (String) getAttributes().get("servletPath");
        // list of runtime preferences separated by comma.
        String runtimePreferences = (String) getAttributes().get("runtimePreferences");

        String autoStart = defaultValue(getAttributes().get("autoStart"));

        String multiSelection = defaultValue(getAttributes().get("multiSelection"));

        String multipleQueues = defaultValue(getAttributes().get("multipleQueues"));

        String preventDuplicates = defaultValue(getAttributes().get("preventDuplicates"));

        String showGlobalProgressBar = defaultValue(getAttributes().get("showGlobalProgressBar"));

        String showBtnAdd = defaultValue(getAttributes().get("showButtonAdd"));

        String showBtnStart = defaultValue(getAttributes().get("showButtonStart"));

        String showBtnStop = defaultValue(getAttributes().get("showButtonStop"));

        // width for image resizing. 0 if it's not relevent.
        String resizingWidthStr = (String) getAttributes().get("resizingWidth");
        int resizingWidth = (resizingWidthStr != null) ? Integer.parseInt(resizingWidthStr) : 0;
        // height for image resizing. 0 if it's not relevent.
        String resizingHeightStr = (String) getAttributes().get("resizingHeight");
        int resizingHeight = (resizingWidthStr != null) ? Integer.parseInt(resizingHeightStr) : 0;
        // quality for image resizing. 100 if it's not relevent.
        String resizingQualityStr = (String) getAttributes().get("resizingQuality");
        int resizingQuality = (resizingQualityStr != null) ? Integer.parseInt(resizingQualityStr) : 100;
        // list of allowed file extensions separated by comma.
        String allowedTypes = (String) getAttributes().get("allowedTypes");

        String buttonSubmit = (String) getAttributes().get("buttonSubmit");

        String buttonCancel = (String) getAttributes().get("buttonCancel");

        // treat default values for strings
        if (servletPath == null) {
            String contextPath = FacesContext.getCurrentInstance().getExternalContext().getRequestContextPath();
            servletPath = contextPath + "/plupload";
        }
        if (runtimePreferences == null) {
            runtimePreferences = "html5,silverlight,flash,html4";
        }
        if (allowedTypes == null) {
            allowedTypes = "";
        }

        // get writer
        ResponseWriter writer = context.getResponseWriter();

        // write script
        writer.startElement("script", this);
        writer.writeAttribute("type", "text/javascript", null);
        writer.write("$(function() {$(\"#" + getClienteId(clientId) + "\").plupload({runtimes : '");
        writer.write(runtimePreferences);
        writer.write("', url : '");
        writer.write(servletPath);
        writer.write("', multi_selection : ");
        writer.write(multiSelection);
        writer.write(", multiple_queues : ");
        writer.write(multipleQueues);
        writer.write(", prevent_duplicates : ");
        writer.write(preventDuplicates);
        writer.write(", autostart : ");
        writer.write(autoStart);
        writer.write(", global_progressbar : ");
        writer.write(String.valueOf(showGlobalProgressBar));
        writer.write(", ");

        if (maxFileSize > 0) {
            writer.write("max_file_size : '");
            writer.write(String.valueOf(maxFileSize));
            writer.write("', ");
        }
        writer.write("unique_names : false, ");
        if (resizingWidth > 0 || resizingHeight > 0 || resizingQuality < 100) {
            writer.write("resize : {");
            if (resizingWidth > 0) {
                writer.write("width : ");
                writer.write(String.valueOf(resizingWidth));
                writer.write(", ");
            }
            if (resizingHeight > 0) {
                writer.write("height : ");
                writer.write(String.valueOf(resizingHeight));
                writer.write(", ");
            }
            writer.write("quality : ");
            writer.write(String.valueOf(resizingQuality));
            writer.write("}, ");
        }

        if (showBtnAdd.contains("true") || showBtnStart.contains("true") || showBtnStop.contains("true")) {
            writer.write("buttons : {");
            writer.write("browse : ");
            writer.write(showBtnAdd);
            writer.write(", ");
            writer.write("start : ");
            writer.write(showBtnStart);
            writer.write(", ");
            writer.write("stop : ");
            writer.write(showBtnStop);
            writer.write("}, ");
        }

        if (!allowedTypes.equals("")) {
            writer.write("filters : [{title : \"Allowed files\", extensions : \"");
            writer.write(allowedTypes);
            writer.write("\"}], ");

        }
        Resource flash = createResource("Moxie.swf", "plupload");
        Resource silverlight = createResource("Moxie.xap", "plupload");
        writer.write("flash_swf_url : '");
        writer.write(flash.getRequestPath());
        writer.write("', silverlight_xap_url : '");
        writer.write(silverlight.getRequestPath());
        writer.write("',");
        // Handle the case when form was submitted before uploading has
        // finished
        writer.write("init : {");
        // Files in queue upload them first
        if (buttonSubmit != null) {
            writer.write("StateChanged: function(up) {");
            writer.write("if(up.state == plupload.STARTED){");
            writer.write("$(\"[id$='" + buttonSubmit + "']\").attr('disabled','disabled').addClass('ui-state-disabled');");
            writer.write("}else{");
            writer.write("$(\"[id$='" + buttonSubmit + "']\").removeAttr('disabled').removeClass('ui-state-disabled');");
            writer.write("}},");
            writer.write("UploadComplete: function(up, files) {");
            writer.write("$(\"[id$='" + buttonSubmit + "']\").removeAttr('disabled').removeClass('ui-state-disabled');");
            writer.write("},");
        }
        writer.write("FileUploaded: function(up, file, response) {");
        writer.write("if(response.response != undefined ){");
        writer.write("var response = jQuery.parseJSON(response.response);");
        writer.write("if (response.error != undefined && response.error.code){");
        writer.write("$('#' + file.id).removeClass('ui-state-default').addClass('ui-state-error').find('.ui-icon').attr('class', 'ui-icon ui-icon-alert').attr('title', response.error.message);");
        writer.write("file.status = plupload.FAILED;  up.stop();");
        writer.write("}}}");
        writer.write("}");
        writer.write("});");

        if (buttonCancel != null) {
            writer.write("$(\"[id$='" + buttonCancel + "']\").click(function() {");
            writer.write("jQuery.ajax({type: \"POST\", url: '" + servletPath + "', data: {action: 'removeAll'}});");
            writer.write("});");
        }

        writer.write("});");

        writer.endElement("script");
    }

    private String defaultValue(Object str) {
        if (str == null) {
            return Boolean.TRUE.toString();
        }
        return str.toString();
    }

    /**
     * Render the div that will be replaced by the execution of the javascript
     * code rendered in "renderScript". Called by "encodeBegin".
     *
     * @param context The FacesContext
     * @throws IOException
     * @author Tiago Peres França
     * @version 0.2
     */
    private void renderReplacebleCode(FacesContext context) throws IOException {
        // get attributes
        // Message for loading error
        String loadingErrorMsg = (String) getAttributes().get("loadingErrorMsg");
        if (loadingErrorMsg == null) {
            loadingErrorMsg = "Your browser doesn't have Flash, Silverlight, Gears, BrowserPlus or HTML5 support.";
        }

        // get writer
        ResponseWriter writer = context.getResponseWriter();

        // render replaceble div
        writer.startElement("div", this);
        writer.writeAttribute("id", getClienteId(clientId), null);
        if (!loadingErrorMsg.isEmpty()) {
            writer.startElement("p", this);
            writer.write(loadingErrorMsg);
            writer.endElement("p");
        }
        writer.endElement("div");
    }

    private String getClienteId(String idCliente) {
        return idCliente.replace(":", "_");
    }

    /**
     * It's the final part of rendering proccess. The variables to communicate
     * the FacesContext with the Plupload's servlet are declared here.
     *
     * Strategy: declare an object of type "AttributesPackage" in session, this
     * object holds all information that is needed to threat any request comming
     * from the component.
     *
     * Problem: for some reason Faces Context's session doesn't seem to be
     * accessible from Plupload's servlet. In Plupload's servlet
     * "request.getSession(false)" aways returns null. Actually there's one
     * awkward exception to this problem: it works fine in Internet Explorer, if
     * the client is using IE, "request.getSession(false)" (in the servlet)
     * returns the correct session.
     *
     * Alternative: For now, the "AttributesPackage" is being recorded in
     * session and in the application scope. The servlet tries to retrive it
     * from session, if sesssion is not accessible, it retrives the attributes
     * from the application scope. The problem with this aproach is obvious: if
     * more than one person executes the component at the same time it will go
     * terribly wrong.
     *
     * @param context The FacesContext
     * @author Tiago Peres França
     * @version 0.2
     */
    @Override
    public void encodeEnd(FacesContext context) {

        AttributesPackage atts = new AttributesPackage(files, maxFileSize);
        session.setAttribute("plupload_attributes", atts);
        // record attributes in application
        context.getExternalContext().getApplicationMap().put("plupload_attributes", atts);

    }

    private Resource createResource(String resourceName, String libraryOrContractName) {
        return FacesContext.getCurrentInstance().getApplication().getResourceHandler().createResource(resourceName, libraryOrContractName);
    }

    /**
     * Retrieves the component's family
     *
     * @return the component's family.
     * @author Tiago Peres França
     * @version 0.2
     */
    @Override
    public String getFamily() {
        return "plupload";
    }

}
