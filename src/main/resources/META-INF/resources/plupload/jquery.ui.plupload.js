/**
 * jquery.ui.plupload.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.button.js
 *	jquery.ui.progressbar.js
 *	
 * Optionally:
 *	jquery.ui.sortable.js
 */

 /* global jQuery:true */

/**
jQuery UI based implementation of the Plupload API - multi-runtime file uploading API.

To use the widget you must include _jQuery_ and _jQuery UI_ bundle (including `ui.core`, `ui.widget`, `ui.button`, 
`ui.progressbar` and `ui.sortable`).

In general the widget is designed the way that you do not usually need to do anything to it after you instantiate it. 
But! You still can intervenue, to some extent, in case you need to. Although, due to the fact that widget is based on 
_jQuery UI_ widget factory, there are some specifics. See examples below for more details.

@example
	<!-- Instantiating: -->
	<div id="uploader">
		<p>Your browser doesn't have Flash, Silverlight or HTML5 support.</p>
	</div>

	<script>
		$('#uploader').plupload({
			url : '../upload.php',
			filters : [
				{title : "Image files", extensions : "jpg,gif,png"}
			],
			rename: true,
			sortable: true,
			flash_swf_url : '../../js/Moxie.swf',
			silverlight_xap_url : '../../js/Moxie.xap',
		});
	</script>

@example
	// Invoking methods:
	$('#uploader').plupload(options);

	// Display welcome message in the notification area
	$('#uploader').plupload('notify', 'info', "This might be obvious, but you need to click 'Add Files' to add some files.");

@example
	// Subscribing to the events...
	// ... on initialization:
	$('#uploader').plupload({ 
		...
		viewchanged: function(event, args) {
			// stuff ...
		}
	});
	// ... or after initialization
	$('#uploader').on("viewchanged", function(event, args) {
		// stuff ...
	});

@class UI.Plupload
@constructor
@param {Object} settings For detailed information about each option check documentation.
	@param {String} settings.url URL of the server-side upload handler.
	@param {Number|String} [settings.chunk_size=0] Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. `e.g. 204800 or "204800b" or "200kb"`. By default - disabled.
	@param {String} [settings.file_data_name="file"] Name for the file field in Multipart formated message.
	@param {Array} [settings.filters=[]] Set of file type filters, each one defined by hash of title and extensions. `e.g. {title : "Image files", extensions : "jpg,jpeg,gif,png"}`. Dispatches `plupload.FILE_EXTENSION_ERROR`
	@param {String} [settings.flash_swf_url] URL of the Flash swf.
	@param {Object} [settings.headers] Custom headers to send with the upload. Hash of name/value pairs.
	@param {Number|String} [settings.max_file_size] Maximum file size that the user can pick, in bytes. Optionally supports b, kb, mb, gb, tb suffixes. `e.g. "10mb" or "1gb"`. By default - not set. Dispatches `plupload.FILE_SIZE_ERROR`.
	@param {Number} [settings.max_retries=0] How many times to retry the chunk or file, before triggering Error event.
	@param {Boolean} [settings.multipart=true] Whether to send file and additional parameters as Multipart formated message.
	@param {Object} [settings.multipart_params] Hash of key/value pairs to send with every file upload.
	@param {Boolean} [settings.multi_selection=true] Enable ability to select multiple files at once in file dialog.
	@param {Boolean} [settings.prevent_duplicates=false] Do not let duplicates into the queue. Dispatches `plupload.FILE_DUPLICATE_ERROR`.
	@param {String|Object} [settings.required_features] Either comma-separated list or hash of required features that chosen runtime should absolutely possess.
	@param {Object} [settings.resize] Enable resizng of images on client-side. Applies to `image/jpeg` and `image/png` only. `e.g. {width : 200, height : 200, quality : 90, crop: true}`
		@param {Number} [settings.resize.width] If image is bigger, it will be resized.
		@param {Number} [settings.resize.height] If image is bigger, it will be resized.
		@param {Number} [settings.resize.quality=90] Compression quality for jpegs (1-100).
		@param {Boolean} [settings.resize.crop=false] Whether to crop images to exact dimensions. By default they will be resized proportionally.
	@param {String} [settings.runtimes="html5,flash,silverlight,html4"] Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails.
	@param {String} [settings.silverlight_xap_url] URL of the Silverlight xap.
	@param {Boolean} [settings.unique_names=false] If true will generate unique filenames for uploaded files.

	@param {Boolean} [settings.autostart=false] Whether to auto start uploading right after file selection.
	@param {Boolean} [settings.dragdrop=true] Enable ability to add file to the queue by drag'n'dropping them from the desktop.
	@param {Boolean} [settings.rename=false] Enable ability to rename files in the queue.
	@param {Boolean} [settings.sortable=false] Enable ability to sort files in the queue, changing their uploading priority.
	@param {Object} [settings.buttons] Control the visibility of functional buttons. 
		@param {Boolean} [settings.buttons.browse=true] Display browse button.
		@param {Boolean} [settings.buttons.start=true] Display start button.
		@param {Boolean} [settings.buttons.stop=true] Display stop button. 
	@param {Object} [settings.views] Control various views of the file queue.
		@param {Boolean} [settings.views.list=true] Enable list view.
		@param {Boolean} [settings.views.thumbs=false] Enable thumbs view.
		@param {String} [settings.views.default='list'] Default view.
		@param {Boolean} [settings.views.remember=true] Whether to remember the current view (requires jQuery Cookie plugin).
	@param {Boolean} [settings.multiple_queues=true] Re-activate the widget after each upload procedure.
	@param {Number} [settings.max_file_count=0] Limit the number of files user is able to upload in one go, autosets _multiple_queues_ to _false_ (default is 0 - no limit).
*/
(function(window, document, plupload, $) {

/**
Dispatched when the widget is initialized and ready.

@event ready
@param {plupload.Uploader} uploader Uploader instance sending the event.
*/

/**
Dispatched when file dialog is closed.

@event selected
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {Array} files Array of selected files represented by plupload.File objects
*/

/**
Dispatched when file dialog is closed.

@event removed
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {Array} files Array of removed files represented by plupload.File objects
*/

/**
Dispatched when upload is started.

@event start
@param {plupload.Uploader} uploader Uploader instance sending the event.
*/

/**
Dispatched when upload is stopped.

@event stop
@param {plupload.Uploader} uploader Uploader instance sending the event.
*/

/**
Dispatched during the upload process.

@event progress
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {plupload.File} file File that is being uploaded (includes loaded and percent properties among others).
	@param {Number} size Total file size in bytes.
	@param {Number} loaded Number of bytes uploaded of the files total size.
	@param {Number} percent Number of percentage uploaded of the file.
*/

/**
Dispatched when file is uploaded.

@event uploaded
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {plupload.File} file File that was uploaded.
	@param {Enum} status Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.
*/

/**
Dispatched when upload of the whole queue is complete.

@event complete
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {Array} files Array of uploaded files represented by plupload.File objects
*/

/**
Dispatched when the view is changed, e.g. from `list` to `thumbs` or vice versa.

@event viewchanged
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {String} type Current view type.
*/

/**
Dispatched when error of some kind is detected.

@event error
@param {plupload.Uploader} uploader Uploader instance sending the event.
@param {String} error Error message.
@param {plupload.File} file File that was uploaded.
	@param {Enum} status Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.
*/

var uploaders = {};	
	
function _(str) {
	return plupload.translate(str) || str;
}

function renderUI(obj) {		
	obj.id = obj.attr('id');

	obj.html(
		'<div class="plupload_wrapper">' +
			'<div class="plupload_container">' +
				'<div class="plupload_header"> <!-- Visible -->' +
                                    '<div class="plupload_buttons">' +
                                        '<button class="plupload_button plupload_add">' + _('Add Files') + '</button>&nbsp;' +
                                        '<button class="plupload_button plupload_start">' + _('Start Upload') + '</button>&nbsp;' +
                                        '<button class="plupload_button plupload_stop plupload_hidden">'+_('Stop Upload') + '</button>&nbsp;' +                                        
                                    '</div>' +                                                                
                                    '<div style="clear: both"></div>' + 
                                '</div>' +
				'<div class="ui-widget-content plupload_hidden plupload_content">' +					
					'<ul class="plupload_filelist_content"> </ul>' +
					'<div class="plupload_clearer">&nbsp;</div>' +
				'</div>' +                                                              
				'<div class="plupload_started plupload_hidden ui-widget-header"><!--  Hidden -->' +							
						'<table>' +
						'<tr>' +
							'<td class="plupload_progress">' +
								'<div class="plupload_progress_container"></div>' +					
							'</td>' +
							'<td class="plupload_file_status"><span class="plupload_total_status">0%</span></td>' +
							'<td > | </td>' +
							'<td ><div class="plupload_cell plupload_upload_status"></div></td>' +							
							'<td ><div class="plupload_clearer">&nbsp;</div></td>' +							
						'</tr>' +
						'</table>' +						
				'</div>' +                                 
			'</div>' +
			'<input class="plupload_count" value="0" type="hidden">' +
		'</div>'
	);
}


$.widget("ui.plupload", {

	widgetEventPrefix: '',

	imgs: {},
	
	contents_bak: '',
		
	options: {
		browse_button_hover: 'ui-state-hover',
		browse_button_active: 'ui-state-active',
		
		// widget specific
		dragdrop : true, 
		multiple_queues: false, // re-use widget by default		
		buttons: {
			browse: true,
			start: true,
			stop: true	
		},
		views: {
			list: true,
			thumbs: false,
			active: 'list',
			remember: true // requires: https://github.com/carhartl/jquery-cookie, otherwise disabled even if set to true
		},
		autostart: false,
		sortable: false,
		rename: false,
		global_progressbar: true,
		max_file_count: 0 // unlimited                
	},
	
	FILE_COUNT_ERROR: -9001,
	
	_create: function() {
		var id = this.element.attr('id');
		if (!id) {
			id = plupload.guid();
			this.element.attr('id', id);
		}
		this.id = id;
				
		// backup the elements initial state
		this.contents_bak = this.element.html();
		renderUI(this.element);
		
		// container, just in case
		this.container = $('.plupload_container', this.element).attr('id', id + '_container');	

		this.content = $('.plupload_content', this.element);
		
//		if ($.fn.resizable) {
//			this.container.resizable({ 
//				handles: 's',
//				minHeight: 100
//			});
//		}
		
		// list of files, may become sortable
		this.filelist = $('.plupload_filelist_content', this.container)
			.attr({
				id: id + '_filelist',
				unselectable: 'on'
			});
		

		// buttons
		this.browse_button = $('.plupload_add', this.container).attr('id', id + '_browse');
		this.start_button = $('.plupload_start', this.container).attr('id', id + '_start');
		this.stop_button = $('.plupload_stop', this.container).attr('id', id + '_stop');
		/*this.thumbs_switcher = $('#' + id + '_view_thumbs');
		this.list_switcher = $('#' + id + '_view_list');*/
		
		if ($.ui.button) {
			this.browse_button.button({				
				icons: { primary: 'ui-icon-circle-plus' },
				disabled: true
			}).removeClass('ui-button-text-icon-primary').addClass('ui-button-text-icon-left')
			.find('.ui-icon').removeClass('ui-button-icon-primary').addClass('ui-button-icon-left');
			
			this.start_button.button({				
				icons: { primary: 'ui-icon-circle-arrow-e' },
				disabled: true
			}).removeClass('ui-button-text-icon-primary').addClass('ui-button-text-icon-left')
			.find('.ui-icon').removeClass('ui-button-icon-primary').addClass('ui-button-icon-left');
			
			this.stop_button.button({	
				text: false,			
				icons: { primary: 'ui-icon-circle-close' }
			});
      
			/*this.list_switcher.button({
				text: false,
				icons: { secondary: "ui-icon-grip-dotted-horizontal" }
			});

			this.thumbs_switcher.button({
				text: false,
				icons: { secondary: "ui-icon-image" }
			});*/
		}
		
		// progressbar
		this.progressbar = $('.plupload_progress_container', this.container);		
		
		if ($.ui.progressbar && this.progressbar) {
			this.progressbar.progressbar();
		}
		
		// counter
		this.counter = $('.plupload_count', this.element)
			.attr({
				id: id + '_count',
				name: id + '_count'
			});
					
		// initialize uploader instance
		this._initUploader();
	},

	_initUploader: function() {
		var self = this
		, id = this.id
		, uploader
		, options = { 
			container: id + '_buttons',
			browse_button: id + '_browse'
		}
		;

		$('.plupload_buttons', this.element).attr('id', id + '_buttons');

		if (self.options.dragdrop) {
			this.filelist.parent().attr('id', this.id + '_dropbox');
			options.drop_element = this.id + '_dropbox';
		}

		if (self.options.views.thumbs) {
			if (o.typeOf(self.options.required_features) === 'string') {
				self.options.required_features += ",display_media";
			} else {
				self.options.required_features = "display_media";
			}
		}

		uploader = this.uploader = uploaders[id] = new plupload.Uploader($.extend(this.options, options));

		uploader.bind('Error', function(up, err) {			
			var message, details = "";

			message = '<strong>' + err.message + '</strong>';
				
			switch (err.code) {
				case plupload.FILE_EXTENSION_ERROR:
					details = o.sprintf(_("File: %s"), err.file.name);
					break;
				
				case plupload.FILE_SIZE_ERROR:
					details = o.sprintf(_("File: %f, size: %s, max file size: %m"), err.file.name, err.file.size, plupload.parseSize(self.options.max_file_size));
					break;

				case plupload.FILE_DUPLICATE_ERROR:
					details = o.sprintf(_("%s already present in the queue."), err.file.name);
					break;
					
				case self.FILE_COUNT_ERROR:
					details = o.sprintf(_("Upload element accepts only %d file(s) at a time. Extra files were stripped."), self.options.max_file_count);
					break;
				
				case plupload.IMAGE_FORMAT_ERROR :
					details = _("Image format either wrong or not supported.");
					break;	
				
				case plupload.IMAGE_MEMORY_ERROR :
					details = _("Runtime ran out of available memory.");
					break;
				
				/* // This needs a review
				case plupload.IMAGE_DIMENSIONS_ERROR :
					details = o.sprintf(_('Resoultion out of boundaries! <b>%s</b> runtime supports images only up to %wx%hpx.'), up.runtime, up.features.maxWidth, up.features.maxHeight);
					break;	*/
											
				case plupload.HTTP_ERROR:
					details = _("Upload URL might be wrong or doesn't exist.");
					break;
			}

			message += " <br /><i>" + details + "</i>";

			self._trigger('error', null, { up: up, error: err } );

			// do not show UI if no runtime can be initialized
			if (err.code === plupload.INIT_ERROR) {
				setTimeout(function() {
					self.destroy();
				}, 1);
			} else {
				self.notify('error', message);
			}
		});

		
		uploader.bind('PostInit', function(up) {	
			// all buttons are optional, so they can be disabled and hidden
			if (!self.options.buttons.browse) {
				self.browse_button.button('disable').hide();
				up.disableBrowse(true);
			} else {
				self.browse_button.button('enable');
			}
			
			if (!self.options.buttons.start) {
				self.start_button.button('disable').hide();
			} 
			
			if (!self.options.buttons.stop) {
				self.stop_button.button('disable').hide();
			}
				
			if (!self.options.unique_names && self.options.rename) {
				self._enableRenaming();	
			}

			if (self.options.dragdrop && up.features.dragdrop) {
				self.filelist.parent().addClass('plupload_dropbox');
			}

			self._enableViewSwitcher();
			
			self.start_button.click(function(e) {
				if (!$(this).button('option', 'disabled')) {
					self.start();
				}
				e.preventDefault();
			});

			self.stop_button.click(function(e) {
				self.stop();
				e.preventDefault();
			});

			self._trigger('ready', null, { up: up });
		});
		
		
		// check if file count doesn't exceed the limit
		if (self.options.max_file_count) {
			self.options.multiple_queues = false; // one go only

			uploader.bind('FilesAdded', function(up, selectedFiles) {
				var selectedCount = selectedFiles.length
				, extraCount = up.files.length + selectedCount - self.options.max_file_count
				;
				
				if (extraCount > 0) {
					selectedFiles.splice(selectedCount - extraCount, extraCount);
					
					up.trigger('Error', {
						code : self.FILE_COUNT_ERROR,
						message : _('File count error.')
					});
				}
			});
		}
		
		// uploader internal events must run first 
		uploader.init();

		uploader.bind('FilesAdded', function(up, files) {                    
			self._addFiles(files);
			self._trigger('selected', null, {up: up, files: files});

			if (self.options.autostart) {
				// set a little delay to make sure that QueueChanged triggered by the core has time to complete
				setTimeout(function() {
					self.start();
				}, 10);
			}
		});

		uploader.bind('FilesRemoved', function(up, files) {
			self._trigger('removed', null, { up: up, files: files } );
		});              


		uploader.bind('QueueChanged', function() {
			self._handleState();
			self._updateTotalProgress();
		});

		uploader.bind('StateChanged', function() {
			self._handleState();
		});

		uploader.bind('UploadFile', function(up, file) {
			self._handleFileStatus(file);
		});

		uploader.bind('FileUploaded', function(up, file) {
			self._handleFileStatus(file);
			self._trigger('uploaded', null, { up: up, file: file } );
		});

		uploader.bind('UploadProgress', function(up, file) {
			self._handleFileStatus(file);
			self._updateTotalProgress();
			self._trigger('progress', null, { up: up, file: file } );
		});

		uploader.bind('UploadComplete', function(up, files) {
			self._addFormFields();		
			self._trigger('complete', null, { up: up, files: files } );
		});
	},

	
	_setOption: function(key, value) {
		var self = this;

		if (key == 'buttons' && typeof(value) == 'object') {	
			value = $.extend(self.options.buttons, value);
			
			if (!value.browse) {
				self.browse_button.button('disable').hide();
				self.uploader.disableBrowse(true);
			} else {
				self.browse_button.button('enable').show();
				self.uploader.disableBrowse(false);
			}
			
			if (!value.start) {
				self.start_button.button('disable').hide();
			} else {
				self.start_button.button('enable').show();
			}
			
			if (!value.stop) {
				self.stop_button.button('disable').hide();
			} else {
				self.start_button.button('enable').show();	
			}
		}
		
		self.uploader.settings[key] = value;	
	},

	
	/**
	Start upload. Triggers `start` event.

	@method start
	*/
	start: function() {
		this.uploader.start();
		this._trigger('start', null, { up: this.uploader });
	},

	
	/**
	Stop upload. Triggers `stop` event.

	@method stop
	*/
	stop: function() {
		this.uploader.stop();
		this._trigger('stop', null, { up: this.uploader });
	},


	/**
	Enable browse button.

	@method enable
	*/
	enable: function() {
		this.browse_button.button('enable');
		this.uploader.disableBrowse(false);
	},


	/**
	Disable browse button.

	@method disable
	*/
	disable: function() {
		this.browse_button.button('disable');
		this.uploader.disableBrowse(true);
	},

	
	/**
	Retrieve file by it's unique id.

	@method getFile
	@param {String} id Unique id of the file
	@return {plupload.File}
	*/
	getFile: function(id) {
		var file;
		
		if (typeof id === 'number') {
			file = this.uploader.files[id];	
		} else {
			file = this.uploader.getFile(id);	
		}
		return file;
	},

	/**
	Return array of files currently in the queue.
	
	@method getFiles
	@return {Array} Array of files in the queue represented by plupload.File objects
	*/
	getFiles: function() {
		return this.uploader.files;
	},

	
	/**
	Remove the file from the queue.

	@method removeFile
	@param {plupload.File|String} file File to remove, might be specified directly or by it's unique id
	*/
	removeFile: function(file) {
		if (plupload.typeOf(file) === 'string') {
			file = this.getFile(file);
		}
		this._removeFiles(file);
	},

	
	/**
	Clear the file queue.

	@method clearQueue
	*/
	clearQueue: function() {
		this.uploader.splice();
	},


	/**
	Retrieve internal plupload.Uploader object (usually not required).

	@method getUploader
	@return {plupload.Uploader}
	*/
	getUploader: function() {
		return this.uploader;
	},


	/**
	Trigger refresh procedure, specifically browse_button re-measure and re-position operations.
	Might get handy, when UI Widget is placed within the popup, that is constantly hidden and shown
	again - without calling this method after each show operation, dialog trigger might get displaced
	and disfunctional.

	@method refresh
	*/
	refresh: function() {
		this.uploader.refresh();
	},


	/**
	Display a message in notification area.

	@method notify
	@param {Enum} type Type of the message, either `error` or `info`
	@param {String} message The text message to display.
	*/
	notify: function(type, message) {
		var popup = $(
			'<div class="plupload_message">' + 
				'<span class="plupload_message_close ui-icon ui-icon-circle-close" title="'+_('Close')+'"></span>' +
				'<p><span class="ui-icon"></span>' + message + '</p>' +
			'</div>'
		);
					
		popup.addClass('ui-state-' + (type === 'error' ? 'error' : 'highlight'))
			.find('p .ui-icon')
				.addClass('ui-icon-' + (type === 'error' ? 'alert' : 'info'))
				.end()
			.find('.plupload_message_close')
				.click(function() {
					popup.remove();	
				})
				.end();
		
		$('.plupload_header', this.container).append(popup);
	},

	
	/**
	Destroy the widget, the uploader, free associated resources and bring back original html.

	@method destroy
	*/
	destroy: function() {
		this._removeFiles([].slice.call(this.uploader.files));
		
		// destroy uploader instance
		this.uploader.destroy();

		// unbind all button events
		$('.plupload_button', this.element).unbind();
		
		// destroy buttons
		if ($.ui.button) {
			$('.plupload_add, .plupload_start, .plupload_stop', this.container).button('destroy');
		}
		
		// destroy progressbar
		if ($.ui.progressbar) {
			this.progressbar.progressbar('destroy');	
		}
		
		// destroy sortable behavior
		if ($.ui.sortable && this.options.sortable) {
			$('tbody', this.filelist).sortable('destroy');
		}
		
		// restore the elements initial state
		this.element.empty().html(this.contents_bak);
		this.contents_bak = '';

		$.Widget.prototype.destroy.apply(this);
	},
	
	
	_handleState: function() {
		var up = this.uploader;
						
		if (up.state === plupload.STARTED) {
			$(this.start_button).button('disable');

			if(this.options.global_progressbar){
				$([]).add(this.stop_button)
					.add('.plupload_started')
					.removeClass('plupload_hidden');
				$('.plupload_upload_status', this.element).html(o.sprintf(_('Uploaded %d/%d files'), up.total.uploaded, up.files.length));
			}else{
				$([]).add(this.stop_button);	
			}
						
			$('.plupload_header_content', this.element).addClass('plupload_header_content_bw');
		} else if (up.state === plupload.STOPPED) {
			if(this.options.global_progressbar){
				$([]).add(this.stop_button)
					.add('.plupload_started')
					.addClass('plupload_hidden');
			}else{
				$([]).add(this.stop_button);
			}

			if (this.options.multiple_queues) {
				$('.plupload_header_content', this.element).removeClass('plupload_header_content_bw');
			} else {
				if(up.files.length){
					$([]).add(this.browse_button).add(this.start_button).button('disable');
					up.disableBrowse(true);	
				}else{
					$([]).add(this.browse_button).add(this.start_button).button('enable');
					up.disableBrowse(false);
				}				
			}

			if (up.files.length === (up.total.uploaded + up.total.failed)) {
				this.start_button.button('disable');
			} else {
				this.start_button.button('enable');
			}

			this._updateTotalProgress();
		}

		if (up.total.queued === 0) {
			this.browse_button.button({ label: _('Add Files') });
		} else {
			if(!$('.plupload_content', this.element).is(":visible")){
				$('.plupload_content', this.element).removeClass('plupload_hidden');
			}
			this.browse_button.button({ label: o.sprintf(_('%d files queued'), up.total.queued) });			
		}

		up.refresh();
	},
	
	
	_handleFileStatus: function(file) {
		var self = this, actionClass, iconClass;
		
		// since this method might be called asynchronously, file row might not yet be rendered
		if (!$('#' + file.id).length) {
			return;	
		}

		switch (file.status) {
		case plupload.DONE: 
			actionClass = 'plupload_done';
			iconClass = 'ui-icon ui-icon-circle-check';
			break;

		case plupload.FAILED:
			actionClass = 'ui-state-error plupload_failed';
			iconClass = 'ui-icon ui-icon-alert';
			break;

		case plupload.QUEUED:
			actionClass = 'plupload_delete';
			iconClass = 'ui-icon ui-icon-circle-minus';
			break;

		case plupload.UPLOADING:
			actionClass = 'ui-state-highlight plupload_uploading';
			iconClass = 'ui-icon ui-icon-circle-arrow-n';

			// scroll uploading file into the view if its bottom boundary is out of it
			var scroller = $('.plupload_scroll', this.container)
			, scrollTop = scroller.scrollTop()
			, scrollerHeight = scroller.height()
			, rowOffset = $('#' + file.id).position().top + $('#' + file.id).height()
			;

			if (scrollerHeight < rowOffset) {
				scroller.scrollTop(scrollTop + rowOffset - scrollerHeight);
			}
			// Set file specific progress
			$('#' + file.id)
				.find('.plupload_file_percent')
					.html(file.percent + '%')
					.end()
				.find('.plupload_file_progress')                                            
					.removeClass("plupload_hidden")
					.end()
				.find('.plupload_file_progress_bar')
					.prop('title', file.percent + '%')
					.css('width', file.percent + '%')
					.end()
				.find('.plupload_file_size')
					.html("(" + plupload.formatSize(file.size) + ")");
			break;
		}
		actionClass += ' ui-state-default plupload_file';

		$('#' + file.id)
			.attr('class', actionClass)
			.find('.ui-icon')
				.attr('class', iconClass)
				.end()
			.filter('.plupload_delete, .plupload_done, .plupload_failed')
				.find('.ui-icon')
					.click(function(e) {
						self._removeFiles(file);
						e.preventDefault();
					});
	},
	
	
	_updateTotalProgress: function() {
            var up = this.uploader;

            // Scroll to end of file list
            this.filelist[0].scrollTop = this.filelist[0].scrollHeight;
            if (this.progressbar) {
                this.progressbar.progressbar('value', up.total.percent);
            }            
            this.element
                    .find('.plupload_total_status')
                        .html(up.total.percent + '%')
                        .end()
                    .find('.plupload_total_file_size')
                        .html(plupload.formatSize(up.total.size))
                        .end()
                    .find('.plupload_upload_status')
                        .html(o.sprintf(_('Uploaded %d/%d files'), up.total.uploaded, up.files.length));
        },


	_addFiles: function(files) {
		var self = this, file_html, queue = [];
                
                file_html = '<li class="plupload_file ui-state-default" id="%id%">' +                        
                        '<div class="plupload_file_thumb"/>' +
                        '<div class="plupload_file_name" title="%name%"><span class="plupload_file_namespan">%name%</span> <span class="plupload_file_size">(%size%)</span> </div>' +
                        '<div class="uploadInfo">' +
                        '<div class="plupload_file_action"><div class="ui-icon"/></div>' +
                        '<div class="plupload_file_progress plupload_hidden">' +
                        '<div class="plupload_file_progress_container"><div class="plupload_file_progress_bar ui-widget-header"/></div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="plupload_file_fields"> </div>' +
                        '</li>';

		if (plupload.typeOf(files) !== 'array') {
			files = [files];
		}

		// destroy sortable if enabled
		if ($.ui.sortable && this.options.sortable) {
			$('tbody', self.filelist).sortable('destroy');	
		}

		// loop over files to add
		$.each(files, function(i, file) {

			self.filelist.append(file_html.replace(/%(\w+)%/g, function($0, $1) {
				if ('size' === $1) {
					return plupload.formatSize(file.size);
				} else if('name' === $1) {
					return self._truncate(file.name, 15);
				} else {
					return file[$1] || '';
				}
			}));

			if (self.options.views.thumbs) {
				queue.push(function(cb) {
					var img = new o.Image();

					img.onload = function() {
						this.embed($('#' + file.id + ' .plupload_file_thumb', self.filelist)[0], { 
							width: 100, 
							height: 60, 
							crop: true,
							swf_url: mOxie.resolveUrl(self.options.flash_swf_url),
							xap_url: mOxie.resolveUrl(self.options.silverlight_xap_url)
						});
					};

					img.onembedded = function() {
						$('#' + file.id + ' .plupload_file_thumb', self.filelist).addClass('plupload_file_thumb_loaded');
						this.destroy();
						setTimeout(cb, 1); // detach, otherwise ui might hang (in SilverLight for example)
					};

					img.onerror = function() {
						var ext = file.name.match(/\.([^\.]{1,7})$/);
						$('#' + file.id + ' .plupload_file_thumb', self.filelist)
							.html('<div class="plupload_file_dummy ui-widget-content"><span class="ui-state-disabled">' + (ext ? ext[1] : 'none') + '</span></div>');
						this.destroy();
						setTimeout(cb, 1);
					};
					img.load(file.getSource());
				});
			}

			self._handleFileStatus(file);
		});

		if (queue.length) {
			o.inSeries(queue);
		}

		// re-enable sortable
		if (this.options.sortable && $.ui.sortable) {
			this._enableSortingList();	
		}

		this._trigger('updatelist', null, { filelist: this.filelist });
	},


	_truncate: function(n, len) {
	    var ext = n.substring(n.lastIndexOf(".") + 1, n.length).toLowerCase();
	    var filename = n.replace('.' + ext,'');
	    if(filename.length <= len) {
	        return n;
	    }
	    filename = filename.substr(0, len) + (n.length > len ? '[...]' : '');
	    return filename + '.' + ext;
	},
	
	_removeFiles: function(files) {
		var self = this, up = this.uploader;

		if (plupload.typeOf(files) !== 'array') {
			files = [files];
		}

		// destroy sortable if enabled
		if ($.ui.sortable && this.options.sortable) {
			$('tbody', self.filelist).sortable('destroy');	
		}

		$.each(files, function(i, file) {
			if (file.imgs && file.imgs.length) {
				$.each(file.imgs, function(ii, img) {
					img.destroy();
				});
				file.imgs = [];
			}
			$.ajax({
				type: "POST",
				url: self.options.url,
				data: { action: "remove", name: file.name, size: file.size}
			})
			.done(function( msg ) {
				$('#' + file.id).remove();
				up.removeFile(file);					
			})
			.fail(function() {
				up.trigger('Error', {
					code : self.IO_ERROR,
					message : _('Error delete file server.')
				});
			});
			
			
		});
		if (up.files.length) {
			// re-initialize sortable
			if (this.options.sortable && $.ui.sortable) {
				this._enableSortingList();
			}
		} else {			
			$('.plupload_content', this.element).addClass('plupload_hidden');
		}

		this._trigger('updatelist', null, { filelist: this.filelist });
	},


	_addFormFields: function() {
		var self = this;

		// re-add from fresh
		$('.plupload_file_fields', this.filelist).html('');

		plupload.each(this.uploader.files, function(file, count) {
			var fields = ''
			, id = self.id + '_' + count
			;

			if (file.target_name) {
				fields += '<input type="hidden" name="' + id + '_tmpname" value="'+plupload.xmlEncode(file.target_name)+'" />';
			}
			fields += '<input type="hidden" name="' + id + '_name" value="'+plupload.xmlEncode(file.name)+'" />';
			fields += '<input type="hidden" name="' + id + '_status" value="' + (file.status === plupload.DONE ? 'done' : 'failed') + '" />';

			$('#' + file.id).find('.plupload_file_fields').html(fields);
		});

		this.counter.val(this.uploader.files.length);
	},
	

	_viewChanged: function(view) {
		// update or write a new cookie
		if (this.options.views.remember && $.cookie) {
			$.cookie('plupload_ui_view', view, { expires: 7, path: '/' });
		} 
	
		// ugly fix for IE6 - make content area stretchable
		if (mOxie.Env.browser === 'IE' && mOxie.Env.version < 7) {
			this.content.attr('style', 'height:expression(document.getElementById("' + this.id + '_container' + '").clientHeight - ' + (view === 'list' ? 133 : 103) + ');');
		}

		this.container.removeClass('plupload_view_list plupload_view_thumbs').addClass('plupload_view_' + view); 
		this.view_mode = view;
		this._trigger('viewchanged', null, { view: view });
	},


	_enableViewSwitcher: function() {
		var self = this
		, view
		, switcher = $('.plupload_view_switch', this.container)
		, buttons
		, button
		;

		plupload.each(['list', 'thumbs'], function(view) {
			if (!self.options.views[view]) {
				switcher.find('[for="' + self.id + '_view_' + view + '"], #'+ self.id +'_view_' + view).remove();
			}
		});

		// check if any visible left
		buttons = switcher.find('.plupload_button');

		if (buttons.length === 1) {
			switcher.hide();
			view = buttons.eq(0).data('view');
			this._viewChanged(view);
		} else if ($.ui.button && buttons.length > 1) {
			if (this.options.views.remember && $.cookie) {
				view = $.cookie('plupload_ui_view');
			}

			// if wierd case, bail out to default
			if (!~plupload.inArray(view, ['list', 'thumbs'])) {
				view = this.options.views.active;
			}

			switcher
				.show()
				.buttonset()
				.find('.ui-button')
					.click(function(e) {
						view = $(this).data('view');
						self._viewChanged(view);
						e.preventDefault(); // avoid auto scrolling to widget in IE and FF (see #850)
					});

			// if view not active - happens when switcher wasn't clicked manually
			button = switcher.find('[for="' + self.id + '_view_'+view+'"]');
			if (button.length) {
				button.trigger('click');
			}
		} else {
			switcher.show();
			this._viewChanged(this.options.views.active);
		}
	},
	
	
	_enableRenaming: function() {
		var self = this;

		this.filelist.dblclick(function(e) {
			var nameSpan = $(e.target), nameInput, file, parts, name, ext = "";

			if (!nameSpan.hasClass('plupload_file_namespan')) {
				return;
			}
		
			// Get file name and split out name and extension
			file = self.uploader.getFile(nameSpan.closest('.plupload_file')[0].id);
			name = file.name;
			parts = /^(.+)(\.[^.]+)$/.exec(name);
			if (parts) {
				name = parts[1];
				ext = parts[2];
			}

			// Display input element
			nameInput = $('<input class="plupload_file_rename" type="text" />').width(nameSpan.width()).insertAfter(nameSpan.hide());
			nameInput.val(name).blur(function() {
				nameSpan.show().parent().scrollLeft(0).end().next().remove();
			}).keydown(function(e) {
				var nameInput = $(this);

				if ($.inArray(e.keyCode, [13, 27]) !== -1) {
					e.preventDefault();

					// Rename file and glue extension back on
					if (e.keyCode === 13) {
						file.name = nameInput.val() + ext;
						nameSpan.html(file.name);
					}
					nameInput.blur();
				}
			})[0].focus();
		});
	},
	
	
	_enableSortingList: function() {
		var self = this, filelist = $('.plupload_filelist_content', this.element);
		
		if ($('.plupload_file', filelist).length < 2) {
			return;	
		}
		
		filelist.sortable({
			items: '.plupload_delete',
			
			cancel: 'object, .plupload_clearer',

			stop: function() {
				var files = [];
				
				$.each($(this).sortable('toArray'), function(i, id) {
					files[files.length] = self.uploader.getFile(id);
				});				
				
				files.unshift(files.length);
				files.unshift(0);
				
				// re-populate files array				
				Array.prototype.splice.apply(self.uploader.files, files);	
			}
		});		
	}
});

} (window, document, plupload, jQuery));
