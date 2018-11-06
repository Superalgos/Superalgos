"use strict";
jQuery(window).load(function(){
	//stick header to top
	var affixHeader = jQuery('#header');
	var headerHeight = affixHeader.outerHeight(true);
	affixHeader.wrap('<div id="header_wrapper"></div>').parent().css({height: headerHeight}); //wrap header for smooth stick and unstick
	jQuery(affixHeader).affix({
		offset: {
			top: 0,
			bottom: 0
		}
	});
});	

