'use strict'
function pieChart () {
	// circle progress bar
  if ((jQuery().easyPieChart) && (jQuery.support.leadingWhitespace)) {
    var count = 0
    var colors = ['#392071']
    jQuery('.chart').each(function () {
      var imagePos = jQuery(this).offset().top
      var topOfWindow = jQuery(window).scrollTop()
      if (imagePos < topOfWindow + 900) {
        jQuery(this).easyPieChart({
			        barColor: colors[count],
          trackColor: '#e4e4e4',
          scaleColor: false,
          scaleLength: false,
          lineCap: 'butt',
          lineWidth: 2.5,
          size: 142,
          rotate: 0,
          animate: 3000,
          onStep: function (from, to, percent) {
            jQuery(this.el).find('.percent').text(Math.round(percent))
          }
			    })
      }
      count++
      if (count >= colors.length) { count = 0 };
    })
  }
}

/* slider bg */
function slider_bg_init () {
  'use strict'
  if (jQuery('#mainslider').length > 0) {
    jQuery('li > img', '.flexslider').each(function () {
      var sliderimage = jQuery(this).attr('src')
      var slidercssvalues = {
        'background-image': 'url(' + sliderimage + ')',
			    'background-size': 'cover',
			    'background-position': 'center center'
      }
      var slidercssimghide = {
        'opacity': '0',
        'display': 'none'
      }
      jQuery(this).parent().css(slidercssvalues)
      jQuery(this).css(slidercssimghide)
    })
  }
}

jQuery(document).ready(function () {
	// /////////
	// Plugins//
	// /////////
    // contact form processing
  jQuery('form.contact-form').on('submit', function (e) {
    e.preventDefault()
    var $form = jQuery(this)
    jQuery($form).find('span.contact-form-respond').remove()
        // checking on empty values
    var formFields = $form.serializeArray()
    for (var i = formFields.length - 1; i >= 0; i--) {
        	if (!formFields[i].value.length) {
        		$form.find('[name="' + formFields[i].name + '"]').addClass('invalid').on('focus', function () { jQuery(this).removeClass('invalid') })
        	};
    };
        // if one of form fields is empty - exit
    if ($form.find('[name]').hasClass('invalid')) {
        	return
    };
        // sending form data to PHP server if fields are not empty
    var request = $form.serialize()
    var ajax = jQuery.post('contact-form.php', request)
            .done(function (data) {
              jQuery($form).find('[type="submit"]').attr('disabled', false).parent().append('<span class="contact-form-respond highlight">' + data + '</span>')
            })
            .fail(function (data) {
              jQuery($form).find('[type="submit"]').attr('disabled', false).parent().append('<span class="contact-form-respond highlight">Mail cannot be sent. You need PHP server to send mail.</span>')
            })
  })

    // mailchimp subscribe form processing
  jQuery('#signup').on('submit', function (e) {
    e.preventDefault()
        // update user interface
    jQuery('#response').html('Adding email address...')
        // Prepare query string and send AJAX request
    jQuery.ajax({
      url: 'mailchimp/store-address.php',
      data: 'ajax=true&email=' + escape(jQuery('#mailchimp_email').val()),
      success: function (msg) {
        jQuery('#response').html(msg)
      }
    })
  })

/*	//twitter
	//slide tweets
	jQuery('#tweets .twitter').bind('loaded', function(){
		jQuery(this).addClass('flexslider').find('ul').addClass('slides');
	});
	if (jQuery().tweet) {
		jQuery('.twitter').tweet({
			modpath: "./twitter/",
		    count: 2,
		    avatar_size: 48,
		    loading_text: 'loading twitter feed...',
		    join_text: 'auto',
		    username: 'ThemeForest',
		    template: "{avatar}<div class=\"tweet_right\">{time}{join}<span class=\"tweet_text\">{tweet_text}</span></div>"
		});
	}
*/

	// mainmenu
  if (jQuery().superfish) {
    jQuery('ul.sf-menu').superfish({
      delay: 300,
      animation: {opacity: 'show'},
      animationOut: {opacity: 'hide'},
      speed: 'fast',
      disableHI: false,
      cssArrows: true,
      autoArrows: true
    })
  }
	// jQuery('#toggle_mobile_menu, #mainmenu a').on('click', function(){
	//	jQuery('#header').toggleClass('mobile-active');
	// });

	// toTop
  if (jQuery().UItoTop) {
    jQuery().UItoTop({ easingType: 'easeOutQuart' })
  }
	// if (jQuery().UIaddBookmark) {
        // jQuery().UIaddBookmark({ easingType: 'easeOutQuart' });
    // }
	// parallax
	// if (jQuery().parallax) {
//		jQuery('#progress').parallax("50%", 0.4);
//		jQuery('#skills').parallax("50%", 0.3);
	// }

    // prettyPhoto
  if (jQuery().prettyPhoto) {
	   	jQuery("a[data-gal^='prettyPhoto']").prettyPhoto({
	   		hook: 'data-gal',
     theme: 'facebook' /* light_rounded / dark_rounded / light_square / dark_square / facebook / pp_default */
	  	})
  }

   	// tooltip
   	if (jQuery().tooltip) {
     jQuery('[data-toggle="tooltip"]').tooltip()
   }

   	// carousel
   	// if (jQuery().carousel) {
		// jQuery('.carousel').carousel();
	// }

	// owl carousel
	/* if (jQuery().owlCarousel) {
		jQuery("#related-gallery-items-carousel").owlCarousel({
	    	navigation : true,
	    	// navigationText : true,
	    	pagination : false,
	    	items: 3,
	    	itemsDesktop: [1199,3],
	    	itemsDesktopSmall: [979,2],
	    	itemsTablet: [768,1],
	    	itemsMobile: [479,1]

	    });
	    jQuery(".owl-carousel").owlCarousel({
	    	navigation : false,
	    	// navigationText : true,
	    	pagination : false,
	    	items: 5

	    });

	}
    */
    // nice scroll
	// if (jQuery().niceScroll) {
	// 	jQuery("html").niceScroll({
	// 		cursorcolor: '#fbd81a',
	// 		cursorborder: 'none',
	// 		cursorborderradius: '0',
	// 		cursorwidth: '8px'
	// 	});
	// }

	// single page localscroll and scrollspy
  var navHeight = jQuery('#header').outerHeight(true)
  jQuery('body').scrollspy({
    target: '#mainmenu_wrapper',
    offset: navHeight
  })
  if (jQuery().localScroll) {
    jQuery('#mainmenu').localScroll({
      duration: 900,
      easing: 'easeInOutQuart',
      offset: -navHeight + 10
    })
  }
})

jQuery(window).load(function () {
  slider_bg_init()

	// chart
  pieChart()
	// setTimeout(function(){
	// 	jQuery('.progress-bar').addClass('stretchRight');
	// }, 600);

	// fractionslider
  if (jQuery().fractionSlider) {
    var $mainSlider = jQuery('#mainslider')
    jQuery('.slider').fractionSlider({
      'fullWidth': true,
      'responsive': true,
      'dimensions': '1920,320',
		    'increase': true,
      'slideEndAnimation': false,
      'timeout': 3000,
      'slideTransition': 'none',
      'slideTransitionSpeed': 1000,
      'transitionIn': 'fade',
      'transitionOut': 'fade'

    })
  }

	// flexslider
  if (jQuery().flexslider) {
		// var $mainSlider = jQuery('#mainslider');
    jQuery('#mainslider .flexslider').flexslider({
      animation: 'fade',
      useCSS: true,
      controlNav: true,
      directionNav: true,
		    prevText: 'previous',
		    nextText: 'next',
      smoothHeight: false,
      slideshowSpeed: 8000,
      animationSpeed: 300,
      start: function (slider) {
        slider.find('.slide_description').children().css({'visibility': 'hidden'})
        slider.find('.flex-active-slide .slide_description').children().each(function (index) {
          var self = jQuery(this)
          var animationClass = !self.data('animation') ? 'fadeInRight' : self.data('animation')
          setTimeout(function () {
            self.addClass('animated ' + animationClass)
          }, index * 200)
        })
      },
      after: function (slider) {
        slider.find('.flex-active-slide .slide_description').children().each(function (index) {
          var self = jQuery(this)
          var animationClass = !self.data('animation') ? 'fadeInRight' : self.data('animation')
          setTimeout(function () {
            self.addClass('animated ' + animationClass)
          }, index * 200)
        })
      },
      end: function (slider) {
        slider.find('.slide_description').children().each(function () {
          jQuery(this).attr('class', '')
        })
      }
    })

    jQuery('.flexslider').flexslider({
      animation: 'fade',
      useCSS: true,
      controlNav: true,
      directionNav: true,
		    prevText: '',
		    nextText: '',
			// animationLoop: false,
      smoothHeight: true,
      slideshowSpeed: 5000,
      animationSpeed: 800,
      after: function (slider) {
				// console.log(slider.find('.slide_description').children());
			  	// bg-color1 - class for #mainslider
			  	// var currentClass = $mainSlider.find('.flex-active-slide').attr('data-bg');
			  	// $mainSlider.attr('class', currentClass);
      }
    })
  }

	// preloader
  jQuery('.preloaderimg').fadeOut()
  jQuery('.preloader').delay(200).fadeOut('slow').delay(200, function () {
    jQuery(this).remove()
  })

  jQuery('body').delay(1000).scrollspy('refresh')

	// animation to elements on scroll
  if (jQuery().appear) {
		// jQuery('.to_animate').appear().css({opacity: 0});
    jQuery('.to_animate').appear().css({'visibility': 'hidden'})
    jQuery('.to_animate').filter(':appeared').each(function (index) {
      var self = jQuery(this)
      var animationClass = !self.data('animation') ? 'fadeInUp' : self.data('animation')
      var animationDelay = !self.data('delay') ? 270 : self.data('delay')
      setTimeout(function () {
        self.addClass('animated ' + animationClass)
      }, index * animationDelay)
    })

    jQuery('body').on('appear', '.to_animate', function (e, $affected) {
      jQuery($affected).each(function (index) {
        var self = jQuery(this)
        var animationClass = !self.data('animation') ? 'fadeInUp' : self.data('animation')
        var animationDelay = !self.data('delay') ? 270 : self.data('delay')
        setTimeout(function () {
          self.addClass('animated ' + animationClass)
        }, index * animationDelay)
      })
    })
  }

	// counters init on scroll
  if (jQuery().appear) {
    jQuery('.counter').appear()
    jQuery('.counter').filter(':appeared').each(function (index) {
      if (jQuery(this).hasClass('counted')) {
        return
      } else {
        jQuery(this).countTo().addClass('counted')
      }
    })
    jQuery('body').on('appear', '.counter', function (e, $affected) {
      jQuery($affected).each(function (index) {
        if (jQuery(this).hasClass('counted')) {
          return
        } else {
          jQuery(this).countTo().addClass('counted')
        }
      })
    })
  }

	// flickr
	// use http://idgettr.com/ to find your ID
  if (jQuery().jflickrfeed) {
    jQuery('#flickr').jflickrfeed({
      flickrbase: 'http://api.flickr.com/services/feeds/',
      limit: 6,
      qstrings: {
        id: '63512867@N07'
      },
      itemTemplate: '<a href="{{image_b}}" data-gal="prettyPhoto[pp_gal]"><li><img alt="{{title}}" src="{{image_s}}" /></li></a>'
    }, function (data) {
      jQuery('#flickr a').prettyPhoto({
        hook: 'data-gal',
        theme: 'facebook'
	   		})
	   		jQuery('#flickr li').hover(function () {
			   jQuery(this).find('img').stop().animate({ opacity: 0.5 }, 200)
		    }, function () {
			   jQuery(this).find('img').stop().animate({ opacity: 1.0 }, 400)
		    })
    })
  }
})

jQuery(window).resize(function () {
  jQuery('body').scrollspy('refresh')
})

jQuery(window).scroll(function () {
	// circle progress bar
  pieChart()
})

jQuery(document).ready(function () {
  jQuery('#projects_section .isotopeFiltr').append('<ul><li class="squareButton active"><a href="#" data-filter="*">All</a></li><li class="squareButton"><a href="#" data-filter=".flt_64">Photography</a></li><li class="squareButton"><a href="#" data-filter=".flt_65">Interaction Design</a></li><li class="squareButton"><a href="#" data-filter=".flt_46">Illustration</a></li><li class="squareButton"><a href="#" data-filter=".flt_11">Furniture</a></li><li class="squareButton"><a href="#" data-filter=".flt_8">Beautiful</a></li></ul>')
})

jQuery(document).ready(function () {
  jQuery.post(THEMEREX_ajax_url, {
    action: 'post_counter',
    nonce: THEMEREX_ajax_nonce,
    post_id: 330,
    views: 1776
  })
})
var swiper1 = new Swiper('.swiper-container', {
  nextButton: '.swiper-button-next',
  prevButton: '.swiper-button-prev',
  slidesPerView: 1,
  paginationClickable: true,
  spaceBetween: 30,
  loop: true,
  autoplay: 4000
})

var swiper3 = new Swiper('.swiper-container3', {
  scrollbar: '.swiper-scrollbar',
  scrollbarHide: true,
  nextButton: '.swiper-button-next3',
  prevButton: '.swiper-button-prev3',
  direction: 'vertical',
  slidesPerView: 3,
  spaceBetween: -25,
  mousewheelControl: true,
  freeMode: true
})

var swiper4 = new Swiper('.swiper-container4', {
  scrollbar: '.swiper-scrollbar_tab1',
  scrollbarHide: true,
  direction: 'vertical',
  slidesPerView: 2,
  spaceBetween: 0,
  mousewheelControl: true,
  freeMode: true
})

var isSliderActive2 = true
$('#tabs_sliders a').on('shown.bs.tab', function (e) {
  if ($(this).attr('href') == '#tab2') {
    var swiper5 = new Swiper('.swiper-container5', {
      scrollbar: '.swiper-scrollbar_tab2',
      scrollbarHide: true,
      direction: 'vertical',
			    slidesPerView: 2,
      spaceBetween: 0,
			    mousewheelControl: true,
			    freeMode: true
    })
  }
})

var isSliderActive3 = true
$('#tabs_sliders a').on('shown.bs.tab', function (e) {
  if ($(this).attr('href') == '#tab3') {
    var swiper = new Swiper('.swiper-container6', {
      scrollbar: '.swiper-scrollbar_tab3',
      scrollbarHide: true,
      direction: 'vertical',
			    slidesPerView: 2,
			    spaceBetween: 0,
      mousewheelControl: true,
      freeMode: true
    })
  }
})

var swiper7 = new Swiper('.swiper-container7', {
  direction: 'vertical',
  slidesPerView: 3,
  spaceBetween: 0,
  freeMode: true,
  mousewheelControl: true
})

var swiper8 = new Swiper('.swiper-container8', {
  scrollbar: '.swiper-scrollbar8',
  scrollbarHide: false,
  slidesPerView: 5,
  spaceBetween: 50,
  freeMode: true
})

var swiper9 = new Swiper('.swiper-container_things2', {
  pagination: '.swiper-pagination',
  paginationClickable: true,
  slidesPerView: 1,
  spaceBetween: 130,
  loop: true,
  autoplay: 4000
})

var swiper10 = new Swiper('.swiper-container_blog', {
  nextButton: '.swiper-button-next',
  prevButton: '.swiper-button-prev',
  slidesPerView: 1,
  paginationClickable: true,
  autoplay: 4000,
  loop: true
})

var swiper11 = new Swiper('.swiper-container_shortcodes', {
  nextButton: '.swiper-button-next',
  prevButton: '.swiper-button-prev',
  slidesPerView: 1,
  paginationClickable: true,
  loop: true,
  autoplay: 4000
})

/* ]]> */
jQuery(document).ready(function () {
  jQuery.reject({
    reject: {
      all: false, // Nothing blocked
      msie5: true, msie6: true, msie7: true, msie8: true // Covers MSIE 5-8
        	/*
             * Possibilities are endless...
             *
             * // MSIE Flags (Global, 5-8)
             * msie, msie5, msie6, msie7, msie8,
             * // Firefox Flags (Global, 1-3)
             * firefox, firefox1, firefox2, firefox3,
             * // Konqueror Flags (Global, 1-3)
             * konqueror, konqueror1, konqueror2, konqueror3,
             * // Chrome Flags (Global, 1-4)
             * chrome, chrome1, chrome2, chrome3, chrome4,
             * // Safari Flags (Global, 1-4)
             * safari, safari2, safari3, safari4,
             * // Opera Flags (Global, 7-10)
             * opera, opera7, opera8, opera9, opera10,
             * // Rendering Engines (Gecko, Webkit, Trident, KHTML, Presto)
             * gecko, webkit, trident, khtml, presto,
             * // Operating Systems (Win, Mac, Linux, Solaris, iPhone)
             * win, mac, linux, solaris, iphone,
             * unknown // Unknown covers everything else
             */
    },
    imagePath: 'img/',
    header: 'Your browser is out of date', // Header Text
    paragraph1: 'You are currently using an unsupported browser', // Paragraph 1
    paragraph2: 'Please install one of the many optional browsers below to proceed',
    closeMessage: 'Close this window at your own demise!' // Message below close window link
  })
})

jQuery(document).ready(function () {
  var ppp = 6
  jQuery('#portfolio_columns .isotopeFiltr').append('<ul><li class="squareButton active"><a href="#" data-filter="*">All</a></li><li class="squareButton"><a href="#" data-filter=".flt_46">Illustration</a></li><li class="squareButton"><a href="#" data-filter=".flt_9">Popular</a></li><li class="squareButton"><a href="#" data-filter=".flt_8">Beautiful</a></li><li class="squareButton"><a href="#" data-filter=".flt_12">Functional</a></li></ul>')
});

(function ($) {
  $(window).load(function () {
    $('.sidemenu_wrap .sc_scroll').mCustomScrollbar()
    theme:'dark'
  })
})(jQuery)

function setHeiHeight () {
  $('.flexslider').css({
    height: $(window).height() / 2 + 'px'
  })
}
function setHeiHeightMax () {
  $('.slider_height_max').css({
    height: $(window).height() + 'px'
  })
}
setHeiHeight() // устанавливаем высоту окна при первой загрузке страницы
setHeiHeightMax() // устанавливаем высоту окна при первой загрузке страницы
$(window).resize(setHeiHeight) // обновляем при изменении размеров окна
$(window).resize(setHeiHeightMax) // обновляем при изменении размеров окна
