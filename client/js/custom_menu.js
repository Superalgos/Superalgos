function customMenuStart () {
  var THEMEREX_custom_menu_placeholder = ''
  var THEMEREX_custom_menu_holderItem = ''
  jQuery('.menu-panel ul.sub-menu li a').hover(
		function () {
  if (!jQuery(this).parents('.menu-panel').hasClass('columns')) {
    var title = jQuery(this).data('title'),
      href = jQuery(this).data('link'),
      thumb = jQuery(this).data('thumb'),
      author = jQuery(this).data('author'),
      pubdate = jQuery(this).data('pubdate'),
      comments = jQuery(this).data('comments'),
      holderParent = jQuery(this).parents('ul').next()
    if (holderParent) {
      THEMEREX_custom_menu_placeholder = holderParent.html()
      THEMEREX_custom_menu_holderItem = holderParent
      holderParent.find('img').attr('src', thumb)
      holderParent.find('.item_title a').text(title).attr('href', href)
      holderParent.find('.item_pubdate em').text(pubdate)
      holderParent.find('.item_comments em').text(comments)
      holderParent.find('.item_author em').text(author)
    }
  }
},
		function () {
			/*
			if (THEMEREX_custom_menu_holderItem) {
				THEMEREX_custom_menu_holderItem.html(THEMEREX_custom_menu_placeholder);
			}
			*/
}
	)

  var THEMEREX_custom_menu_hover_timeout = 0
  jQuery('#mainmenu li.custom_view_item').hover(
		function (e) {
  if (jQuery('body').hasClass('responsive_menu')) return
  var th = jQuery(this)
  var panel = th.find('.menu-panel')
  panel.css({'display': 'block', 'visibility': 'hidden'})
  if (panel.hasClass('thumb_title')) {
    var li = panel.find('li > ul > li')
    var w = li.width() + parseInt(li.css('marginRight'))
    if (li.length > 1 && jQuery(window).width() > w * 2) {
      w = w * 2
      panel.width(w)
    }
  } else {
    var w = panel.width()
  }
  panel.css({'display': 'none', 'visibility': 'visible'})
			/*
			var off = th.offset().left-th.parent().offset().left+th.width()-w+100;
			if (off<0 && Math.abs(off) > th.parent().offset().left) off = -th.parent().offset().left + 60;
			*/
  var off = th.offset().left - th.parent().offset().left
  if (th.offset().left + w > jQuery(window).width()) off = jQuery(window).width() - 390 - w - th.parent().offset().left
  panel.css('left', off)
},
		function (e) {
}
	)
};

function parentCheck (th, divName) {
  thType = th.get(0).tagName.toLowerCase()
  if (divName != '' && thType == 'li') {
    if (th.find(divName).length > 0) {
      return th.find(divName)
    } else {
      return parentCheck(th.parent().parent(), divName)
    }
  }
}
