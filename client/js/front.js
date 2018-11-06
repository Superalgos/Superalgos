/* global jQuery:false */

var THEMEREX_MESSAGE_BOOKMARK_ADD = 'Add the bookmark'
var THEMEREX_MESSAGE_BOOKMARK_ADDED = "Current page has been successfully added to the bookmarks. You can see it in the right panel on the tab \'Bookmarks\'"
var THEMEREX_MESSAGE_BOOKMARK_TITLE = 'Enter bookmark title'
var THEMEREX_MESSAGE_BOOKMARK_EXISTS = 'Current page already exists in the bookmarks list'
var THEMEREX_MESSAGE_SEARCH_ERROR = 'Error occurs in AJAX search! Please, type your query and press search icon for the traditional search way.'
var THEMEREX_MESSAGE_EMAIL_CONFIRM = 'On the e-mail address <b>%s</b> we sent a confirmation email.<br>Please, open it and click on the link.'
var THEMEREX_MESSAGE_EMAIL_ADDED = 'Your address <b>%s</b> has been successfully added to the subscription list'
var THEMEREX_REVIEWS_VOTE = 'Thanks for your vote! New average rating is:'
var THEMEREX_REVIEWS_ERROR = 'Error saving your vote! Please, try again later.'
var THEMEREX_MAGNIFIC_LOADING = 'Loading image #%curr% ...'
var THEMEREX_MAGNIFIC_ERROR = '<a href="%url%">The image #%curr%</a> could not be loaded.'
var THEMEREX_MESSAGE_ERROR_LIKE = 'Error saving your like! Please, try again later.'
var THEMEREX_GLOBAL_ERROR_TEXT = 'Global error text'
var THEMEREX_NAME_EMPTY = "The name can\'t be empty"
var THEMEREX_NAME_LONG = 'Too long name'
var THEMEREX_EMAIL_EMPTY = 'Too short (or empty) email address'
var THEMEREX_EMAIL_LONG = 'Too long email address'
var THEMEREX_EMAIL_NOT_VALID = 'Invalid email address'
var THEMEREX_SUBJECT_EMPTY = "The subject can\'t be empty"
var THEMEREX_SUBJECT_LONG = 'Too long subject'
var THEMEREX_MESSAGE_EMPTY = "The message text can\'t be empty"
var THEMEREX_MESSAGE_LONG = 'Too long message text'
var THEMEREX_SEND_COMPLETE = 'Send message complete!'
var THEMEREX_SEND_ORDER_COMPLETE = "Thank you! We\'ll be in touch."
var THEMEREX_SEND_ERROR = 'Transmit failed!'
var THEMEREX_LOGIN_EMPTY = "The Login field can\'t be empty"
var THEMEREX_LOGIN_LONG = 'Too long login field'
var THEMEREX_PASSWORD_EMPTY = "The password can\'t be empty and shorter then 5 characters"
var THEMEREX_PASSWORD_LONG = 'Too long password'
var THEMEREX_PASSWORD_NOT_EQUAL = 'The passwords in both fields are not equal'
var THEMEREX_REGISTRATION_SUCCESS = 'Registration success! Please log in!'
var THEMEREX_REGISTRATION_FAILED = 'Registration failed!'
var THEMEREX_REGISTRATION_AUTHOR = 'Your account is waiting for the site admin moderation!'
var THEMEREX_GEOCODE_ERROR = 'Geocode was not successful for the following reason:'
var THEMEREX_GOOGLE_MAP_NOT_AVAIL = 'Google map API not available!'

// Max scale factor for the portfolio and other isotope elements before relayout
var THEMEREX_isotope_resize_delta = 0.3

// Internal vars - do not change it!
var THEMEREX_ADMIN_MODE = false
var THEMEREX_error_msg_box = null
var THEMEREX_VIEWMORE_BUSY = false
var THEMEREX_video_resize_inited = false
var THEMEREX_top_height = 0
var THEMEREX_top_height_usermenu_area = 0
var THEMEREX_use_fixed_wrapper = true
var THEMEREX_REMEMBERSCROLL = 0
// AJAX parameters
var THEMEREX_ajax_url = '#'
var THEMEREX_ajax_nonce = 'cdd65e5bff'

// Site base url
var THEMEREX_site_url = '#'

// Theme base font
var THEMEREX_theme_font = ''

// Theme skin
var THEMEREX_theme_skin = 'general'
var THEMEREX_theme_skin_bg = '#ffffff'

// Slider height
var THEMEREX_slider_height = 100

// System message
var THEMEREX_systemMessage = {message: '', status: '', header: ''}

// User logged in
var THEMEREX_userLoggedIn = false

// Show table of content for the current page
var THEMEREX_menu_toc = 'no'

// Fix main menu
var THEMEREX_menuFixed = false

// Use responsive version for main menu
var THEMEREX_menuResponsive = 1167
var THEMEREX_responsive_menu_click = true

// Right panel demo timer
var THEMEREX_demo_time = 3000

// Video and Audio tag wrapper
var THEMEREX_useMediaElement = true

// Use AJAX search
var THEMEREX_useAJAXSearch = true
var THEMEREX_AJAXSearch_min_length = 3
var THEMEREX_AJAXSearch_delay = 200

// Popup windows engine
var THEMEREX_popupEngine = 'magnific'
var THEMEREX_popupGallery = true

// E-mail mask
THEMEREX_EMAIL_MASK = '^([a-zA-Z0-9_\\-]+\\.)*[a-zA-Z0-9_\\-]+@[a-z0-9_\\-]+(\\.[a-z0-9_\\-]+)*\\.[a-z]{2,6}$'

// Messages max length
var THEMEREX_msg_maxlength_contacts = 1000
var THEMEREX_msg_maxlength_comments = 1000

// Remember visitors settings
var THEMEREX_remember_visitors_settings = false

function frontManualStart () {
  'use strict'
  timelineResponsive()
  ready()
  timelineScrollFix()
  itemPageFull()
  mainMenuResponsive()
  scrollAction()
  calcMenuColumnsWidth()
  REX_parallax()
  fitLargerHeight()
	// Resize handlers
  jQuery(window).resize(function () {
    'use strict'
    timelineResponsive()
    fullSlider()
    resizeSliders()
    itemPageFull()
    mainMenuResponsive()
    scrollAction()
    REX_parallax()
    setEqualHeight(jQuery('.relatedPostWrap .wrap.thumb'), jQuery('.relatedPostWrap .wrap.no_thumb'))
  })
	// Scroll handlers
  jQuery(window).scroll(function () {
    'use strict'
    timelineScrollFix()
    scrollAction()
    REX_parallax()
  })
};

function ready () {
  'use strict';

    // Form styler
  (function ($) {
    $(function () {
      $('.woocommerce-ordering input, .woocommerce-ordering select, .variations select, #calc_shipping_country, .widgetWrap select').styler()
    })
  })(jQuery)

    // woocommerce
  jQuery('.woocommerce form:not(.formValid) input[type=checkbox]').wrap('<span class="wrap-checkbox"></span>')
  jQuery('.wrap-checkbox').click(function () {
    jQuery(this).toggleClass('active')
  })
  jQuery('.wrap-checkbox input').each(function () {
    if (this.checked) {
      jQuery(this).parent('.wrap-checkbox').toggleClass('active')
    }
  })

    // cart
  jQuery('.topWrap .cart_button').click(function (e) {
    'use strict'
    if (jQuery('body').hasClass('openCart')) {
      jQuery(this).next('.sidebar_cart').fadeOut(200)
      jQuery('.cart_overflow').fadeOut(400)
      jQuery('body').removeClass('openCart')
    } else {
      jQuery(this).next('.sidebar_cart').fadeIn(200)
      jQuery('body').addClass('openCart')
      if (jQuery('.cart_overflow').length == 0) {
        jQuery('body').append('<div class="cart_overflow"></div>')
      }
      jQuery('.cart_overflow').fadeIn(400)
    }
    e.preventDefault()
    return false
  })
  jQuery(document).on('click', '.cart_overflow', function (e) {
    'use strict'
    jQuery('.cart_overflow').fadeOut(400)
    jQuery('.topWrap .sidebar_cart').fadeOut(200)
    jQuery('body').removeClass('openCart')
  })

    // Show system message
  if (THEMEREX_systemMessage.message) {
    if (THEMEREX_systemMessage.status == 'success') { themerex_message_success(THEMEREX_systemMessage.message, THEMEREX_systemMessage.header) } else if (THEMEREX_systemMessage.status == 'info') {
      themerex_message_info(THEMEREX_systemMessage.message, THEMEREX_systemMessage.header)
    } else if (THEMEREX_systemMessage.status == 'error' || THEMEREX_systemMessage.status == 'warning') { themerex_message_warning(THEMEREX_systemMessage.message, THEMEREX_systemMessage.header) }
  }

	// Top menu height
  THEMEREX_top_height = jQuery('header .topWrap').height()
  THEMEREX_top_height_usermenu_area = jQuery('header .topWrap .usermenu_area').height()

    // Blogger height
  function heightRelated () {
    if (jQuery('.sc_blogger.relatedPostWrap').length > 0) {
      if (!isotopeImagesComplete(jQuery('.sc_blogger.relatedPostWrap'))) {
        setTimeout(heightRelated, 500)
        return
      }
      jQuery('.sc_blogger.relatedPostWrap article').each(function () {
        'use strict'
        var height = jQuery(this).height()
        var newHeight = jQuery(this).find('.title_wrap').outerHeight()
                    /* jQuery(this).find('.wrap_bottom_info').css({'top': height - newHeight}); */
      }
            )
    }
  }
  heightRelated()
  try {
    jQuery(window).smartresize(heightRelated)
  } catch (e) {
    jQuery(window).resize(heightRelated)
  }

  THEMEREX_use_fixed_wrapper = jQuery('.topWrapFixed').parents('.fullScreenSlider').length == 0 || !jQuery('.topWrapFixed').parent().next().hasClass('sliderHomeBullets')

	// Close all dropdown elements
  jQuery(document).click(function (e) {
    'use strict'
    jQuery('.pageFocusBlock').slideUp()
    jQuery('.inputSubmitAnimation:not(.opened)').removeClass('sFocus rad4').addClass('radCircle', 100)
    jQuery('ul.shareDrop').removeClass('open').slideUp().siblings('a.shareDrop').removeClass('selected')
  })

	// Calendar handlers - change months
  jQuery('.widget_calendar').on('click', '.prevMonth a, .nextMonth a', function (e) {
    'use strict'
    var calendar = jQuery(this).parents('.wp-calendar')
    var m = jQuery(this).data('month')
    var y = jQuery(this).data('year')
    var pt = jQuery(this).data('type')
    jQuery.post(THEMEREX_ajax_url, {
      action: 'calendar_change_month',
      nonce: THEMEREX_ajax_nonce,
      month: m,
      year: y,
      post_type: pt
    }).done(function (response) {
      var rez = JSON.parse(response)
      if (rez.error === '') {
        calendar.parent().fadeOut(200, function () {
          jQuery(this).empty().append(rez.data).fadeIn(200)
        })
      }
    })
    e.preventDefault()
    return false
  })

	// Tabs for top widgets
  if (jQuery('.widgetTabs').length > 0) {
		// Collect widget's headers into tabs
    var THEMEREX_top_tabs = ''
    var THEMEREX_top_tabs_counter = 0
    jQuery('.widgetTop .titleHide').each(function () {
      'use strict'
      THEMEREX_top_tabs_counter++
      var id = jQuery(this).parents('.widgetTop').attr('id')
      var title = jQuery(this).text()
      if (title == '') title = '#' + THEMEREX_top_tabs_counter
      THEMEREX_top_tabs += '<li><a href="#' + id + '"><span>' + title + '</span></a></li>'
    })
    jQuery('.widgetTabs .tabsButton ul').append(THEMEREX_top_tabs)

		// Break lists in top widgets on two parts
    jQuery('.widgetTop > ul:not(.tabs),.widgetTop > div > ul:not(.tabs)').each(function () {
      'use strict'
      var ul2 = jQuery(this).clone()
      var li = jQuery(this).find('>li')
      var middle = Math.ceil(li.length / 2) - 1
      li.eq(middle).nextAll().remove()
      ul2.find('>li').eq(middle + 1).prevAll().remove()
      jQuery(this).after(ul2)
    })

		// Init tabs
    jQuery('.widgetTabs').tabs({
      show: {
        effect: 'drop',
        direction: 'right',
        duration: 500
      },
      hide: {
        effect: 'drop',
        direction: 'left',
        duration: 500
      },
      activate: function (event, ui) {
        'use strict'
        initShortcodes(ui.newPanel)
      }
    })
  }

	// Add bookmarks
  if (jQuery('#tabsFavorite').length > 0) {
    jQuery('.addBookmark').click(function (e) {
      'use strict'
      var title = window.document.title.split('|')[0]
      var url = window.location.href
      var list = jQuery.cookie('themerex_bookmarks')
      var exists = false
      if (list) {
        list = JSON.parse(list)
        for (var i = 0; i < list.length; i++) {
          if (list[i].url == url) {
            exists = true
            break
          }
        }
      } else				{
        list = new Array()
      }
      if (!exists) {
        var THEMEREX_message_popup = themerex_message_dialog('<label for="bookmark_title">' + THEMEREX_MESSAGE_BOOKMARK_TITLE + '</label><br><input type="text" id="bookmark_title" name="bookmark_title" value="' + title + ' ">', THEMEREX_MESSAGE_BOOKMARK_ADD, null,
					function (btn, popup) {
  'use strict'
  if (btn != 1) return
  title = THEMEREX_message_popup.find('#bookmark_title').val()
  list.push({title: title, url: url})
  jQuery('.listBookmarks').append('<li><a href="' + url + '">' + title + '</a><a href="#" class="delBookmark icon-cancel"></a></li>')
  jQuery.cookie('themerex_bookmarks', JSON.stringify(list), {expires: 365, path: '/'})
  if (THEMEREX_Swipers['bookmarks_scroll'] !== undefined) THEMEREX_Swipers['bookmarks_scroll'].reInit()
  setTimeout(function () { themerex_message_success(THEMEREX_MESSAGE_BOOKMARK_ADDED, THEMEREX_MESSAGE_BOOKMARK_ADD) }, THEMEREX_MESSAGE_TIMEOUT / 4)
})
      } else				{
        themerex_message_warning(THEMEREX_MESSAGE_BOOKMARK_EXISTS, THEMEREX_MESSAGE_BOOKMARK_ADD)
      }
      e.preventDefault()
      return false
    })
		// Delete bookmarks
    jQuery('.listBookmarks').on('click', '.delBookmark', function (e) {
      'use strict'
      var idx = jQuery(this).parent().index()
      var list = jQuery.cookie('themerex_bookmarks')
      if (list) {
        list = JSON.parse(list)
        list.splice(idx, 1)
        jQuery.cookie('themerex_bookmarks', JSON.stringify(list), {expires: 365, path: '/'})
      }
      jQuery(this).parent().remove()
      e.preventDefault()
      return false
    })
		// Sort bookmarks
    jQuery('.listBookmarks').sortable({
      items: 'li',
      update: function (event, ui) {
        'use strict'
        var list = new Array()
        ui.item.parent().find('li').each(function () {
          var a = jQuery(this).find('a:not(.delBookmark)').eq(0)
          list.push({title: a.text(), url: a.attr('href')})
        })
        jQuery.cookie('themerex_bookmarks', JSON.stringify(list), {expires: 365, path: '/'})
      }
    }).disableSelection()
  }

	// Scroll to top
  jQuery('.upToScroll .scrollToTop').click(function (e) {
    'use strict'
    jQuery('html,body').animate({
      scrollTop: 0
    }, 'slow')
    e.preventDefault()
    return false
  })

	// Decorate nested lists in widgets and sidemenu
  jQuery('.widgetWrap ul > li,.sidemenu_area ul > li,.panelmenu_area ul > li,.widgetTop ul > li').each(function () {
    if (jQuery(this).find('ul').length > 0) {
      jQuery(this).addClass('dropMenu')
    }
  })
  jQuery('.widgetWrap ul > li.dropMenu,.sidemenu_area ul > li.dropMenu,.panelmenu_area ul > li.dropMenu,.widgetTop ul > li.dropMenu').click(function (e) {
    'use strict'
    jQuery(this).toggleClass('dropOpen')
    jQuery(this).find('ul').first().slideToggle(200)
    e.preventDefault()
    return false
  })

  jQuery('.widgetWrap ul > li > a,.sidemenu_area ul > li > a,.panelmenu_area ul > li > a,.widgetTop ul > li > a').hover(function (e) {
    'use strict'
    jQuery(this).parent().toggleClass('liHover')

    e.preventDefault()
    return false
  })
  jQuery('.widgetWrap ul:not(.tabs) li > a,.sidemenu_area ul:not(.tabs) li > a,.panelmenu_area ul:not(.tabs) li > a,.widgetTop ul:not(.tabs) li > a').click(function (e) {
    'use strict'
    if (jQuery(this).attr('href') != '#') {
      e.stopImmediatePropagation()
      if (jQuery(this).parent().hasClass('menu-item-has-children') && jQuery(this).parents('.sidemenu_area,.panelmenu_area').length > 0) {
        jQuery(this).parent().trigger('click')
        e.preventDefault()
        return false
      }
    }
  })

	// Archive widget decoration
  jQuery('.widget_archive a').each(function () {
    var val = jQuery(this).html().split(' ')
    if (val.length > 1) {
      val[val.length - 1] = '<span>' + val[val.length - 1] + '</span>'
      jQuery(this).html(val.join(' '))
    }
  })

	// video bg
  if (jQuery('.videoBackground').length > 0) {
    jQuery('.videoBackground').each(function () {
      var youtube = jQuery(this).data('youtube-code')
      if (youtube) {
        jQuery(this).tubular({videoId: youtube})
      }
    })
  }

  setEqualHeight(jQuery('.relatedPostWrap .wrap.thumb'), jQuery('.relatedPostWrap .wrap.no_thumb'))

	// isotope
  if (jQuery('.isotopeNOanim,.isotope').length > 0) {
    initIsotope()

    jQuery(window).resize(resizeIsotope)

		// isotope filter
    jQuery('.isotopeFiltr').on('click', 'li a', function (e) {
      'use strict'
      jQuery(this).parents('.isotopeFiltr').find('li').removeClass('active')
      jQuery(this).parent().addClass('active')

      var selector = jQuery(this).data('filter')
      jQuery(this).parents('.isotopeFiltr').siblings('.isotope').eq(0).isotope({
        filter: selector
      })

      if (selector == '*') {
        jQuery('#viewmore_link').fadeIn()
      } else				{ jQuery('#viewmore_link').fadeOut() }

      e.preventDefault()
      return false
    })
  }

	// main Slider
  if (jQuery('.sliderBullets, .sliderHomeBullets').length > 0) {
    if (jQuery.rsCSS3Easing != undefined && jQuery.rsCSS3Easing != null) {
      jQuery.rsCSS3Easing.easeOutBack = 'cubic-bezier(0.175, 0.885, 0.320, 1.275)'
    }
		// Show Slider
    jQuery('.sliderHomeBullets').slideDown(200, function () {
      'use strict'
      REX_parallax()
      fullSlider()
      initShortcodes(jQuery(this))
			// Hack for the Royal Slider
      if (jQuery('body').hasClass('boxed')) { jQuery(this).trigger('resize') }
    })
  }

	// fullScreen effect for Main Slider
  var homeSlider = jQuery('.sliderHomeBullets')
  if (homeSlider.length > 0 && homeSlider.hasClass('slider_engine_royal')) {
    var slideContent = homeSlider.find('.slideContent').eq(0)
    slideContent.addClass('sliderBGanima ' + slideContent.data('effect'))
    setTimeout(checkFullSlider, 500)
  }

	// Page Navigation
  jQuery('.pageFocusBlock').click(function (e) {
    'use strict'
    if (e.target.nodeName.toUpperCase() != 'A') {
      e.preventDefault()
      return false
    }
  })
  jQuery('.navInput').click(function (e) {
    'use strict'
    jQuery('.pageFocusBlock').slideDown(300, function () {
      initShortcodes(jQuery('.pageFocusBlock').eq(0))
    })
    e.preventDefault()
    return false
  })

	// Responsive Show menu
  jQuery('.openResponsiveMenu').click(function (e) {
    'use strict'
    jQuery('.menuTopWrap').slideToggle()
    e.preventDefault()
    return false
  })

	// Main Menu
  initSfMenu('.menuTopWrap > ul#mainmenu, .usermenu_area ul.usermenu_list')
	// Enable click on root menu items (without submenu) in iOS
  if (isiOS()) {
    jQuery('#mainmenu li:not(.menu-item-has-children) > a').on('click touchend', function (e) {
      'use strict'
      if (jQuery(this).attr('href') != '#') {
        window.location.href = jQuery(this).attr('href')
      }
    })
    jQuery('#mainmenu li.menu-item-has-children > a').hover(
			function (e) {
  'use strict'
  if (jQuery('body').hasClass('responsive_menu')) {
    jQuery(this).trigger('click')
  }
},
			function () {}
			)
  }
	// Submenu click handler
  jQuery('.menuTopWrap ul li a, .usermenu_area ul.usermenu_list li a').click(function (e) {
    'use strict'
    if ((THEMEREX_responsive_menu_click || isMobile()) && jQuery('body').hasClass('responsive_menu') && jQuery(this).parent().hasClass('menu-item-has-children')) {
      if (jQuery(this).siblings('ul:visible').length > 0) {
        jQuery(this).siblings('ul').slideUp()
      } else				{ jQuery(this).siblings('ul').slideDown() }
    }
    if (jQuery(this).attr('href') == '#' || (jQuery('body').hasClass('responsive_menu') && jQuery(this).parent().hasClass('menu-item-has-children'))) {
      e.preventDefault()
      return false
    }
  })

	// Show table of contents for the current page
  if (THEMEREX_menu_toc != 'no') {
    buildPageTOC()
  }
	// One page mode for menu links (scroll to anchor)
  jQuery('#toc, .menuTopWrap ul li, .usermenu_area ul.usermenu_list li').on('click', 'a', function (e) {
    'use strict'
    var href = jQuery(this).attr('href')
    var pos = href.indexOf('#')
    if (pos < 0 || href.length == 1) return
    var loc = window.location.href
    var pos2 = loc.indexOf('#')
    if (pos2 > 0) loc = loc.substring(0, pos2)
    var now = pos == 0
    if (!now) now = loc == href.substring(0, pos)
    if (now) {
      animateTo(href.substr(pos))
      setLocation(pos == 0 ? loc + href : href)
      e.preventDefault()
      return false
    }
  })

	// Open sidemenu
  jQuery('.sidemenu_wrap .sidemenu_button').click(function (e) {
    'use strict'
    jQuery('body').addClass('openMenuFix')
    if (jQuery('.sidemenu_overflow').length == 0) {
      jQuery('body').append('<div class="sidemenu_overflow"></div>')
    }
    jQuery('.sidemenu_overflow').fadeIn(400)
    e.preventDefault()
    return false
  })

	// Close sidemenu and right panel
  jQuery(document).on('click', '.sidemenu_overflow, .sidemenu_close', function (e) {
    'use strict'
    jQuery('body').removeClass('openMenuFixRight openMenuFix')
    if (!isMobile()) jQuery('.swpRightPosButton').fadeIn(400)
    jQuery('.sidemenu_overflow').fadeOut(400)
  })

/*	// Demo sidemenu
	var showed = false;
	if (THEMEREX_demo_time > 0 && jQuery(window).width() > 800 && jQuery('.sidemenu_wrap .sidemenu_button').length > 0) {
		showed = jQuery.cookie('themerex_demo_sidemenu');
		if (!showed) {
			jQuery.cookie('themerex_demo_sidemenu', "1", {expires: 7, path: '/'});
			showed = 1;
			setTimeout(function () {
				jQuery('.sidemenu_wrap .sidemenu_button').trigger('click');
				setTimeout(function() { jQuery('.sidemenu_overflow').trigger('click'); }, THEMEREX_demo_time);
			}, THEMEREX_demo_time);
		}
	}
*/
	// Open right menu
  jQuery('.openRightMenu,.swpRightPosButton').click(function (e) {
    'use strict'
    if (jQuery('body').hasClass('openMenuFixRight')) {
      jQuery('body').removeClass('openMenuFixRight')
      if (!isMobile()) jQuery('.swpRightPosButton').fadeIn(400)
      jQuery('.sidemenu_overflow').fadeOut(400)
    } else {
      jQuery('body').addClass('openMenuFixRight')
      if (jQuery('.sidemenu_overflow').length == 0) {
        jQuery('body').append('<div class="sidemenu_overflow"></div>')
      }
      if (!isMobile()) jQuery('.swpRightPosButton').fadeOut(400)
      jQuery('.sidemenu_overflow').fadeIn(400)
    }
    e.preventDefault()
    return false
  })

	// search
  jQuery('.topWrap .search').click(function (e) {
    'use strict'
    if (jQuery(this).hasClass('searchOpen')) {
      if (e.target.nodeName.toUpperCase() != 'INPUT' && e.target.nodeName.toUpperCase() != 'A') {
        jQuery('.topWrap .search .searchForm').animate({'width': 'hide'}, 300)
        jQuery('.topWrap .ajaxSearchResults').fadeOut()

        var topSearch = jQuery(this)
        if (jQuery('header').hasClass('menu_center')) {
          topSearch.addClass('SearchHide')
          setTimeout(function () {
            topSearch.removeClass('SearchHide')
          }, 1000)
        }

        setTimeout(function () { jQuery('header').removeClass('topSearchShow') }, 400)

        jQuery('.topWrap .search').removeClass('searchOpen')
        e.preventDefault()
        return false
      }
    } else {
      jQuery(this).find('.searchForm').animate({'width': 'show'}, 300)
      jQuery('header').delay(300).addClass('topSearchShow')
      jQuery(this).delay(300).toggleClass('searchOpen')
      e.preventDefault()
      return false
    }
  })
  jQuery('.topWrap .search').on('click', '.searchSubmit,.post_more', function (e) {
    'use strict'
    if (jQuery('.topWrap .searchField').val() != '') {
      jQuery('.topWrap .searchForm form').get(0).submit()
    }
    e.preventDefault()
    return false
  })
  jQuery('.search-form').on('click', '.search-button a', function (e) {
    'use strict'
    if (jQuery(this).parents('.search-form').find('input[name="s"]').val() != '') {
      jQuery(this).parents('.search-form').get(0).submit()
    }
    e.preventDefault()
    return false
  })
	// AJAX search
  if (THEMEREX_useAJAXSearch) {
    var THEMEREX_ajax_timer = null
    jQuery('.topWrap .searchField').keyup(function (e) {
      'use strict'
      var s = jQuery(this).val()
      if (THEMEREX_ajax_timer) {
        clearTimeout(THEMEREX_ajax_timer)
        THEMEREX_ajax_timer = null
      }
      if (s.length >= THEMEREX_AJAXSearch_min_length) {
        THEMEREX_ajax_timer = setTimeout(function () {
          jQuery.post(THEMEREX_ajax_url, {
            action: 'ajax_search',
            nonce: THEMEREX_ajax_nonce,
            text: s
          }).done(function (response) {
            clearTimeout(THEMEREX_ajax_timer)
            THEMEREX_ajax_timer = null
            var rez = JSON.parse(response)
            if (rez.error === '') {
              jQuery('.topWrap .ajaxSearchResults').empty().append(rez.data).fadeIn()
            } else {
              themerex_message_warning(THEMEREX_MESSAGE_SEARCH_ERROR)
            }
          })
        }, THEMEREX_AJAXSearch_delay)
      }
    })
  }

	// search 404
  jQuery('.inputSubmitAnimation').click(function (e) {
    'use strict'
    e.preventDefault()
    return false
  })
  jQuery('.inputSubmitAnimation a').click(function (e) {
    'use strict'
    var form = jQuery(this).siblings('form')
    var parent = jQuery(this).parents('.inputSubmitAnimation')
    if (parent.hasClass('sFocus')) {
      if (form.length > 0 && form.find('input').val() != '') {
        if (jQuery(this).hasClass('sc_emailer_button')) {
          var group = jQuery(this).data('group')
          var email = form.find('input').val()
          var regexp = new RegExp(THEMEREX_EMAIL_MASK)
          if (!regexp.test(email)) {
            form.find('input').get(0).focus()
            themerex_message_warning(THEMEREX_EMAIL_NOT_VALID)
          } else {
            jQuery.post(THEMEREX_ajax_url, {
              action: 'emailer_submit',
              nonce: THEMEREX_ajax_nonce,
              group: group,
              email: email
            }).done(function (response) {
              var rez = JSON.parse(response)
              if (rez.error === '') {
                themerex_message_info(THEMEREX_MESSAGE_EMAIL_CONFIRM.replace('%s', email))
                form.find('input').val('')
              } else {
                themerex_message_warning(rez.error)
              }
            })
          }
        } else					{
          form.get(0).submit()
        }
      } else				{ jQuery(document).trigger('click') }
    } else {
      parent.addClass('sFocus').removeClass('radCircle')
    }
    e.preventDefault()
    return false
  })

	// Portfolio item Description
  if (isMobile()) {	// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    jQuery('.toggleButton').show()
    jQuery('.itemDescriptionWrap,.toggleButton').click(function (e) {
      'use strict'
      jQuery(this).toggleClass('descriptionShow')
      jQuery(this).find('.toggleDescription').slideToggle()
      e.preventDefault()
      return false
    })
  } else {
    jQuery('.itemDescriptionWrap').hover(function () {
      'use strict'
      jQuery(this).toggleClass('descriptionShow')
      jQuery(this).find('.toggleDescription').slideToggle()
    })
  }

	// Save placeholder for input fields
  jQuery('.formList input[type="text"], .formList input[type="password"]')
		.focus(function () {
  'use strict'
  jQuery(this).attr('data-placeholder', jQuery(this).attr('placeholder')).attr('placeholder', '')
  jQuery(this).parent('li').addClass('iconFocus')
})
		.blur(function () {
  'use strict'
  jQuery(this).attr('placeholder', jQuery(this).attr('data-placeholder'))
  jQuery(this).parent('li').removeClass('iconFocus')
})

	// Hide empty pagination
  if (jQuery('#nav_pages > ul > li').length < 3) {
    jQuery('#nav_pages').remove()
  } else {
    jQuery('.theme_paginaton a').addClass('theme_button')
  }

	// View More button
  jQuery('#viewmore_link').click(function (e) {
    'use strict'
    if (!THEMEREX_VIEWMORE_BUSY) {
      jQuery(this).addClass('loading')
      jQuery(this).find('.viewmore_loading').addClass('fa-spin')
      jQuery.post().done(function (response) {
        'use strict'
        var rez = JSON.parse(response)
        jQuery('#viewmore_link').removeClass('loading')
        jQuery('#viewmore_link').find('.viewmore_loading').removeClass('fa-spin')
      })
    }
    e.preventDefault()
    return false
  })

	// Infinite pagination
  if (jQuery('#viewmore.pagination_infinite').length > 0) {
    jQuery(window).scroll(infiniteScroll)
  }

	// WooCommerce handlers
  jQuery('.woocommerce .mode_buttons a,.woocommerce-page .mode_buttons a').click(function (e) {
    'use strict'
    var mode = jQuery(this).hasClass('woocommerce_thumbs') ? 'thumbs' : 'list'
    jQuery.cookie('themerex_shop_mode', mode, {expires: 365, path: '/'})
    jQuery(this).siblings('input').val(mode).parents('form').get(0).submit()
    e.preventDefault()
    return false
  })
	// Added to cart
  jQuery('body').bind('added_to_cart', function () {
		// Update amount on the cart button
    var total = jQuery('.usermenu_cart .total .amount').text()
    if (total != undefined) {
      jQuery('.cart_button .cart_total').text(total)
    }
  })

  initPostFormats()
  initShortcodes(jQuery('body').eq(0))
} // end ready

// Init Superfish menu
function initSfMenu (selector) {
  jQuery(selector).show().each(function () {
    if (isResponsiveNeed() && jQuery(this).attr('id') == 'mainmenu' && (THEMEREX_responsive_menu_click || isMobile())) return
    jQuery(this).addClass('inited').superfish({
      delay: 500,
      animation: {
        opacity: 'show',
        height: 'show'
      },
      speed: 'fast',
      autoArrows: false,
      dropShadows: false,
      onBeforeShow: function (ul) {
        if (jQuery(this).parents('ul').length > 1) {
          var w = jQuery(window).width()
          var par_offset = jQuery(this).parents('ul').offset().left
          var par_width = jQuery(this).parents('ul').outerWidth()
          var ul_width = jQuery(this).outerWidth()
          if (par_offset + par_width + ul_width > w - 20 && par_offset - ul_width > 0) {
            jQuery(this).addClass('submenu_left')
          } else						{
            jQuery(this).removeClass('submenu_left')
          }
        }
      }
    })
  })
}

// Main Menu responsive
function mainMenuResponsive () {
  if (THEMEREX_menuResponsive > 0) {
    if (isResponsiveNeed()) {
      if (!jQuery('body').hasClass('responsive_menu')) {
        jQuery('body').addClass('responsive_menu')

        if (jQuery('.boxedWrap > header').hasClass('menu_center') && !jQuery('.boxedWrap > header').hasClass('inited')) {
          jQuery('.topWrap .wrap_menu').append(jQuery('.menuTopWrap'))
          jQuery('.boxedWrap > header').addClass('inited')
        }
        jQuery('header').removeClass('fixedTopMenu').addClass('noFixMenu')
        if ((THEMEREX_responsive_menu_click || isMobile()) && jQuery('.menuTopWrap > ul#mainmenu').hasClass('inited')) {
          jQuery('.menuTopWrap > ul#mainmenu').removeClass('inited').superfish('destroy')
        }
      }
    } else {
      if (jQuery('body').hasClass('responsive_menu')) {
        jQuery('body').removeClass('responsive_menu')

        if (jQuery('.boxedWrap > header').hasClass('menu_center') && jQuery('.boxedWrap > header').hasClass('inited')) {
          jQuery('.topWrap .wrap_menu').prepend(jQuery('.menuTopWrap'))
        }
        jQuery('.menuTopWrap').show()
        if (THEMEREX_responsive_menu_click || isMobile()) {
          initSfMenu('.menuTopWrap > ul#mainmenu')
        }
        calcMenuColumnsWidth()
      }
    }
  }
}

// Make all columns (in custom menu) equal height
function calcMenuColumnsWidth () {
  'use strict'
  jQuery('#mainmenu li.custom_view_item ul.menu-panel ul.columns').each(function () {
    'use strict'
    if (jQuery('body').hasClass('responsive_menu')) return
    jQuery(this).parents('.menu-panel').css({display: 'block', visibility: 'hidden'})
    var h = 0, w = 0
    jQuery(this).find('>li').css('height', 'auto').each(function () {
      var li = jQuery(this)
      var mt = parseInt(li.css('marginTop')), mb = parseInt(li.css('marginBottom')), mh = li.height() + (isNaN(mt) ? 0 : mt) + (isNaN(mb) ? 0 : mb)
      if (h < mh) h = mh
      var bl = parseInt(li.css('borderLeft')), pl = parseInt(li.css('paddingLeft')), br = parseInt(li.css('borderRight')), pr = parseInt(li.css('paddingRight'))
      w += li.width() + (isNaN(bl) ? 0 : bl) + (isNaN(pl) ? 0 : pl) + (isNaN(pr) ? 0 : pr) + (isNaN(br) ? 0 : br)
    })
    jQuery(this).parents('.menu-panel').css({display: 'none', visibility: 'visible'})
    if (w > jQuery('#mainmenu').width()) jQuery(this).width(w + 8)
    jQuery(this).find('>li').height(h)
  })
}

// Check if responsive menu need
function isResponsiveNeed () {
  'use strict'
  var rez = false
  if (THEMEREX_menuResponsive > 0) {
    var w = window.innerWidth
    if (w == undefined) {
      w = jQuery(window).width() + (jQuery(window).height() < jQuery(document).height() || jQuery(window).scrollTop() > 0 ? 16 : 0)
    }
    rez = THEMEREX_menuResponsive > w
  }
  return rez
}

// Infinite Scroll
function infiniteScroll () {
  'use strict'
  var v = jQuery('#viewmore.pagination_infinite').offset()
  if (jQuery(this).scrollTop() + jQuery(this).height() + 100 >= v.top && !THEMEREX_VIEWMORE_BUSY) {
    jQuery('#viewmore_link').eq(0).trigger('click')
  }
}

// itemPageFull
function itemPageFull () {
  'use strict'
  var bodyHeight = jQuery(window).height()
  var st = jQuery(window).scrollTop()
  if (st > jQuery('.noFixMenu .topWrap').height() + jQuery('.topTabsWrap').height()) st = 0
  var thumbHeight = Math.min(jQuery('.itemPageFull').width() / 16 * 9, bodyHeight - jQuery('#wpadminbar').height() - jQuery('.noFixMenu .topWrap').height() - jQuery('.topTabsWrap').height() + st)
  jQuery('.itemPageFull').height(thumbHeight)
  var padd1 = parseInt(jQuery('.sidemenu_wrap').css('paddingTop'))
  if (isNaN(padd1)) padd1 = parseInt(jQuery('.swpRightPos').css('paddingTop'))
  if (isNaN(padd1)) padd1 = 0
  var padd2 = parseInt(jQuery('.swpRightPos .sc_tabs .tabsMenuBody').css('paddingTop')) * 2
  if (isNaN(padd2)) padd2 = 0
  var tabs_h = jQuery('.swpRightPos .sc_tabs .tabsMenuHead').height()
  if (isNaN(tabs_h)) tabs_h = 0
  var butt_h = jQuery('.swpRightPos .sc_tabs .tabsMenuBody .addBookmarkArea').height()
  if (isNaN(butt_h)) butt_h = 0
  jQuery('#sidemenu_scroll').height(bodyHeight - padd1)
  jQuery('.swpRightPos .sc_tabs .tabsMenuBody').height(bodyHeight - -padd1 - padd2 - tabs_h)
  jQuery('#custom_options_scroll').height(bodyHeight - padd1 - padd2 - tabs_h)
  jQuery('#sidebar_panel_scroll').height(bodyHeight - padd1 - padd2 - tabs_h)
  jQuery('#panelmenu_scroll').height(bodyHeight - padd1 - padd2 - tabs_h)
  jQuery('#bookmarks_scroll').height(bodyHeight - padd1 - padd2 - tabs_h - butt_h)
}

// scroll Action
function scrollAction () {
  'use strict'

  var buttonScrollTop = jQuery('.upToScroll')
  var scrollPositions = jQuery(window).scrollTop()
  var topMenuHeight = jQuery('header').height()

  if (scrollPositions > topMenuHeight) {
    buttonScrollTop.addClass('buttonShow')
  } else {
    buttonScrollTop.removeClass('buttonShow')
  }
/*
    if (!jQuery('body').hasClass('responsive_menu') && THEMEREX_menuFixed) {
        var slider_height = 0;
        if (jQuery('.top_panel_below .sliderHomeBullets').length > 0) {
            slider_height = jQuery('.top_panel_below .sliderHomeBullets').height();
            if (slider_height < 10) {
                slider_height = jQuery('.sliderHomeBullets').parents('.fullScreenSlider').length > 0 ? jQuery(window).height() : THEMEREX_slider_height;
            }
        }
        var topFixedHeight = Math.max(0, jQuery('.fixedTopMenu .topWrap').height());
        if (scrollPositions > THEMEREX_top_height_usermenu_area + slider_height) {
                if (THEMEREX_REMEMBERSCROLL < scrollPositions) {
                    if (scrollPositions > THEMEREX_top_height + slider_height) {
                        jQuery('header .topWrap').css({'opacity': 0});
                    }
                    if (jQuery('header').hasClass('fixedTopMenu')) {
                        //scroll down
                        jQuery('header .topWrap').css({'opacity': 0});
                        setTimeout(function () {
                            jQuery('header').removeClass('fixedTopMenu').addClass('noFixMenu');
                            if (THEMEREX_use_fixed_wrapper) jQuery('.topWrapFixed').hide();
                        }, 300);
                    }
                }
                else if (THEMEREX_REMEMBERSCROLL > scrollPositions) {
                    if (!jQuery('header').hasClass('fixedTopMenu')) {
                        //scroll up
                        jQuery('header .topWrap').css({'opacity': 1});
                        if (THEMEREX_use_fixed_wrapper) jQuery('.topWrapFixed').height(THEMEREX_top_height).show();
                        jQuery('header').addClass('fixedTopMenu').removeClass('noFixMenu');
                    }
                }
        }
        else if (scrollPositions <= topFixedHeight - THEMEREX_top_height_usermenu_area + slider_height) {
            if (jQuery('header').hasClass('fixedTopMenu')) {
                jQuery('header').removeClass('fixedTopMenu').addClass('noFixMenu');
                if (THEMEREX_use_fixed_wrapper) jQuery('.topWrapFixed').hide();
            }
        }
        THEMEREX_REMEMBERSCROLL = scrollPositions;
    }

*/

  if (!jQuery('body').hasClass('responsive_menu') && THEMEREX_menuFixed) {
    var slider_height = 0
    if (jQuery('.top_panel_below .sliderHomeBullets').length > 0) {
      slider_height = jQuery('.top_panel_below .sliderHomeBullets').height()
      if (slider_height < 10) {
        slider_height = jQuery('.sliderHomeBullets').parents('.fullScreenSlider').length > 0 ? jQuery(window).height() : THEMEREX_slider_height
      }
    }
    var topFixedHeight = Math.max(0, jQuery('.fixedTopMenu .topWrap').height())
    if (scrollPositions <= THEMEREX_top_height - topFixedHeight - 20 + slider_height) {
      if (jQuery('header').hasClass('fixedTopMenu')) {
        jQuery('header').removeClass('fixedTopMenu').addClass('noFixMenu')
        if (THEMEREX_use_fixed_wrapper) jQuery('.topWrapFixed').hide()
      }
    } else if (scrollPositions > THEMEREX_top_height + slider_height) {
      if (!jQuery('header').hasClass('fixedTopMenu')) {
        jQuery('header').addClass('fixedTopMenu').removeClass('noFixMenu')
        if (THEMEREX_use_fixed_wrapper) jQuery('.topWrapFixed').height(THEMEREX_top_height).show()
      }
    }
  }
}

// Fullscreen slider
function fullSlider () {
  'use strict'
  var fullSlider = jQuery('.fullScreenSlider')
  if (fullSlider.length > 0) {
    var h = jQuery(window).height() - jQuery('#wpadminbar').height() - (jQuery('.top_panel_above .fullScreenSlider header').css('position') == 'static' ? jQuery('.topWrap').height() : 0)
		// Slider Container
    fullSlider.find('.sliderHomeBullets').css('height', h)
		// Royal slider
    fullSlider.find('.sliderHomeBullets.slider_engine_royal > div,.sliderHomeBullets.slider_engine_royal .rsOverflow,.sliderHomeBullets.slider_engine_royal .rsContent,.sliderHomeBullets .slideContent,.sliderHomeBullets .sc_slider,.sliderHomeBullets .sc_slider .slides,.sliderHomeBullets .sc_slider .slides li').css('height', h)
		// Revolution slider
    fullSlider.find('.sliderHomeBullets.slider_engine_revo .rev_slider_wrapper,.sliderHomeBullets.slider_engine_revo .rev_slider').css({'height': h + 'px', 'maxHeight': h + 'px'})
    fullSlider.find('.sliderHomeBullets.slider_engine_revo .rev_slider > ul').css({'maxHeight': h + 'px'})
    fullSlider.find('.sliderHomeBullets.slider_engine_revo .rev_slider .defaultimg').css({'height': h + 'px', 'maxWidth': 'none'})
  } else {
    var slider = jQuery('.sliderHomeBullets.slider_engine_revo')
    if (slider.length > 0) {
      var h = slider.find('.rev_slider').height()
      if (slider.height() != h) slider.css('height', h)
    }
  }
}

// Animation effect on fullscreen slider (only for Royal slider)
function checkFullSlider () {
  'use strict'
  var fullSlider = jQuery('.fullScreenSlider')
  if (fullSlider.length > 0) {
    var slider = fullSlider.find('.royalSlider').data('royalSlider')
    if (slider == undefined || slider == '') {
      setTimeout(checkFullSlider, 500)
    } else {
      slider.ev.on('rsBeforeAnimStart', function (event) {
        'use strict'
        REX_parallax()
        var slideIndex = this.currSlideId
        var slideContent = jQuery('.slider_engine_royal').find('.slideContent')
        slideContent.each(function () {
          jQuery(this).removeClass('sliderBGanima ' + jQuery(this).data('effect'))
        })
        slideContent.eq(slideIndex).addClass('sliderBGanima ' + slideContent.eq(slideIndex).data('effect'))
      })
    }
  }
}

// Resize sliders
function resizeSliders () {
  if (jQuery('.sc_slider_flex,.sc_slider_chop,.sc_slider_swiper').length > 0) {
    jQuery('.sc_slider_flex,.sc_slider_chop,.sc_slider_swiper').each(function () {
      if (jQuery(this).parents('.isotope, .isotopeNOanim').length == 0) calcSliderDimensions(jQuery(this))
    })
  }
}

// Time Line
function timelineResponsive () {
  'use strict'
  var tl = jQuery('#timeline_slider:not(.fixed)').eq(0)
  if (tl.length > 0) {
    if (jQuery(window).width() <= 1023) {
      tl.addClass('fixed')
    } else {
      var bodyHeight = jQuery(window).height()
      var tlHeight = jQuery(window).height() - tl.find('h2').height() - 150
      tl.find('.sc_blogger').css('height', tlHeight).find('.sc_scroll').css('height', tlHeight)
    }
  }
}

// time line Scroll
function timelineScrollFix () {
  'use strict'
  var tl = jQuery('#timeline_slider:not(.fixed)').eq(0)
  if (tl.length > 0) {
    var scrollWind = jQuery(window).scrollTop()
    var headerHeight = jQuery('header').height() + jQuery('.topTabsWrap').height() - 20
    var footerHeight = jQuery('.footerContentWrap').height()
    var footerVisible = jQuery(document).height() - footerHeight <= scrollWind + jQuery(window).height()

    if (jQuery(window).scrollTop() <= headerHeight) {
      if (parseFloat(tl.css('marginTop')) > 0) {
        tl.animate({
          marginTop: 0
        }, {
          queue: false,
          duration: 350
        })
      }
    } else {
      if (headerHeight <= scrollWind - 10 && !footerVisible) {
        tl.animate({
          marginTop: (scrollWind - headerHeight) + 'px'
        }, {
          queue: false,
          duration: 350
        })
      }
    }
  }
}

// Init isotope
THEMEREX_isotopeLoad = 0
var THEMEREX_isotopeInitCounter = 0
function initIsotope () {
  if (jQuery('.isotopeNOanim,.isotope').length > 0) {
    if (!isotopeImagesComplete(jQuery('.isotopeNOanim,.isotope'))) {
      setTimeout(function () { initIsotope() }, 2000)
      return
    }

    jQuery('.isotopeNOanim,.isotope').each(function () {
      'use strict'
                // delay(1000) - set time before show all elements
      jQuery(this).addClass('inited').find('.isotopeElement').delay(1000).animate({opacity: 1}, 400, function () {
        jQuery(this).addClass('isotopeElementShow')
      })
      var w = calcSizeIsotope(jQuery(this))
      if (jQuery(this).hasClass('grid')) {
        jQuery(this).isotope({
          resizable: jQuery(this).parents('.fullscreen,.sc_gap').length > 0 && !jQuery(this).hasClass('folio1col'),
          masonry: {
            columnWidth: 1
          },
          itemSelector: '.isotopeElement',
          animationOptions: {
            duration: 2000,
            easing: 'linear',
            queue: false
          }
        })
      } else {
        jQuery(this).isotope({
          resizable: jQuery(this).parents('.fullscreen,.sc_gap').length > 0 && !jQuery(this).hasClass('folio1col'),
          masonry: {
            columnWidth: w
          },
          itemSelector: '.isotopeElement',
          animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false
          }
        })
      }

                // Init shortcodes in isotope
      initShortcodes(jQuery(this))

                // for Count filters
      var isotopeBox = jQuery(this)
      initCountIsotope(isotopeBox)

                // Again recalculate Isotope
      var elems = jQuery(this).find('.isotopeElement')
      if (jQuery(this).hasClass('grid')) {
        isotopeResizeGrid(jQuery(this), elems)
        setTimeout(function () {
                        // for hover in portfolio Grid
          elems.each(
                            function () {
                              var newHeight = jQuery(this).find('.portfolioInfo').outerHeight() / 2
                              jQuery(this).find('.wrap_hover').css({'top': -newHeight})
                            }
                        )
        }, 1100)
      } else {
        setTimeout(function () {
          resizeIsotope()
        }, 500)
      }
    })
  }
}

function initAppendedIsotope (posts_container, filters) {
  'use strict'
  if (!isotopeImagesComplete(posts_container) && THEMEREX_isotopeInitCounter++ < 30) {
    setTimeout(function () { initAppendedIsotope(posts_container, filters) }, 200)
    return
  }
  calcSizeIsotope(posts_container)
  var flt = posts_container.siblings('.isotopeFiltr')

  var elems = posts_container.find('.isotopeElement:not(.isotopeElementShow)').addClass('isotopeElementShow')
  posts_container.isotope('appended', elems)
  for (var i in filters) {
    if (flt.find('a[data-filter=".flt_' + i + '"]').length == 0) {
      flt.find('ul').append('<li class="squareButton"><a href="#" data-filter=".flt_' + i + '">' + filters[i] + '</a></li>')
    }
  }

    // for Count filters
  initCountIsotope(posts_container)
  timelineResponsive()
  timelineScrollFix()
  itemPageFull()
  initPostFormats()
  initShortcodes(posts_container)
  scrollAction()

    // Again recalculate Isotope - resizeIsotope()
  if (posts_container.hasClass('grid')) {
    resizeIsotope()
  } else {
    setTimeout(function () {
      resizeIsotope()
    }, 700)
  }
}

function isotopeImagesComplete (cont) {
  var complete = true
  cont.find('img').each(function () {
    if (!complete) return
    if (!jQuery(this).get(0).complete) complete = false
  })
  return complete
}

function calcSizeIsotope (cont) {
  'use strict'
  var columns = Math.max(1, Number(cont.data('columns')))
  var element = cont.find('.isotopeElement:not(.isotope-item)')
  var elementWidth = 0, elementWidthNew = 0, elementHeight = 0, elementHeightNew = 0

  if (cont.data('last-width') == cont.width()) return elementWidthNew
  var changeHeight = cont.hasClass('portfolio')
  var m1 = parseInt(cont.css('marginRight'))
  if (isNaN(m1)) m1 = 0
  var m2 = parseInt(element.find('.isotopePadding').css('marginRight'))
  if (isNaN(m2)) m2 = 0
  var lastWidth = cont.width() + (changeHeight ? 0 : m1 + m2)
  cont.data('last-width', lastWidth)
  elementWidth = changeHeight ? element.width() : Math.max(240, Math.floor(lastWidth / columns - m2))
  cont.data('element-width', elementWidth)
  elementWidthNew = Math.floor(lastWidth / columns)
  var dir = elementWidthNew > elementWidth ? 1 : -1
  while (dir * (elementWidthNew - elementWidth) / elementWidth > THEMEREX_isotope_resize_delta) {
    columns += dir
    if (columns == 0) break
    elementWidthNew = Math.floor(lastWidth / columns)
  }
  element.css({
    width: elementWidthNew
  })
  if (changeHeight) {
    elementHeight = element.height()
    cont.data('element-height', elementHeight)
    elementHeightNew = Math.floor(elementWidthNew / elementWidth * elementHeight)
    element.css({
      height: elementHeightNew
    })
  }

  return elementWidthNew
}

// Resize new Isotope elements
function resizeIsotope () {
  jQuery('.isotope, .isotopeNOanim').each(function () {
    'use strict'

            // for isotopeFull (grid)
    if (jQuery(this).hasClass('grid')) {
      var isotopeEll = jQuery(this).find('article')
      isotopeResizeGrid(jQuery(this), isotopeEll)

                // for hover in portfolio Grid
      setTimeout(function () {
        isotopeEll.each(
                        function () {
                          var newHeight = jQuery(this).find('.portfolioInfo').outerHeight() / 2
                          jQuery(this).find('.wrap_hover').css({'top': -newHeight})
                        })
      }, 200)
    }

            // for all isotope
    else {
      var cont = jQuery(this)
      var columns = Math.max(1, Number(cont.data('columns')))
      var changeHeight = cont.hasClass('portfolio')
      var element = cont.find('.isotopeElement')
      var m1 = parseInt(cont.css('marginRight'))
      if (isNaN(m1)) m1 = 0
      var m2 = parseInt(element.find('.isotopePadding').css('marginRight'))
      if (isNaN(m2)) m2 = 0
      var lastWidth = cont.width() + (changeHeight ? 0 : m1 + m2)
      cont.data('last-width', lastWidth)
      var elementWidth = parseFloat(cont.data('element-width'))
      var elementWidthNew = Math.floor(lastWidth / columns)
      var dir = elementWidthNew > elementWidth ? 1 : -1
      while (dir * (elementWidthNew - elementWidth) / elementWidth > THEMEREX_isotope_resize_delta) {
        columns += dir
        if (columns == 0) break
        elementWidthNew = Math.floor(lastWidth / columns)
      }
      element.css({
        width: elementWidthNew
      })
      if (changeHeight) {
        var elementHeight = parseFloat(cont.data('element-height'))
        var elementHeightNew = Math.floor(elementWidthNew / elementWidth * elementHeight)
        element.css({
          height: elementHeightNew
        })
      }
      jQuery(this).isotope({
        masonry: {
          columnWidth: elementWidthNew
        }
      })
      cont.find('.sc_slider_flex,.sc_slider_chop,.sc_slider_swiper').each(function () {
        calcSliderDimensions(jQuery(this))
      })

                // for proper alignment indentation for video and slides
      setTimeout(function () {
        cont.isotope('layout')
      }, 1500)

      setTimeout(function () {
                    // for hover in portfolio Masonry
        if (jQuery('.portfolioWrap .masonry').length > 0) {
          jQuery('.portfolioWrap .masonry article').each(
                            function () {
                              var newHeight = jQuery(this).find('.portfolioInfo').outerHeight() / 2
                              jQuery(this).find('.wrap_hover').css({'top': -newHeight})
                                // height
                              var heightBox = jQuery(this).find('.hoverIncrease').outerHeight()
                              jQuery(this).find('.wrap_hover').css({'height': heightBox})
                            }
                        )
        }
                    // for safari hover
        if (jQuery('.masonryWrap .masonry').length > 0) {
          jQuery('.masonryWrap .masonry article').each(
                            function () {
                              var heightBox = jQuery(this).find('.hoverIncrease').outerHeight()
                              jQuery(this).find('.wrap_hover').css({'height': heightBox})
                            }
                        )
        }
      }, 1600)
    }
  })
}

function initPostFormats () {
  'use strict'

	// MediaElement init
  initMediaElements(jQuery('body'))

	// hoverZoom img effect
  if (jQuery('.hoverIncrease:not(.inited)').length > 0) {
    jQuery('.hoverIncrease:not(.inited)')
			.addClass('inited')
			.each(function () {
  'use strict'
  var img = jQuery(this).data('image')
  var title = jQuery(this).data('title')
  var link = jQuery(this).data('link')
  var target = jQuery(this).data('target')
  if (target) { target = ' target="' + target + '" ' } else { target = ' ' }
  if (img) {
    if (jQuery(this).hasClass('hoverTwo')) {
      jQuery(this).append('<span class="hoverShadow"></span><div class="wrap_hover"><a href="' + img + '" title="' + title + '"><span class="hoverIcon"></span></a><a' + target + 'title="' + title + '" href="' + link + '"><span class="hoverLink"></span></a></div>')
    } else {
      jQuery(this).append('<span class="hoverShadow"></span><a href="' + img + '" title="' + title + '"><span class="hoverIcon"></span></a>')
    }
  }
})

        // for hover in indent style
    if (jQuery('.relatedPostWrap .indent_style').length > 0) {
      jQuery('.relatedPostWrap .indent_style article').each(
                function () {
                  var newHeight = jQuery(this).find('.relatedInfo').outerHeight() / 2
                  jQuery(this).find('.wrap_hover').css({'top': -newHeight})
                }
            )
    }
  }

	// Popup init
  if (THEMEREX_popupEngine == 'pretty' && typeof jQuery.prettyPhoto !== 'undefined') {
    jQuery("a[href$='jpg'],a[href$='jpeg'],a[href$='png'],a[href$='gif']").attr('rel', 'prettyPhoto' + (THEMEREX_popupGallery ? '[slideshow]' : ''))	// .toggleClass('prettyPhoto', true);
    jQuery("a[rel*='prettyPhoto']:not(.inited):not([rel*='magnific']):not([data-rel*='magnific'])")
			.addClass('inited')
			.prettyPhoto({
  social_tools: '',
  theme: 'facebook',
  deeplinking: false
})
			.click(function (e) {
  'use strict'
  if (jQuery(window).width() < 480)	{
    e.stopImmediatePropagation()
    window.location = jQuery(this).attr('href')
  }
  e.preventDefault()
  return false
})
  } else if (typeof jQuery.magnificPopup !== 'undefined') {
    jQuery("a[href$='jpg'],a[href$='jpeg'],a[href$='png'],a[href$='gif']").attr('rel', 'magnific')
    jQuery("a[rel*='magnific']:not(.inited):not(.prettyphoto):not([rel*='pretty']):not([data-rel*='pretty'])")
			.addClass('inited')
			.magnificPopup({
  type: 'image',
  mainClass: 'mfp-img-mobile',
  closeOnContentClick: true,
  closeBtnInside: true,
  fixedContentPos: true,
  midClick: true,
  preloader: true,
  tLoading: THEMEREX_MAGNIFIC_LOADING,
  gallery: {
    enabled: THEMEREX_popupGallery
  },
  image: {
    tError: THEMEREX_MAGNIFIC_ERROR,
    verticalFit: true
  }
})
  }

	// Popup windows with any html content
  if (jQuery('.user-popup-link').length > 0 || jQuery('a[href="#openLogin"]').length > 0) {
    jQuery('.user-popup-link:not(.inited),a[href="#openLogin"]:not(.inited)')
            .addClass('inited')
            .magnificPopup({
              type: 'inline',
              removalDelay: 500,
              callbacks: {
                beforeOpen: function () {
                  this.st.mainClass = 'mfp-zoom-in'
                },
                open: function () {
                  jQuery('html').css({
                    overflow: 'visible',
                    margin: 0
                  })
                },
                close: function () {
                }
              },
              midClick: true
            })
  }
	// Share button
  if (jQuery('ul.shareDrop:not(.inited)').length > 0) {
    jQuery('ul.shareDrop:not(.inited)')
			.addClass('inited')
			.siblings('a').click(function (e) {
  'use strict'
  var shareDrop = jQuery(this).siblings('ul.shareDrop')
  if (jQuery(this).hasClass('selected')) {
    jQuery(this).removeClass('selected').siblings('ul.shareDrop').slideUp(500)
    setTimeout(function () { shareDrop.removeClass('open') }, 600)
  } else {
    jQuery(this).addClass('selected').siblings('ul.shareDrop').slideDown(500)
    setTimeout(function () { shareDrop.addClass('open') }, 600)
  }
  e.preventDefault()
  return false
}).end()
			.find('li a').click(function (e) {
  var shareDropClose = jQuery(this).siblings('ul.shareDrop')
  jQuery(this).parents('ul.shareDrop').slideUp(500).siblings('a.shareDrop').removeClass('selected')
  setTimeout(function () { shareDropClose.removeClass('open') }, 600)
  e.preventDefault()
  return false
})
  }

	// Like button
  if (jQuery('.postSharing:not(.inited),.masonryMore:not(.inited)').length > 0) {
    jQuery('.postSharing:not(.inited),.masonryMore:not(.inited)')
			.addClass('inited')
			.find('.likeButton a')
			.click(function (e) {
  var button = jQuery(this).parent()
  var inc = button.hasClass('like') ? 1 : -1
  var post_id = button.data('postid')
  var likes = Number(button.data('likes')) + inc
  var cookie_likes = jQuery.cookie('themerex_likes')
  if (cookie_likes === undefined) cookie_likes = ''
  jQuery.post(THEMEREX_ajax_url, {
    action: 'post_counter',
    nonce: THEMEREX_ajax_nonce,
    post_id: post_id,
    likes: likes
  }).done(function (response) {
    var rez = JSON.parse(response)
    if (rez.error === '') {
      if (inc == 1) {
        var title = button.data('title-dislike')
        button.removeClass('like').addClass('likeActive')
        cookie_likes += (cookie_likes.substr(-1) != ',' ? ',' : '') + post_id + ','
      } else {
        var title = button.data('title-like')
        button.removeClass('likeActive').addClass('like')
        cookie_likes = cookie_likes.replace(',' + post_id + ',', ',')
      }
      button.data('likes', likes).find('a').attr('title', title)
      jQuery.cookie('themerex_likes', cookie_likes, {expires: 365, path: '/'})
    } else {
      themerex_message_warning(THEMEREX_MESSAGE_ERROR_LIKE)
    }
  })
  e.preventDefault()
  return false
})
  }

	// Hover DIR
  if (jQuery('.portfolio > .isotopeElement:not(.inited)').length > 0) {
    jQuery('.portfolio > .isotopeElement:not(.inited)')
			.addClass('inited')
			.find('> .hoverDirShow').each(function () {
  'use strict'
  jQuery(this).hoverdir()
})
  }

	// Add video on thumb click
  if (jQuery('.sc_video_play_button:not(.inited)').length > 0) {
    jQuery('.sc_video_play_button:not(.inited)').each(function () {
      'use strict'
      var video = jQuery(this).data('video')
      var pos = video.indexOf('height=')
      if (pos > 0) {
        pos += 8
        var pos2 = video.indexOf('"', pos)
        var h = parseInt(video.substring(pos, pos2))
        if (!isNaN(h)) {
          jQuery(this).find('img').height(h)
        }
      }
      jQuery(this)
				.addClass('inited')
				.animate({opacity: 1}, 1000)
				.click(function (e) {
  'use strict'
  if (!jQuery(this).hasClass('sc_video_play_button')) return
  var video = jQuery(this).removeClass('sc_video_play_button').data('video')
  if (video !== '') {
    jQuery(this).empty().html(video)
    videoDimensions()
    var video_tag = jQuery(this).find('video')
    var w = video_tag.width()
    var h = video_tag.height()
    initMediaElements(jQuery(this))
						// Restore WxH attributes, because Chrome broke it!
    jQuery(this).find('video').css({'width': w, 'height': h}).attr({'width': w, 'height': h})
  }
  e.preventDefault()
  return false
})
    })
  }

	// IFRAME width and height constrain proportions
  if (jQuery('iframe,.sc_video_player,video.sc_video').length > 0) {
    if (!THEMEREX_video_resize_inited) {
      THEMEREX_video_resize_inited = true
      jQuery(window).resize(function () {
        'use strict'
        videoDimensions()
      })
    }
    videoDimensions()
  }
}

function initMediaElements (cont) {
  if (THEMEREX_useMediaElement && cont.find('audio,video').length > 0) {
    if (window.mejs) {
      window.mejs.MepDefaults.enableAutosize = false
      window.mejs.MediaElementDefaults.enableAutosize = false
      cont.find('audio:not(.wp-audio-shortcode),video:not(.wp-video-shortcode)').each(function () {
                // init Media Elements after init isotope
        if (jQuery(this).parents('.isotopeNOanim,.isotope').length > 0 && !isotopeImagesComplete(jQuery('.isotopeNOanim,.isotope'))) {
          setTimeout(function () {
            initMediaElements(cont)
          }, 2500)
          return
        } else if (jQuery(this).parents('.mejs-mediaelement').length == 0) {
          var settings = {
            enableAutosize: false,
            videoWidth: -1,		// if set, overrides <video width>
            videoHeight: -1,	// if set, overrides <video height>
            audioWidth: '100%',	// width of audio player
            audioHeight: 30		// height of audio player
          }

          settings.success = function (mejs) {
            var autoplay, loop

            if (mejs.pluginType === 'flash') {
              autoplay = mejs.attributes.autoplay && mejs.attributes.autoplay !== 'false'
              loop = mejs.attributes.loop && mejs.attributes.loop !== 'false'

              autoplay && mejs.addEventListener('canplay', function () {
                mejs.play()
              }, false)

              loop && mejs.addEventListener('ended', function () {
                mejs.play()
              }, false)
            }
          }

          jQuery(this).mediaelementplayer(settings)
        }
      })
    } else			{
      setTimeout(function () { initMediaElements(cont) }, 400)
    }
  }
}

// Fit video frames to document width
function videoDimensions () {
  jQuery('.sc_video_player').each(function () {
    'use strict'
    var player = jQuery(this).eq(0)
    var ratio = (player.data('ratio') ? player.data('ratio').split(':') : (player.find('[data-ratio]').length > 0 ? player.find('[data-ratio]').data('ratio').split(':') : [16, 9]))
    ratio = ratio.length != 2 || ratio[0] == 0 || ratio[1] == 0 ? 16 / 9 : ratio[0] / ratio[1]
    var cover = jQuery(this).find('.sc_video_play_button img')
    var ht = player.find('.sc_video_player_title').height()
    var w_attr = player.data('width')
    var h_attr = player.data('height')
    if (!w_attr || !h_attr) {
      return
    }
    var percent = ('' + w_attr).substr(-1) == '%'
    w_attr = parseInt(w_attr)
    h_attr = parseInt(h_attr)
    var w_real = Math.min(percent ? 10000 : w_attr, player.parents('div,article').width()), // player.width();
      h_real = Math.round(percent ? w_real / ratio : w_real / w_attr * h_attr)
    if (parseInt(player.attr('data-last-width')) == w_real) return
    if (percent) {
      player.height(h_real + (isNaN(ht) ? 0 : ht))
      if (cover.length > 0) cover.height(h_real)
    } else {
      player.css({'width': w_real + 'px', 'height': h_real + (isNaN(ht) ? 0 : ht) + 'px'})
      if (cover.length > 0) cover.height(h_real)
    }
    player.attr('data-last-width', w_real)
  })
  jQuery('video.sc_video').each(function () {
    'use strict'
    var video = jQuery(this).eq(0)
    var ratio = (video.data('ratio') != undefined ? video.data('ratio').split(':') : [16, 9])
    ratio = ratio.length != 2 || ratio[0] == 0 || ratio[1] == 0 ? 16 / 9 : ratio[0] / ratio[1]
    var mejs_cont = video.parents('.mejs-video')
    var player = video.parents('.sc_video_player')
    var w_attr = player.length > 0 ? player.data('width') : video.data('width')
    var h_attr = player.length > 0 ? player.data('height') : video.data('height')
    if (!w_attr || !h_attr) {
      return
    }
    var percent = ('' + w_attr).substr(-1) == '%'
    w_attr = parseInt(w_attr)
    h_attr = parseInt(h_attr)
    var w_real = Math.round(mejs_cont.length > 0 ? Math.min(percent ? 10000 : w_attr, mejs_cont.parents('div,article').width()) : video.width()),
      h_real = Math.round(percent ? w_real / ratio : w_real / w_attr * h_attr)
    if (parseInt(video.attr('data-last-width')) == w_real) return
    if (mejs_cont.length > 0 && mejs) {
      setMejsPlayerDimensions(video, w_real, h_real)
    }
    if (percent) {
      video.height(h_real)
    } else {
      video.attr({'width': w_real, 'height': h_real}).css({'width': w_real + 'px', 'height': h_real + 'px'})
    }
    video.attr('data-last-width', w_real)
  })
  jQuery('video.sc_video_bg').each(function () {
    'use strict'
    var video = jQuery(this).eq(0)
    var ratio = (video.data('ratio') != undefined ? video.data('ratio').split(':') : [16, 9])
    ratio = ratio.length != 2 || ratio[0] == 0 || ratio[1] == 0 ? 16 / 9 : ratio[0] / ratio[1]
    var mejs_cont = video.parents('.mejs-video')
    var container = mejs_cont.length > 0 ? mejs_cont.parent() : video.parent()
    var w = container.width()
    var h = container.height()
    var w1 = Math.ceil(h * ratio)
    var h1 = Math.ceil(w / ratio)
    if (video.parents('.sc_parallax').length > 0) {
      var windowHeight = jQuery(window).height()
      var speed = Number(video.parents('.sc_parallax').data('parallax-speed'))
      var h_add = Math.ceil(Math.abs((windowHeight - h) * speed))
      if (h1 < h + h_add) {
        h1 = h + h_add
        w1 = Math.ceil(h1 * ratio)
      }
    }
    if (h1 < h) {
      h1 = h
      w1 = Math.ceil(h1 * ratio)
    }
    if (w1 < w) {
      w1 = w
      h1 = Math.ceil(w1 / ratio)
    }
    var l = Math.round((w1 - w) / 2)
    var t = Math.round((h1 - h) / 2)
    if (parseInt(video.attr('data-last-width')) == w1) return
    if (mejs_cont.length > 0) {
      setMejsPlayerDimensions(video, w1, h1)
      mejs_cont.css({'left': -l + 'px', 'top': -t + 'px'})
    } else			{ video.css({'left': -l + 'px', 'top': -t + 'px'}) }
    video.attr({'width': w1, 'height': h1, 'data-last-width': w1}).css({'width': w1 + 'px', 'height': h1 + 'px'})
    if (video.css('opacity') == 0) video.animate({'opacity': 1}, 3000)
  })
  jQuery('iframe').each(function () {
    'use strict'
    var iframe = jQuery(this).eq(0)
    var ratio = (iframe.data('ratio') != undefined ? iframe.data('ratio').split(':') : (iframe.find('[data-ratio]').length > 0 ? iframe.find('[data-ratio]').data('ratio').split(':') : [16, 9]))
    ratio = ratio.length != 2 || ratio[0] == 0 || ratio[1] == 0 ? 16 / 9 : ratio[0] / ratio[1]
    var w_attr = iframe.attr('width')
    var h_attr = iframe.attr('height')
    var player = iframe.parents('.sc_video_player')
    if (player.length > 0) {
      w_attr = player.data('width')
      h_attr = player.data('height')
    }
    if (!w_attr || !h_attr) {
      return
    }
    var percent = ('' + w_attr).substr(-1) == '%'
    w_attr = parseInt(w_attr)
    h_attr = parseInt(h_attr)
    var w_real = player.length > 0 ? player.width() : iframe.width(),
      h_real = Math.round(percent ? w_real / ratio : w_real / w_attr * h_attr)
    if (parseInt(iframe.attr('data-last-width')) == w_real) return
    iframe.css({'width': w_real + 'px', 'height': h_real + 'px'})
  })
}

// Resize fullscreen video background
function resizeVideoBackground () {
  var bg = jQuery('.videoBackgroundFullscreen')
  if (bg.length < 1) {
    return
  }
  if (THEMEREX_useMediaElement && bg.find('.mejs-video').length == 0) {
    setTimeout(resizeVideoBackground, 100)
    return
  }
  if (!bg.hasClass('inited')) {
    bg.addClass('inited')
  }
  var video = bg.find('video')
  var ratio = (video.data('ratio') != undefined ? video.data('ratio').split(':') : [16, 9])
  ratio = ratio.length != 2 || ratio[0] == 0 || ratio[1] == 0 ? 16 / 9 : ratio[0] / ratio[1]
  var w = bg.width()
  var h = bg.height()
  var w1 = Math.ceil(h * ratio)
  var h1 = Math.ceil(w / ratio)
  if (h1 < h) {
    h1 = h
    w1 = Math.ceil(h1 * ratio)
  }
  if (w1 < w) {
    w1 = w
    h1 = Math.ceil(w1 / ratio)
  }
  var l = Math.round((w1 - w) / 2)
  var t = Math.round((h1 - h) / 2)
  if (bg.find('.mejs-container').length > 0) {
    setMejsPlayerDimensions(bg.find('video'), w1, h1)
    bg.find('.mejs-container').css({'left': -l + 'px', 'top': -t + 'px'})
  } else		{
    bg.find('video').css({'left': -l + 'px', 'top': -t + 'px'})
  }
  bg.find('video').attr({'width': w1, 'height': h1}).css({'width': w1 + 'px', 'height': h1 + 'px'})
}

// Set Media Elements player dimensions
function setMejsPlayerDimensions (video, w, h) {
  if (mejs) {
    for (var pl in mejs.players) {
      if (mejs.players[pl].media.src == video.attr('src')) {
        if (mejs.players[pl].media.setVideoSize) {
          mejs.players[pl].media.setVideoSize(w, h)
        }
        mejs.players[pl].setPlayerSize(w, h)
        mejs.players[pl].setControlsSize()
      }
    }
  }
}

// Parallax scroll
function REX_parallax () {
  jQuery('.sc_parallax').each(function () {
    var windowHeight = jQuery(window).height()
    var scrollTops = jQuery(window).scrollTop()
    var offsetPrx = Math.max(jQuery(this).offset().top, windowHeight)
    if (offsetPrx <= scrollTops + windowHeight) {
      var speed = Number(jQuery(this).data('parallax-speed'))
      var xpos = jQuery(this).data('parallax-x-pos')
      var ypos = Math.round((offsetPrx - scrollTops - windowHeight) * speed + (speed < 0 ? windowHeight * speed : 0))
      jQuery(this).find('.sc_parallax_content').css('backgroundPosition', xpos + ' ' + ypos + 'px')
			// Uncomment next line if you want parallax video (else - video position is static)
      jQuery(this).find('div.sc_video_bg').css('top', ypos + 'px')
    }
  })
}

// Height
function setEqualHeight (example, where) {
  var tallestcolumn = 0
  example.each(
        function () {
          var currentHeight = jQuery(this).height()
          if (currentHeight > tallestcolumn) {
            tallestcolumn = currentHeight
          }
        }
    )
  where.height(tallestcolumn)
}

// Fit height to the larger value of child elements
function fitLargerHeight () {
  if (jQuery('.autoHeight.columnsWrap').length > 0) {
    jQuery('.autoHeight.columnsWrap').each(function () {
      'use strict'
      var tallestcolumn = 0
      var columns = jQuery(this).children('div')
      columns.css({'height': 'auto'})
      columns.each(
                function () {
                  var currentHeight = jQuery(this).height()
                  if (currentHeight > tallestcolumn) {
                    tallestcolumn = currentHeight
                  }
                }
            )
      columns.height(tallestcolumn)
    })
  }
}

function initCountIsotope (isotopeBox) {
  'use strict'
  var box = isotopeBox.find('.isotopeElement')
  var flt = isotopeBox.parent().find('.isotopeFiltr a')
  var ellAllCount = box.length
  flt.find('.data_count').html('')

  flt.each(function () {
    var el = jQuery(this).data('filter')
    var count = 0
    box.each(function () {
      if (jQuery(this).hasClass(el.substr(1))) {
        count++
      }
    })
    if (count == 0) {
      count = ellAllCount
    }
    jQuery(this).append('<span class="data_count">' + count + '</span>')
  })
}

// isotope grid resize
function isotopeResizeGrid (itemWrap, item) {
  'use strict'

  var isotopeWrap = itemWrap
  var isotopeItem = item
  var isotopeItemWidth = 300
  var isotopeItemHeight = 300

  if (jQuery(window).width() < 800) {
    var isotopeItemWidth = 200
    var isotopeItemHeight = 200
  } else if (jQuery(window).width() < 1023) {
    var isotopeItemWidth = 250
    var isotopeItemHeight = 250
  }

  if (jQuery(window).width() > 480) {
    isotopeItem.each(function () {
      var w = jQuery(this).data('width')
      var h = jQuery(this).data('height')
      jQuery(this).css('width', Math.floor(isotopeWrap.width() / Math.floor(isotopeWrap.width() / isotopeItemWidth)) * w)
      jQuery(this).css('height', Math.floor(isotopeWrap.width() / Math.floor(isotopeWrap.width() / isotopeItemHeight)) * h)
    })
  }
  itemWrap.isotope('layout')
}
