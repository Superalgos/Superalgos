"use strict";
jQuery(window).load(function(){
	
	//stick header to top
	var affixHeader = jQuery('#header');
	var headerOffset = jQuery('#mainslider').outerHeight(true);
	jQuery(affixHeader).affix({
		offset: {
			top: headerOffset,
			bottom: 0
		}
	});

	//wrap header with div for smooth sticking
	var headerHeight = affixHeader.outerHeight(true);
	affixHeader.wrap('<div id="header_wrapper"></div>').parent().css({height: headerHeight}); //wrap header for smooth stick and unstick
	
	//if header has different height on afixed and affixed-top positions - correcting wrapper height
	jQuery(affixHeader).on('affixed-top.bs.affix', function () {
		affixHeader.parent().css({height: affixHeader.outerHeight(true)});
	});


});