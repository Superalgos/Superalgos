// Shortcodes init
function initShortcodes(container) {
	// Tabs
	if (container.find('.sc_tabs:not(.inited),.tabs_area:not(.inited)').length > 0) {
		container.find('.sc_tabs:not(.inited),.tabs_area:not(.inited)').each(function () {
			var init = jQuery(this).data('active');
			if (isNaN(init)) init = 0;
			else init = Math.max(0, init);
			jQuery(this)
				.addClass('inited')
				.tabs({
					active: init,
					show: {
						effect: 'fade',
						duration: 250
					},
					hide: {
						effect: 'fade',
						duration: 200
					},
					create: function (event, ui) {
						initShortcodes(ui.panel);
					},
					activate: function (event, ui) {
						initShortcodes(ui.newPanel);
					}
				});
		});
	}

	// Toggles
	if (container.find('.sc_toggles .sc_toggles_title:not(.inited)').length > 0) {
		container.find('.sc_toggles .sc_toggles_title:not(.inited)')
			.addClass('inited')
			.click(function () {
				jQuery(this).parent().toggleClass('sc_active');
				jQuery(this).parent().find('.sc_toggles_content').slideToggle(200, function () {
					initShortcodes(jQuery(this).parent().find('.sc_toggles_content'));
				});
			});
	}

	// Tooltip
	if (container.find('.sc_tooltip_parent:not(.inited)').length > 0) {
		container.find('.sc_tooltip_parent:not(.inited)')
			.addClass('inited')
			.hover(function () {
				"use strict";
				var obj = jQuery(this);
				obj.find('.sc_tooltip').stop().animate({
					'marginTop': '5'
				}, 100).show();
			},
			function () {
				"use strict";
				var obj = jQuery(this);
				obj.find('.sc_tooltip').stop().animate({
					'marginTop': '0'
				}, 100).hide();
			});
	}

	// Infoboxes
	if (container.find('.sc_infobox.sc_infobox_closeable:not(.inited)').length > 0) {
		container.find('.sc_infobox.sc_infobox_closeable:not(.inited)')
			.addClass('inited')
			.click(function () {
				jQuery(this).slideUp();
			});
	}

	// Contact form
	if (container.find('.sc_contact_form:not(.contact_form_1) .sc_contact_form_submit:not(.inited)').length > 0) {
		container.find(".sc_contact_form:not(.contact_form_1) .sc_contact_form_submit:not(.inited)")
			.addClass('inited')
			.click(function(e){
				var form = jQuery(this).parents("form");
				var action = form.attr('action');
				userSubmitForm(form, action!=undefined ? action : THEMEREX_ajax_url, THEMEREX_ajax_nonce);
				e.preventDefault();
				return false;
			});
	}
	if (container.find('.sc_contact_form_custom .bubble label:not(.inited)').length > 0) {
		container.find(".sc_contact_form_custom .bubble label:not(.inited)")
			.addClass('inited')
			.click(function(e){
				jQuery(this).parent().siblings('.bubble').find('label').removeClass('selected');
				jQuery(this).addClass('selected');
			});
	}

	// Bordered images
	if (container.find('.sc_border:not(.inited)').length > 0) {
		container.find('.sc_border:not(.inited)')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				jQuery(this).addClass('inited');
				var w = Math.round(jQuery(this).width());
				var h = Math.round(w/4*3);
				jQuery(this).find('.slides').css({height: h+'px'});
				jQuery(this).find('.slides li').css({width: w+'px', height: h+'px'});
			});
	}

	// Autoheight sliders
	if (container.find('.sc_slider_autoheight').length > 0) {
		container.find('.sc_slider_autoheight').each(function() {
			jQuery(this).find('li.swiper-slide,li.flex-slide,li.chop-slide').each(function() {
				if (jQuery(this).data('autoheight') == undefined) {
					jQuery(this).attr('data-autoheight', jQuery(this).height());
				}
			});
		});
	}

	// Flex Slider
	if (container.find('.sc_slider_flex:not(.inited)').length > 0) {
		container.find('.sc_slider_flex:not(.inited)')
			.addClass('inited')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				if (jQuery(this).parents('.isotopeNOanim:not(.inited),.isotope:not(.inited)').length > 0) return;
				jQuery(this).flexslider({
					prevText: '',
					nextText: '',
					directionNav: jQuery(this).hasClass('sc_slider_controls'),
					controlNav: jQuery(this).hasClass('sc_slider_pagination') || jQuery(this).parents('.sc_slider_pagination_area').length > 0,
					animation: 'slide',
					animationLoop: true,
					slideshow: !jQuery(this).hasClass('sc_slider_noautoplay'),
					slideshowSpeed: isNaN(jQuery(this).data('interval')) ? 7000 : jQuery(this).data('interval'),
					animationSpeed: 600,
					pauseOnAction: true,
					pauseOnHover: true,
					useCSS: false,
					manualControls: jQuery(this).parents('.sc_slider_pagination_area').length > 0 ? '#'+jQuery(this).attr('id')+'_scroll ul li' : '',
					after: function(slider){
						if (slider.parents('.sc_slider_pagination_area').length > 0) {
							sliderChangeActivePagination(slider, slider.currentSlide);
						}
					}
				});
				calcSliderDimensions(jQuery(this));
			});
	}

	// Chop Slider
	if (container.find('.sc_slider_chop:not(.inited)').length > 0) {
		container.find('.sc_slider_chop:not(.inited)')
			.addClass('inited')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				if (jQuery(this).parents('.isotopeNOanim:not(.inited),.isotope:not(.inited)').length > 0) return;
				var slider = jQuery(this);
				var effect = slider.data('effect').split('|');
				slider.chopSlider({
		/* Slide Element */
		slide : "#"+slider.attr('id')+" .chop-slide",
		/* Controlers */
		nextTrigger : slider.hasClass('sc_slider_controls') ? "#"+slider.attr('id')+" a.flex-next" : '',
		prevTrigger : slider.hasClass('sc_slider_controls') ? "#"+slider.attr('id')+" a.flex-prev" : '',
		hideControls : true,
		sliderPagination : slider.parents('.sc_slider_pagination_area').length > 0 ? "#"+slider.attr('id')+'_scroll ul li' : '',
		/* Captions */
		useCaptions : true,
		everyCaptionIn : "#"+slider.attr('id')+" .sc_slider_info_item",
		showCaptionIn : "#"+slider.attr('id')+" .sc_slider_info_holder",
		captionTransform : "scale(0) translate(-600px,0px) rotate(45deg)",
		/* Autoplay */
		autoplay : !slider.hasClass('sc_slider_noautoplay'),
		autoplayDelay : isNaN(slider.data('interval')) ? 6000 : slider.data('interval'),
		/* Default Parameters */
		defaultParameters : {
			type: "vertical",
			xOffset: 20,
			yOffset: 20,
			hPieces : 10,
			vPieces: 20,
			rotate : 10 ,
			rotateSymmetric: false,
			scaleX:0.5,
			scaleY:-0.5,
			translateX:10,
			translateY:10,
			ease1:"ease",
			ease2:"ease",
			origin:"center center",
			dur1: 1000,
			dur2 :600,
			dur3: 1000,
			pieceDelay : 50,
			xFadeDelay :0,
			prevTransition : 	{
				rotate:-10,
				xOffset:10,
				startFrom:10
			}
		},
		t2D : csTransitions[effect[0]]['random'],
		t3D : effect.length > 1 ? csTransitions[effect[1]]['random'] : false,
		/* For Mobile Devices */
		mobile: csTransitions['mobile']['random'],
		/* For Old and IE Browsers */
		noCSS3:csTransitions['noCSS3']['random'],
		/* Events */
		onStart: function(){},
		onEnd: function(){}

				});
				calcSliderDimensions(jQuery(this));
			});
	}

	// Swiper Slider
	if (container.find('.sc_slider_swiper:not(.inited)').length > 0) {
		container.find('.sc_slider_swiper:not(.inited)')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				if (jQuery(this).parents('.isotopeNOanim:not(.inited),.isotope:not(.inited)').length > 0) return;
				jQuery(this).addClass('inited');
				var id = jQuery(this).attr('id');
				if (id == undefined) {
					id = 'swiper_'+Math.random();
					id = id.replace('.', '');
					jQuery(this).attr('id', id);
				}
				jQuery(this).addClass(id);
				jQuery(this).find('.slides li').css('position', 'relative');

                if(jQuery(this).parent().hasClass('sc_text_slider') || jQuery(this).parent().hasClass('sc_testimonials') || jQuery(this).parent().hasClass('sc_twitter') ) {
                    THEMEREX_Swipers[id] = new Swiper('.' + id, {
                        loop: true,
                        grabCursor: true,
                        pagination: jQuery(this).hasClass('sc_slider_pagination') ? '#' + id + ' .flex-control-nav' : false,
                        paginationClickable: true,
                        calculateHeight: true,
                        resizeReInit: true,
                        autoResize: true,
                        autoplay: jQuery(this).hasClass('sc_slider_noautoplay') ? false : (isNaN(jQuery(this).data('interval')) ? 7000 : jQuery(this).data('interval')),
                        autoplayDisableOnInteraction: false,
                        initialSlide: 0,
                        speed: 600
                    });
                    jQuery(window).resize(function(){
                        THEMEREX_Swipers[id].resizeFix();
                        THEMEREX_Swipers[id].reInit();
                    });

                } else {
                    THEMEREX_Swipers[id] = new Swiper('.' + id, {
                        loop: true,
                        grabCursor: true,
                        pagination: jQuery(this).hasClass('sc_slider_pagination') ? '#' + id + ' .flex-control-nav' : false,
                        paginationClickable: true,
                        calculateHeight: false,
                        autoplay: jQuery(this).hasClass('sc_slider_noautoplay') ? false : (isNaN(jQuery(this).data('interval')) ? 7000 : jQuery(this).data('interval')),
                        autoplayDisableOnInteraction: false,
                        initialSlide: 0,
                        speed: 600,
                        onFirstInit: function (slider) {
                            var cont = jQuery(slider.container);
                            if (!cont.hasClass('sc_slider_autoheight')) return;
                            var li = cont.find('li.swiper-slide').eq(1);
                            var h = li.data('autoheight');
                            if (h > 0) {
                                var pt = parseInt(li.css('paddingTop')), pb = parseInt(li.css('paddingBottom'));
                                cont.height(h + (isNaN(pt) ? 0 : pt) + (isNaN(pb) ? 0 : pb));
                                cont.find('.swiper-wrapper').height(h + (isNaN(pt) ? 0 : pt) + (isNaN(pb) ? 0 : pb));
                            }
                        },
                        onSlideChangeStart: function (slider) {
                            var cont = jQuery(slider.container);
                            if (!cont.hasClass('sc_slider_autoheight')) return;
                            var idx = slider.activeIndex;
                            var li = cont.find('li.swiper-slide').eq(idx);
                            var h = li.data('autoheight');
                            if (h > 0) {
                                var pt = parseInt(li.css('paddingTop')), pb = parseInt(li.css('paddingBottom'));
                                li.height(h);
                                cont.height(h + (isNaN(pt) ? 0 : pt) + (isNaN(pb) ? 0 : pb));
                                cont.find('.swiper-wrapper').height(h + (isNaN(pt) ? 0 : pt) + (isNaN(pb) ? 0 : pb));
                            }
                        },
                        onSlideChangeEnd: function (slider, dir) {
                            var cont = jQuery(slider.container);
                            if (cont.parents('.sc_slider_pagination_area').length > 0) {
                                var li = cont.parents('.sc_slider_pagination_area').find('.flex-control-nav.manual ul li');
                                var idx = slider.activeIndex > li.length ? 0 : slider.activeIndex - 1;
                                sliderChangeActivePagination(cont, idx);
                            }
                        }
                    });
                }

				var curSlide = jQuery(this).find('.slides').data('current-slide');
				if (curSlide > 0)
					THEMEREX_Swipers[id].swipeTo(curSlide-1);
				prepareSliderNavi(jQuery(this));
				calcSliderDimensions(jQuery(this));
			});
	}

	//Scroll
/*	if (container.find('.sc_scroll:not(.inited)').length > 0) {
		container.find('.sc_scroll:not(.inited)')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				jQuery(this).addClass('inited');
				var id = jQuery(this).attr('id');
				if (id == undefined) {
					id = 'scroll_'+Math.random();
					id = id.replace('.', '');
					jQuery(this).attr('id', id);
				}
				jQuery(this).addClass(id);
				var bar = jQuery(this).find('#'+id+'_bar');
				if (bar.length > 0 && !bar.hasClass(id+'_bar')) {
					bar.addClass(id+'_bar');
				}
				THEMEREX_Swipers[id] = new Swiper('.'+id, {
					freeMode: true,
					freeModeFluid: true,
					grabCursor: true,
					noSwiping: jQuery(this).hasClass('scroll-no-swiping'),
					mode: jQuery(this).hasClass('sc_scroll_vertical') ? 'vertical' : 'horizontal',
					slidesPerView: jQuery(this).hasClass('sc_scroll') ? 'auto' : 1,
					mousewheelControl: true,
					mousewheelAccelerator: 4,	// Accelerate mouse wheel in Firefox 4+
					scrollContainer: jQuery(this).hasClass('sc_scroll_vertical'),
					scrollbar: {
						container: '.'+id+'_bar',
						hide: true,
						draggable: true
					}
				});
				prepareSliderNavi(jQuery(this));
			});
	}
*/
	//Countdown
	if (container.find('.sc_countdown:not(.inited)').length > 0) {
		var myCountdown = {};
		container.find('.sc_countdown:not(.inited)')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				jQuery(this).addClass('inited');
				var id = jQuery(this).attr('id');
				if (id == undefined) {
					id = 'countdown_'+Math.random();
					id = id.replace('.', '');
					jQuery(this).attr('id', id);
				}
				var curDate = new Date();
				var	curDateStr = curDate.getFullYear() + '-' + (curDate.getMonth()<9 ? '0' : '') + (curDate.getMonth()+1) + '-' + (curDate.getDate() < 10 ? '0' : '') + curDate.getDate();
				var endDate = jQuery(this).data('date');
				if (endDate == undefined || endDate == '' || endDate < curDateStr)
					endDate = curDateStr;
				endDate = endDate.split('-');
				var endTime = jQuery(this).data('time');
				if (endTime == undefined || endTime == '')
					endTime = '00:00:00';
				endTime = endTime.split(':');
				if (endTime.length==2) endTime[2] = 0;
				var destDate = new Date(endDate[0], endDate[1]-1, endDate[2], endTime[0], endTime[1], endTime[2]);
				var diff = Math.round(destDate.getTime() / 1000 - curDate.getTime() / 1000);
				myCountdown[id] = jQuery('#'+id).FlipClock(diff, {
					countdown: true,
					clockFace: 'DailyCounter'
				});
			});
	}

	//Zoom
	if (container.find('.sc_zoom:not(.inited)').length > 0) {
		container.find('.sc_zoom:not(.inited)')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				jQuery(this).addClass('inited');
				jQuery(this).find('img').elevateZoom({
					zoomType: "lens",
					lensShape: "round",
					lensSize: 200
				});
			});
	}

	//Skills init
	if (container.find('.sc_skills_item:not(.inited)').length > 0) {
		skills_init(container);
		jQuery(window).scroll(function () { skills_init(container); });
	}
	//Skills type='arc' init
	if (container.find('.sc_skills_arc:not(.inited)').length > 0) {
		skills_arc_init(container);
		jQuery(window).scroll(function () { skills_arc_init(container); });
	}

	//Pan init
	if (container.find('.sc_pan:not(.inited_pan)').length > 0) {
		container.find('.sc_pan:not(.inited_pan)')
			.each(function () {
				"use strict";
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;
				var pan = jQuery(this).addClass('inited_pan');
				var cont = pan.parent();
				cont.mousemove(function(e) {
					"use strict";
					var anim = {};
					var tm = 0;
					var pw = pan.width(), ph = pan.height();
					var cw = cont.width(), ch = cont.height();
					var coff = cont.offset();
					if (pan.hasClass('sc_pan_vertical'))
						pan.css('top', -Math.floor((e.pageY - coff.top) / ch * (ph-ch)));
					if (pan.hasClass('sc_pan_horizontal'))
						pan.css('left', -Math.floor((e.pageX - coff.left) / cw * (pw-cw)));
				});
				cont.mouseout(function(e) {
					pan.css({'left': 0, 'top': 0});
				});
			});
	}
}

// Slider navigation
var THEMEREX_Swipers = {};
function prepareSliderNavi(slider) {
	// Prev / Next
	var navi = slider.find('.flex-direction-nav');
	if (navi.length == 0) navi = slider.siblings('.flex-direction-nav');
	if (navi.length > 0) {
		navi.find('.flex-prev').click(function(e){
			var swiper = jQuery(this).parents('.swiper-slider-container');
			if (swiper.length == 0) swiper = jQuery(this).parents('.flex-direction-nav').siblings('.swiper-slider-container');
			var id = swiper.attr('id');
			THEMEREX_Swipers[id].swipePrev();
			e.preventDefault();
			return false;
		});
		navi.find('.flex-next').click(function(e){
			var swiper = jQuery(this).parents('.swiper-slider-container');
			if (swiper.length == 0) swiper = jQuery(this).parents('.flex-direction-nav').siblings('.swiper-slider-container');
			var id = swiper.attr('id');
			THEMEREX_Swipers[id].swipeNext();
			e.preventDefault();
			return false;
		});
	}

	// Pagination
	navi = slider.siblings('.flex-control-nav.manual');
	if (navi.length > 0) {
		navi.find('li').click(function(e){
			var swiper = jQuery(this).parents('.sc_slider_pagination_area').find('.swiper-slider-container');
			var id = swiper.attr('id');
			THEMEREX_Swipers[id].swipeTo(jQuery(this).index());
			e.preventDefault();
			return false;
		});
	}
}

function sliderChangeActivePagination(slider, idx) {
	var pg = slider.parents('.sc_slider_pagination_area').find('.flex-control-nav.manual');
	pg.find('ul li').removeClass('active').eq(idx).addClass('active');
	var h = pg.height();
	var off = pg.find('.active').offset().top - pg.offset().top;
	var off2 = pg.find('.sc_scroll_wrapper').offset().top - pg.offset().top;
	var h2  = pg.find('.active').height();
	if (off < 0) {
		pg.find('.sc_scroll_wrapper').css({'transform': 'translate3d(0px, 0px, 0px)', 'transition-duration': '0.3s'});
	} else if (h <= off+h2) {
		pg.find('.sc_scroll_wrapper').css({'transform': 'translate3d(0px, -'+(Math.abs(off2)+off+h2-h/4)+'px, 0px)', 'transition-duration': '0.3s'});
	}
}

// Slider dimensions
function calcSliderDimensions(slider) {
     if(slider.parent().hasClass('sc_text_slider') || slider.parent().hasClass('sc_testimonials') || slider.parent().hasClass('sc_twitter') ) return;
     if (slider.height() == 0 || slider.hasClass('sc_slider_noresize') || !slider.hasClass('inited')) return;
     var w = slider.data('old-width');
     var h = slider.data('old-height');
     if (isNaN(w) || w<50 || isNaN(h) || h<50) {
     slider.data('old-width', slider.width());
     slider.data('old-height', slider.height());
     } else if (w != slider.width()) {
     if (w < slider.width()) slider.width(w);	// Prevent to make slider dimensions bigger then original
     var newH = Math.round(slider.width()/w*h);
     slider.find('.slides').height(newH);
     slider.find('.slides li').height(newH);
     }
     //resizeIsotope();
}

// skills init
function skills_init(container) {
	if (arguments.length==0) var container = jQuery('body');
	var scrollPosition = jQuery(window).scrollTop() + jQuery(window).height();

	container.find('.sc_skills_item:not(.inited)').each(function () {
		var skillsItem = jQuery(this);
		var scrollSkills = skillsItem.offset().top;
		if (scrollPosition > scrollSkills) {
			skillsItem.addClass('inited');
			var skills = skillsItem.parents('.sc_skills').eq(0);
			var type = skills.data('type');
			var total = skillsItem.find('.sc_skills_total').eq(0);
			var start = parseInt(total.data('start'));
			var stop = parseInt(total.data('stop'));
			var maximum = parseInt(total.data('max'));
			var startPercent = Math.round(start/maximum*100);
			var stopPercent = Math.round(stop/maximum*100);
			var ed = total.data('ed');
			var duration = parseInt(total.data('duration'));
			var speed = parseInt(total.data('speed'));
			var step = parseInt(total.data('step'));
			if (type == 'bar') {
				var dir = skills.data('dir');
				var count = skillsItem.find('.sc_skills_count').eq(0);
				if (dir=='horizontal')
					count.css('width', startPercent + '%').animate({ width: stopPercent + '%' }, duration);
				else if (dir=='vertical')
					count.css('height', startPercent + '%').animate({ height: stopPercent + '%' }, duration);
				skills_counter(start, stop, speed-(dir!='unknown' ? 5 : 0), step, ed, total);
			} else if (type == 'counter') {
				skills_counter(start, stop, speed - 5, step, ed, total);
			} else if (type == 'pie') {
				var steps = parseInt(total.data('steps'));
				var color = total.data('color');
				var easing = total.data('easing');

				skills_counter(start, stop, Math.round(1500/steps), step, ed, total);

				var options = {
					segmentShowStroke: true,
					segmentStrokeColor: "#fff",
					segmentStrokeWidth: 0,
					animationSteps: steps,
					animationEasing: easing,
					animateRotate: true,
					animateScale: false,
                    percentageInnerCutout: 95
				};

				var pieData = [{
					value: stopPercent,
					color: color
				}, {
					value: 100 - stopPercent,
					color: "#f5f7f9"
				}];
				var canvas = skillsItem.find('canvas');
				canvas.attr({width: skillsItem.width(), height: skillsItem.width()}).css({width: skillsItem.width(), height: skillsItem.height()});
				//var pie = new Chart(canvas.get(0).getContext("2d")).Pie(pieData, options);
                var pie = new Chart(canvas.get(0).getContext("2d")).Doughnut(pieData,options);
			}
		}
	});
}

//skills counter animation
function skills_counter(start, stop, speed, step, ed, total) {
	start = Math.min(stop, start + step);
	total.text(start+ed);
	if (start < stop) {
		setTimeout(function () {
			skills_counter(start, stop, speed, step, ed, total);
		}, speed);
	}
}

//skills arc init
function skills_arc_init(container) {
	if (arguments.length==0) var container = jQuery('body');
	container.find('.sc_skills_arc:not(.inited)').each(function () {
		var arc = jQuery(this);
		arc.addClass('inited');
		var items = arc.find('.sc_skills_data .arc');
		var canvas = arc.find('.sc_skills_arc_canvas').eq(0);
		var legend = arc.find('.sc_skills_legend').eq(0);
		var w = Math.round(arc.width() - legend.width());
		var c = Math.floor(w/2);
		var o = {
			random: function(l, u){
				return Math.floor((Math.random()*(u-l+1))+l);
			},
			diagram: function(){
				var r = Raphael(canvas.attr('id'), w, w),
					rad = hover = Math.round(w/2/items.length),
					step = Math.round(((w-20)/2-rad)/items.length),
					stroke = Math.round(w/9/items.length),
					speed = 400;

				r.circle(c, c, Math.round(w/2)).attr({ stroke: 'none', fill: THEMEREX_theme_skin_bg ? THEMEREX_theme_skin_bg : '#ffffff' });

				var title = r.text(c, c, arc.data('subtitle')).attr({
					font: 'lighter '+Math.round(rad*0.8)+'px "'+THEMEREX_theme_font+'"',
					fill: '#232a34'
				}).toFront();

				rad -= Math.round(step/2);

				r.customAttributes.arc = function(value, color, rad){
					var v = 3.6 * value,
						alpha = v == 360 ? 359.99 : v,
						rand = o.random(91, 240),
						a = (rand-alpha) * Math.PI/180,
						b = rand * Math.PI/180,
						sx = c + rad * Math.cos(b),
						sy = c - rad * Math.sin(b),
						x = c + rad * Math.cos(a),
						y = c - rad * Math.sin(a),
						path = [['M', sx, sy], ['A', rad, rad, 0, +(alpha > 180), 1, x, y]];
					return { path: path, stroke: color }
				}

				items.each(function(i){
					var t = jQuery(this),
						color = t.find('.color').val(),
						value = t.find('.percent').val(),
						text = t.find('.text').text();

					rad += step;
					var z = r.path().attr({ arc: [value, color, rad], 'stroke-width': stroke });

					z.mouseover(function(){
						this.animate({ 'stroke-width': hover, opacity: .75 }, 1000, 'elastic');
						if (Raphael.type != 'VML') //solves IE problem
							this.toFront();
						title.stop().animate({ opacity: 0 }, speed, '>', function(){
							this.attr({ text: (text ? text + '\n' : '') + value + '%' }).animate({ opacity: 1 }, speed, '<');
						});
					}).mouseout(function(){
						this.stop().animate({ 'stroke-width': stroke, opacity: 1 }, speed*4, 'elastic');
						title.stop().animate({ opacity: 0 }, speed, '>', function(){
							title.attr({ text: arc.data('subtitle') }).animate({ opacity: 1 }, speed, '<');
						});
					});
				});

			}
		}
		o.diagram();
	});
}