// Popup messages
//-----------------------------------------------------------------
jQuery(document).ready(function(){
	"use strict";
	jQuery('body').on('click', '#themerex_modal_bg,.themerex_message .themerex_message_close', function (e) {
		"use strict";
		themerex_message_destroy();
		if (THEMEREX_MESSAGE_CALLBACK) {
			THEMEREX_MESSAGE_CALLBACK(0);
			THEMEREX_MESSAGE_CALLBACK = null;
		}
		e.preventDefault();
		return false;
	});
});

var THEMEREX_MESSAGE_CALLBACK = null;
var THEMEREX_MESSAGE_TIMEOUT = 5000;

// Warning
function themerex_message_warning(msg) {
	"use strict";
	var hdr  = arguments[1] ? arguments[1] : '';
	var icon = arguments[2] ? arguments[2] : 'cancel';
	var delay = arguments[3] ? arguments[3] : THEMEREX_MESSAGE_TIMEOUT;
	return themerex_message({
		msg: msg,
		hdr: hdr,
		icon: icon,
		type: 'warning',
		delay: delay,
		buttons: [],
		callback: null
	});
}

// Success
function themerex_message_success(msg) {
	"use strict";
	var hdr  = arguments[1] ? arguments[1] : '';
	var icon = arguments[2] ? arguments[2] : 'check';
	var delay = arguments[3] ? arguments[3] : THEMEREX_MESSAGE_TIMEOUT;
	return themerex_message({
		msg: msg,
		hdr: hdr,
		icon: icon,
		type: 'success',
		delay: delay,
		buttons: [],
		callback: null
	});
}

// Info
function themerex_message_info(msg) {
	"use strict";
	var hdr  = arguments[1] ? arguments[1] : '';
	var icon = arguments[2] ? arguments[2] : 'info';
	var delay = arguments[3] ? arguments[3] : THEMEREX_MESSAGE_TIMEOUT;
	return themerex_message({
		msg: msg,
		hdr: hdr,
		icon: icon,
		type: 'info',
		delay: delay,
		buttons: [],
		callback: null
	});
}

// Regular
function themerex_message_regular(msg) {
	"use strict";
	var hdr  = arguments[1] ? arguments[1] : '';
	var icon = arguments[2] ? arguments[2] : 'quote';
	var delay = arguments[3] ? arguments[3] : THEMEREX_MESSAGE_TIMEOUT;
	return themerex_message({
		msg: msg,
		hdr: hdr,
		icon: icon,
		type: 'regular',
		delay: delay,
		buttons: [],
		callback: null
	});
}

// Confirm dialog
function themerex_message_confirm(msg) {
	"use strict";
	var hdr  = arguments[1] ? arguments[1] : '';
	var callback = arguments[2] ? arguments[2] : null;
	return themerex_message({
		msg: msg,
		hdr: hdr,
		icon: 'help',
		type: 'regular',
		delay: 0,
		buttons: ['Yes', 'No'],
		callback: callback
	});
}

// Modal dialog
function themerex_message_dialog(content) {
	"use strict";
	var hdr  = arguments[1] ? arguments[1] : '';
	var init = arguments[2] ? arguments[2] : null;
	var callback = arguments[3] ? arguments[3] : null;
	return themerex_message({
		msg: content,
		hdr: hdr,
		icon: '',
		type: 'regular',
		delay: 0,
		buttons: ['Apply', 'Cancel'],
		init: init,
		callback: callback
	});
}

// General message window
function themerex_message(opt) {
	"use strict";
	var msg = opt.msg != undefined ? opt.msg : '';
	var hdr  = opt.hdr != undefined ? opt.hdr : '';
	var icon = opt.icon != undefined ? opt.icon : '';
	var type = opt.type != undefined ? opt.type : 'regular';
	var delay = opt.delay != undefined ? opt.delay : THEMEREX_MESSAGE_TIMEOUT;
	var buttons = opt.buttons != undefined ? opt.buttons : [];
	var init = opt.init != undefined ? opt.init : null;
	var callback = opt.callback != undefined ? opt.callback : null;
	// Modal bg
	jQuery('#themerex_modal_bg').remove();
	jQuery('body').append('<div id="themerex_modal_bg"></div>');
	jQuery('#themerex_modal_bg').fadeIn();
	// Popup window
	jQuery('.themerex_message').remove();
	var html = '<div class="themerex_message themerex_message_' + type + (buttons.length > 0 ? ' themerex_message_dialog' : '') + '">'
		+ '<span class="themerex_message_close iconadmin-cancel icon-cancel"></span>'
		+ (icon ? '<span class="themerex_message_icon iconadmin-'+icon+' icon-'+icon+'"></span>' : '')
		+ (hdr ? '<h2 class="themerex_message_header">'+hdr+'</h2>' : '');
	html += '<div class="themerex_message_body">' + msg + '</div>';
	if (buttons.length > 0) {
		html += '<div class="themerex_message_buttons">';
		for (var i=0; i<buttons.length; i++) {
			html += '<span class="themerex_message_button">'+buttons[i]+'</span>';
		}
		html += '</div>';
	}
	html += '</div>';
	// Add popup to body
	jQuery('body').append(html);
	var popup = jQuery('body .themerex_message').eq(0);
	// Prepare callback on buttons click
	if (callback != null) {
		THEMEREX_MESSAGE_CALLBACK = callback;
		jQuery('.themerex_message_button').click(function(e) {
			"use strict";
			var btn = jQuery(this).index();
			callback(btn+1, popup);
			THEMEREX_MESSAGE_CALLBACK = null;
			themerex_message_destroy();
		});
	}
	// Call init function
	if (init != null) init(popup);
	// Show (animate) popup
	var top = jQuery(window).scrollTop();
	jQuery('body .themerex_message').animate({top: top+Math.round((jQuery(window).height()-jQuery('.themerex_message').height())/2), opacity: 1}, {complete: function () {
		// Call init function
		//if (init != null) init(popup);
	}});
	// Delayed destroy (if need)
	if (delay > 0) {
		setTimeout(function() { themerex_message_destroy(); }, delay);
	}
	return popup;
}

// Destroy message window
function themerex_message_destroy() {
	"use strict";
	var top = jQuery(window).scrollTop();
	jQuery('#themerex_modal_bg').fadeOut();
	jQuery('.themerex_message').animate({top: top-jQuery('.themerex_message').height(), opacity: 0});
	setTimeout(function() { jQuery('#themerex_modal_bg').remove(); jQuery('.themerex_message').remove(); }, 500);
}
