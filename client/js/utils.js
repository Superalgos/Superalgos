//=============================================================
//==  Stylesheets manipulations
//=============================================================
function setStateStyleSheet(title, state) {
	"use strict";
	var i, a;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
			if (a.getAttribute("title") == title) a.disabled = !state;
    	}
  	}
}

function getStateStyleSheet(title, state) {
	"use strict";
	var i, a, rez=-1;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
			if (a.getAttribute("title") == title) {
				rez = a.disabled ? 0 : 1;
				break;
			}
    	}
  	}
	return rez;
}

function setActiveStyleSheet(title, disableOther) {
	"use strict";
	var i, a, main;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
			if (disableOther) a.disabled = true;
			if (a.getAttribute("title") == title) a.disabled = false;
    	}
  	}
}

function getActiveStyleSheet() {
	"use strict";
	var i, a;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title") && !a.disabled) return a.getAttribute("title");
	}
	return null;
}

function getPreferredStyleSheet() {
	"use strict";
	var i, a;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("rel").indexOf("alt") == -1 && a.getAttribute("title") )
			return a.getAttribute("title");
	}
	return null;
}


//=============================================================
//==  ListBox & ComboBox manipulations
//=============================================================
function addListBoxItem(box, val, text) {
	"use strict";
	var item = new Option();
	item.value = val;
	item.text = text;
    box.options.add(item);
}

function clearListBox(box) {
	"use strict";
	for (var i=box.options.length-1; i>=0; i--)
		box.options[i] = null;
}

function delListBoxItemByValue(box, val) {
	"use strict";
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].value == val) {
			box.options[i] = null;
			break;
		}
	}
}

function delListBoxItemByText(box, txt) {
	"use strict";
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].text == txt) {
			box.options[i] = null;
			break;
		}
	}
}

function findListBoxItemByValue(box, val) {
	"use strict";
	var idx = -1;
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].value == val) {
			idx = i;
			break;
		}
	}
	return idx;
}

function findListBoxItemByText(box, txt) {
	"use strict";
	var idx = -1;
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].text == txt) {
			idx = i;
			break;
		}
	}
	return idx;
}

function selectListBoxItemByValue(box, val) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		box.options[i].selected = (val == box.options[i].value);
	}
}

function selectListBoxItemByText(box, txt) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		box.options[i].selected = (txt == box.options[i].text);
	}
}

function getListBoxValues(box) {
	"use strict";
	var delim = arguments[1] ? arguments[1] : ',';
	var str = '';
	for (var i=0; i<box.options.length; i++) {
		str += (str ? delim : '') + box.options[i].value;
	}
	return str;
}

function getListBoxTexts(box) {
	"use strict";
	var delim = arguments[1] ? arguments[1] : ',';
	var str = '';
	for (var i=0; i<box.options.length; i++) {
		str += (str ? delim : '') + box.options[i].text;
	}
	return str;
}

function sortListBox(box)  {
	"use strict";
	var temp_opts = new Array();
	var temp = new Option();
	for(var i=0; i<box.options.length; i++)  {
		temp_opts[i] = box.options[i].clone();
	}
	for(var x=0; x<temp_opts.length-1; x++)  {
		for(var y=(x+1); y<temp_opts.length; y++)  {
			if(temp_opts[x].text > temp_opts[y].text)  {
				temp = temp_opts[x];
				temp_opts[x] = temp_opts[y];
				temp_opts[y] = temp;
			}
		}
	}
	for(var i=0; i<box.options.length; i++)  {
		box.options[i] = temp_opts[i].clone();
	}
}

function getListBoxSelectedIndex(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected)
			return i;
	}
	return -1;
}

function getListBoxSelectedValue(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected) {
			return box.options[i].value;
		}
	}
	return null;
}

function getListBoxSelectedText(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected) {
			return box.options[i].text;
		}
	}
	return null;
}

function getListBoxSelectedOption(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected) {
			return box.options[i];
		}
	}
	return null;
}


//=============================================================
//==  Radiobuttons manipulations
//=============================================================
function getRadioGroupValue(radioGroupObj) {
	"use strict";
	for (var i=0; i < radioGroupObj.length; i++)
		if (radioGroupObj[i].checked) return radioGroupObj[i].value;
	return null;
}

function setRadioGroupCheckedByNum(radioGroupObj, num) {
	"use strict";
	for (var i=0; i < radioGroupObj.length; i++)
		if (radioGroupObj[i].checked && i!=num) radioGroupObj[i].checked=false;
		else if (i==num) radioGroupObj[i].checked=true;
}

function setRadioGroupCheckedByValue(radioGroupObj, val) {
	"use strict";
	for (var i=0; i < radioGroupObj.length; i++)
		if (radioGroupObj[i].checked && radioGroupObj[i].value!=val) radioGroupObj[i].checked=false;
		else if (radioGroupObj[i].value==val) radioGroupObj[i].checked=true;
}


//=============================================================
//==  Array manipulations
//=============================================================
function sortArray(thearray)  {
	"use strict";
	var caseSensitive = arguments[1] ? arguments[1] : false;
	for (var x=0; x<thearray.length-1; x++)  {
		for (var y=(x+1); y<thearray.length; y++)  {
			if (caseSensitive) {
				if (thearray[x] > thearray[y])  {
					tmp = thearray[x];
					thearray[x] = thearray[y];
					thearray[y] = tmp;
				}
			} else {
				if (thearray[x].toLowerCase() > thearray[y].toLowerCase())  {
					tmp = thearray[x];
					thearray[x] = thearray[y];
					thearray[y] = tmp;
				}
			}
		}
	}
}


//=============================================================
//==  String functions
//=============================================================
function inList(list, str) {
	"use strict";
	var delim = arguments[2] ? arguments[2] : '|';
	var icase = arguments[3] ? arguments[3] : true;
	var retval = false;
	if (icase) {
		str = str.toLowerCase();
		list = list.toLowerCase();
	}
	var parts = list.split(delim);
	for (var i=0; i<parts.length; i++) {
		if (parts[i]==str) {
			retval=true;
			break;
		}
	}
	return retval;
}

function alltrim(str) {
	"use strict";
	var dir = arguments[1] ? arguments[1] : 'a';
	var rez = '';
	var i, start = 0, end = str.length-1;
	if (dir=='a' || dir=='l') {
		for (i=0; i<str.length; i++) {
			if (str.substr(i,1)!=' ') {
				start = i;
				break;
			}
		}
	}
	if (dir=='a' || dir=='r') {
		for (i=str.length-1; i>=0; i--) {
			if (str.substr(i,1)!=' ') {
				end = i;
				break;
			}
		}
	}
	return str.substring(start, end+1);
}

function ltrim(str) {
	"use strict";
	return alltrim(str, 'l');
}

function rtrim(str) {
	"use strict";
	return alltrim(str, 'r');
}

function padl(str, len) {
	"use strict";
	var ch = arguments[2] ? arguments[2] : ' ';
	var rez = str.substr(0,len);
	if (rez.length < len) {
		for (var i=0; i<len-str.length; i++)
			rez += ch;
	}
	return rez;
}

function padr(str, len) {
	"use strict";
	var ch = arguments[2] ? arguments[2] : ' ';
	var rez = str.substr(0,len);
	if (rez.length < len) {
		for (var i=0; i<len-str.length; i++)
			rez = ch + rez;
	}
	return rez;
}

function padc(str, len) {
	"use strict";
	var ch = arguments[2] ? arguments[2] : ' ';
	var rez = str.substr(0,len);
	if (rez.length < len) {
		for (var i=0; i<Math.floor((len-str.length)/2); i++)
			rez = ch + rez + ch;
	}
	return rez+(rez.length<len ? ch : '');
}

function replicate(str, num) {
	"use strict";
	var rez = '';
	for (var i=0; i<num; i++) {
		rez += str;
	}
	return rez;
}


//=============================================================
//==  Numbers functions
//=============================================================

// Clear number from any characters and append it with 0 to desired precision
function clearNumber(num) {
	"use strict";
	var precision = arguments[1] ? arguments[1] : 0;
	var defa = arguments[2] ? arguments[2] : 0;
	var res = '';
	var decimals = -1;
	num = ""+num;
	if (num=="") num=""+defa;
	for (var i=0; i<num.length; i++) {
		if (decimals==0) break;
		else if (decimals>0) decimals--;
		var ch = num.substr(i,1);
		if (ch=='.') {
			if (precision>0) {
				res += ch;
			}
			decimals = precision;
		} else if ((ch>=0 && ch<=9) || (ch=='-' && i==0))
			res+=ch;
	}
	if (precision>0 && decimals!=0) {
		if (decimals==-1) {
			res += '.';
			decimals = precision;
		}
		for (i=decimals; i>0; i--)
			res +='0';
	}
	//if (isNaN(res)) res = clearNumber(defa, precision, defa);
	return res;
}

function dec2hex(n) {
	"use strict";
	return Number(n).toString(16);
}

function hex2dec(hex) {
	"use strict";
	return parseInt(hex,16);
}

function roundNumber(num) {
	"use strict";
	var precision = arguments[1] ? arguments[1] : 0;
	var p = Math.pow(10,precision);
	return Math.round(num*p)/p;
}

//=============================================================
//==  Color manipulations
//=============================================================
function hex2rgb(hex) {
	hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
	return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
}

function rgb2hex(color) {
	"use strict";
	var aRGB;
	color = color.replace(/\s/g,"").toLowerCase();
	if (color=='rgba(0,0,0,0)' || color=='rgba(0%,0%,0%,0%)')
		color = 'transparent';
	if (color.indexOf('rgba(')==0)
		aRGB = color.match(/^rgba\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
	else
		aRGB = color.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);

	if(aRGB) {
		color = '';
		for (var i=1; i<=3; i++)
			color += Math.round((aRGB[i][aRGB[i].length-1]=="%"?2.55:1)*parseInt(aRGB[i])).toString(16).replace(/^(.)$/,'0$1');
	} else
		color = color.replace(/^#?([\da-f])([\da-f])([\da-f])$/i, '$1$1$2$2$3$3');
	return (color.substr(0,1)!='#' ? '#' : '') + color;
}

function _rgb2hex(r,g,b) {
	"use strict";
	return '#'+
		Number(r).toString(16).toUpperCase().replace(/^(.)$/,'0$1') +
		Number(g).toString(16).toUpperCase().replace(/^(.)$/,'0$1') +
		Number(b).toString(16).toUpperCase().replace(/^(.)$/,'0$1');
}

function hex2hsb(hex) {
	"use strict";
	return rgb2hsb(hex2rgb(hex));
}

function hsb2hex(hsb) {
	var rgb = hsb2rgb(hsb);
	return _rgb2hex(rgb.r, rgb.g, rgb.b);
}

function rgb2hsb(rgb) {
	"use strict";
	var hsb = {};
	hsb.b = Math.max(Math.max(rgb.r,rgb.g),rgb.b);
	hsb.s = (hsb.b <= 0) ? 0 : Math.round(100*(hsb.b - Math.min(Math.min(rgb.r,rgb.g),rgb.b))/hsb.b);
	hsb.b = Math.round((hsb.b /255)*100);
	if ((rgb.r==rgb.g) && (rgb.g==rgb.b))  hsb.h = 0;
	else if (rgb.r>=rgb.g && rgb.g>=rgb.b) hsb.h = 60*(rgb.g-rgb.b)/(rgb.r-rgb.b);
	else if (rgb.g>=rgb.r && rgb.r>=rgb.b) hsb.h = 60  + 60*(rgb.g-rgb.r)/(rgb.g-rgb.b);
	else if (rgb.g>=rgb.b && rgb.b>=rgb.r) hsb.h = 120 + 60*(rgb.b-rgb.r)/(rgb.g-rgb.r);
	else if (rgb.b>=rgb.g && rgb.g>=rgb.r) hsb.h = 180 + 60*(rgb.b-rgb.g)/(rgb.b-rgb.r);
	else if (rgb.b>=rgb.r && rgb.r>=rgb.g) hsb.h = 240 + 60*(rgb.r-rgb.g)/(rgb.b-rgb.g);
	else if (rgb.r>=rgb.b && rgb.b>=rgb.g) hsb.h = 300 + 60*(rgb.r-rgb.b)/(rgb.r-rgb.g);
	else 								   hsb.h = 0;
	hsb.h = Math.round(hsb.h);
	return hsb;
}

function hsb2rgb(hsb) {
	var rgb = {};
	var h = Math.round(hsb.h);
	var s = Math.round(hsb.s*255/100);
	var v = Math.round(hsb.b*255/100);
	if (s == 0) {
		rgb.r = rgb.g = rgb.b = v;
	} else {
		var t1 = v;
		var t2 = (255-s)*v/255;
		var t3 = (t1-t2)*(h%60)/60;
		if (h==360) h = 0;
		if (h<60) 		{ rgb.r=t1;	rgb.b=t2;   rgb.g=t2+t3; }
		else if (h<120) { rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3; }
		else if (h<180) { rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3; }
		else if (h<240) { rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3; }
		else if (h<300) { rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3; }
		else if (h<360) { rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3; }
		else 			{ rgb.r=0;  rgb.g=0;	rgb.b=0;	 }
	}
	return { r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b) };
}

function split_rgb(color) {
	"use strict";
	color = rgb2hex(color);
	var matches = color.match(/^#?([\dabcdef]{2})([\dabcdef]{2})([\dabcdef]{2})$/i);
	if (!matches) return false;
	for (var i=1, rgb = new Array(3); i<=3; i++)
		rgb[i-1] = parseInt(matches[i],16);
	return rgb;
}

function iColorPicker(){
	"use strict";
	var id = arguments[0] ? arguments[0] : "iColorPicker"+Math.round(Math.random()*1000);
	var colors = arguments[1] ? arguments[1] :
	'#f00,#ff0,#0f0,#0ff,#00f,#f0f,#fff,#ebebeb,#e1e1e1,#d7d7d7,#cccccc,#c2c2c2,#b7b7b7,#acacac,#a0a0a0,#959595,'
	+'#ee1d24,#fff100,#00a650,#00aeef,#2f3192,#ed008c,#898989,#7d7d7d,#707070,#626262,#555,#464646,#363636,#262626,#111,#000,'
	+'#f7977a,#fbad82,#fdc68c,#fff799,#c6df9c,#a4d49d,#81ca9d,#7bcdc9,#6ccff7,#7ca6d8,#8293ca,#8881be,#a286bd,#bc8cbf,#f49bc1,#f5999d,'
	+'#f16c4d,#f68e54,#fbaf5a,#fff467,#acd372,#7dc473,#39b778,#16bcb4,#00bff3,#438ccb,#5573b7,#5e5ca7,#855fa8,#a763a9,#ef6ea8,#f16d7e,'
	+'#ee1d24,#f16522,#f7941d,#fff100,#8fc63d,#37b44a,#00a650,#00a99e,#00aeef,#0072bc,#0054a5,#2f3192,#652c91,#91278f,#ed008c,#ee105a,'
	+'#9d0a0f,#a1410d,#a36209,#aba000,#588528,#197b30,#007236,#00736a,#0076a4,#004a80,#003370,#1d1363,#450e61,#62055f,#9e005c,#9d0039,'
	+'#790000,#7b3000,#7c4900,#827a00,#3e6617,#045f20,#005824,#005951,#005b7e,#003562,#002056,#0c004b,#30004a,#4b0048,#7a0045,#7a0026';
	var colorsList = colors.split(',');
	var tbl = '<table class="colorPickerTable"><thead>';
	for (var i=0; i<colorsList.length; i++) {
		if (i%16==0) tbl += (i>0 ? '</tr>' : '') + '<tr>';
		tbl += '<td style="background-color:'+colorsList[i]+'">&nbsp;</td>';
	}
	tbl += '</tr></thead><tbody>'
		+ '<tr style="height:60px;">'
		+ '<td colspan="8" id="'+id+'_colorPreview" style="vertical-align:middle;text-align:center;border:1px solid #000;background:#fff;">'
		+ '<input style="width:55px;color:#000;border:1px solid rgb(0, 0, 0);padding:5px;background-color:#fff;font:11px Arial, Helvetica, sans-serif;" maxlength="7" />'
		+ '<a href="#" id="'+id+'_moreColors" class="iColorPicker_moreColors"></a>'
		+ '</td>'
		+ '<td colspan="8" id="'+id+'_colorOriginal" style="vertical-align:middle;text-align:center;border:1px solid #000;background:#fff;">'
		+ '<input style="width:55px;color:#000;border:1px solid rgb(0, 0, 0);padding:5px;background-color:#fff;font:11px Arial, Helvetica, sans-serif;" readonly="readonly" />'
		+ '</td>'
		+ '</tr></tbody></table>';
	//tbl += '<style>#iColorPicker input{margin:2px}</style>';

	jQuery(document.createElement("div"))
		.attr("id", id)
		.css('display','none')
		.html(tbl)
		.appendTo("body")
		.addClass("iColorPickerTable")
		.on('mouseover', 'thead td', function(){
			"use strict";
			var aaa=rgb2hex(jQuery(this).css('background-color'));
			jQuery('#'+id+'_colorPreview').css('background',aaa);
			jQuery('#'+id+'_colorPreview input').val(aaa);
		})
		.on('keypress', '#'+id+'_colorPreview input', function(key){
			"use strict";
			var aaa=jQuery(this).val()
			if (aaa.length<7 && ((key.which>=48 && key.which<=57) || (key.which>=97 && key.which<=102) || (key.which===35 || aaa.length===0))) {
				aaa += String.fromCharCode(key.which);
			} else if (key.which == 8 && aaa.length>0) {
				aaa = aaa.substring(0, aaa.length-1);
			} else if (key.which===13 && (aaa.length===4 || aaa.length===7)) {
				var fld  = jQuery('#'+id).data('field');
				var func = jQuery('#'+id).data('func');
				if (func!=null && func!='undefined') {
					func(fld, aaa);
				} else {
					fld.val(aaa).css('backgroundColor', aaa).trigger('change');
				}
				jQuery('#'+id+'_Bg').fadeOut(500);
				jQuery('#'+id).fadeOut(500);

			} else {
				key.preventDefault();
				return false;
			}
			if (aaa.substr(0,1)==='#' && (aaa.length===4 || aaa.length===7)) {
				jQuery('#'+id+'_colorPreview').css('background',aaa);
			}
		})
		.on('click', 'thead td', function(e){
			"use strict";
			var fld  = jQuery('#'+id).data('field');
			var func = jQuery('#'+id).data('func');
			var aaa  = rgb2hex(jQuery(this).css('background-color'));
			if (func!=null && func!='undefined') {
				func(fld, aaa);
			} else {
				fld.val(aaa).css('backgroundColor', aaa).trigger('change');
			}
			jQuery('#'+id+'_Bg').fadeOut(500);
			jQuery('#'+id).fadeOut(500);
			e.preventDefault();
			return false;
		})
		.on('click', 'tbody .iColorPicker_moreColors', function(e){
			"use strict";
			var thead  = jQuery(this).parents('table').find('thead');
			var out = '';
			if (thead.hasClass('more_colors')) {
				for (var i=0; i<colorsList.length; i++) {
					if (i%16==0) out += (i>0 ? '</tr>' : '') + '<tr>';
					out += '<td style="background-color:'+colorsList[i]+'">&nbsp;</td>';
				}
				thead.removeClass('more_colors').empty().html(out+'</tr>');
				jQuery('#'+id+'_colorPreview').attr('colspan', 8);
				jQuery('#'+id+'_colorOriginal').attr('colspan', 8);
			} else {
				var rgb=[0,0,0], i=0, j=-1;	// Set j=-1 or j=0 - show 2 different colors layouts
				while (rgb[0]<0xF || rgb[1]<0xF || rgb[2]<0xF) {
					if (i%18==0) out += (i>0 ? '</tr>' : '') + '<tr>';
					i++;
					out += '<td style="background-color:'+_rgb2hex(rgb[0]*16+rgb[0],rgb[1]*16+rgb[1],rgb[2]*16+rgb[2])+'">&nbsp;</td>';
					rgb[2]+=3;
					if (rgb[2]>0xF) {
						rgb[1]+=3;
						if (rgb[1]>(j===0 ? 6 : 0xF)) {
							rgb[0]+=3;
							if (rgb[0]>0xF) {
								if (j===0) {
									j=1;
									rgb[0]=0;
									rgb[1]=9;
									rgb[2]=0;
								} else {
									break;
								}
							} else {
								rgb[1]=(j < 1 ? 0 : 9);
								rgb[2]=0;
							}
						} else {
							rgb[2]=0;
						}
					}
				}
				thead.addClass('more_colors').empty().html(out+'<td  style="background-color:#ffffff" colspan="8">&nbsp;</td></tr>');
				jQuery('#'+id+'_colorPreview').attr('colspan', 9);
				jQuery('#'+id+'_colorOriginal').attr('colspan', 9);
			}
			jQuery('#'+id+' table.colorPickerTable thead td')
				.css({
					'width':'12px',
					'height':'14px',
					'border':'1px solid #000',
					'cursor':'pointer'
				});
			e.preventDefault();
			return false;
		});
	jQuery(document.createElement("div"))
		.attr("id", id+"_Bg")
		.click(function(e) {
			"use strict";
			jQuery("#"+id+"_Bg").fadeOut(500);
			jQuery("#"+id).fadeOut(500);
			e.preventDefault();
			return false;
		})
		.appendTo("body");
	jQuery('#'+id+' table.colorPickerTable thead td')
		.css({
			'width':'12px',
			'height':'14px',
			'border':'1px solid #000',
			'cursor':'pointer'
		});
	jQuery('#'+id+' table.colorPickerTable')
		.css({'border-collapse':'collapse'});
	jQuery('#'+id)
		.css({
			'border':'1px solid #ccc',
			'background':'#333',
			'padding':'5px',
			'color':'#fff',
			'z-index':999999
		});
	jQuery('#'+id+'_colorPreview')
		.css({'height':'50px'});
	return id;
}

function iColorShow(id, fld, func) {
	"use strict";
	if (id===null || id==='') {
		id = jQuery('.iColorPickerTable').attr('id');
	}
	var eICP = fld.offset();
	var w = jQuery('#'+id).width();
	var h = jQuery('#'+id).height();
	var l = eICP.left + w < jQuery(window).width()-10 ? eICP.left : jQuery(window).width()-10 - w;
	var t = eICP.top + fld.outerHeight() + h < jQuery(document).scrollTop() + jQuery(window).height()-10 ? eICP.top + fld.outerHeight() : eICP.top - h - 13;
	jQuery("#"+id)
		.data({field: fld, func: func})
		.css({
			'top':t+"px",
			'left':l+"px",
			'position':'absolute',
			'z-index':100001
		})
		.fadeIn(500);
	jQuery("#"+id+"_Bg")
		.css({
			'position':'fixed',
			'z-index':100000,
			'top':0,
			'left':0,
			'width':'100%',
			'height':'100%'
		})
		.fadeIn(500);
	var def = fld.val().substr(0, 1)=='#' ? fld.val() : rgb2hex(fld.css('backgroundColor'));
	jQuery('#'+id+'_colorPreview input,#'+id+'_colorOriginal input').val(def);
	jQuery('#'+id+'_colorPreview,#'+id+'_colorOriginal').css('background',def);
}


//=============================================================
//==  Cookies manipulations
//=============================================================
function getCookie(name) {
	"use strict";
	var defa = arguments[1]!='undefined' ? arguments[1] : null;
	var start = document.cookie.indexOf(name + '=');
	var len = start + name.length + 1;
	if ((!start) && (name != document.cookie.substring(0, name.length))) {
		return defa;
	}
	if (start == -1)
		return defa;
	var end = document.cookie.indexOf(';', len);
	if (end == -1)
		end = document.cookie.length;
	return unescape(document.cookie.substring(len, end));
}


function setCookie(name, value, expires, path, domain, secure) {
	"use strict";
	var today = new Date();
	today.setTime(today.getTime());
	if (expires) {
		expires = expires * 1000;		// * 60 * 60 * 24;
	}
	var expires_date = new Date(today.getTime() + (expires));
	document.cookie = name + '='
			+ escape(value)
			+ ((expires) ? ';expires=' + expires_date.toGMTString() : '')
			+ ((path)    ? ';path=' + path : '')
			+ ((domain)  ? ';domain=' + domain : '')
			+ ((secure)  ? ';secure' : '');
}


function deleteCookie(name, path, domain) {
	"use strict";
	if (getCookie(name))
		document.cookie = name + '=' + ((path) ? ';path=' + path : '')
				+ ((domain) ? ';domain=' + domain : '')
				+ ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}


//=============================================================
//==  Date manipulations
//=============================================================

// Return array[Year, Month, Day, Hours, Minutes, Seconds]
// from string: Year[-/.]Month[-/.]Day[T ]Hours:Minutes:Seconds
function dateParse(dt) {
	"use strict";
	dt = dt.replace(/\//g, '-').replace(/\./g, '-').replace(/T/g, ' ').split('+')[0];
	var dt2 = dt.split(' ');
	var d = dt2[0].split('-');
	var t = dt2[1].split(':');
	d.push(t[0], t[1], t[2]);
	return d;
}

function dateDifference(dt1) {
	"use strict";
	var dt2 = arguments[1]!==undefined ? arguments[1] : '';
	var short_date = arguments[2]!==undefined ? arguments[2] : true;
	var sec = arguments[3]!==undefined ? arguments[3] : false;
	var a1 = dateParse(dt1);
	dt1 = Date.UTC(a1[0], a1[1], a1[2], a1[3], a1[4], a1[5]);
	if (dt2 == '') {
		dt2 = new Date();
		var a2 = [dt2.getFullYear(), dt2.getMonth()+1, dt2.getDate(), dt2.getHours(), dt2.getMinutes(), dt2.getSeconds()];
	} else
		var a2 = dateParse(dt2);
	dt2 = Date.UTC(a2[0], a2[1], a2[2], a2[3], a2[4], a2[5]);
	var diff = Math.round((dt2 - dt1)/1000);
	var days = Math.floor(diff / (24*3600));
	diff -= days * 24 * 3600;
	var hours = Math.floor(diff / 3600);
	diff -= hours * 3600;
	var minutes = Math.floor(diff / 60);
	diff -= minutes * 60;
	rez = '';
	if (days > 0)
		rez += (rez!='' ? ' ' : '') + days + ' day' + (days > 1 ? 's' : '');
	if ((!short_date || rez=='') && hours > 0)
		rez += (rez!='' ? ' ' : '') + hours + ' hour' + (hours > 1 ? 's' : '');
	if ((!short_date || rez=='') && minutes > 0)
		rez +=  (rez!='' ? ' ' : '') + minutes + ' minute' + (minutes > 1 ? 's' : '');
	if (sec || rez=='')
		rez +=  rez!='' || sec ? (' ' + diff + ' second' + (diff > 1 ? 's' : '')) : 'less then minute';
	return rez;
}



//=============================================================
//==  Form validation
//=============================================================

/*		// Usage example:
		var error = formValidate(jQuery(form_selector), {				// -------- Options
			error_message_show: true,									// Display or not error message
			error_message_time: 5000,									// Time to display error message
			error_message_class: 'sc_infobox sc_infobox_style_error',	// Class, appended to error message block
			error_message_text: 'Global error text',					// Global error message text (if don't write message in checked field)
			error_fields_class: 'error_fields_class',					// Class, appended to error fields
			exit_after_first_error: false,								// Cancel validation and exit after first error
			rules: [
				{
					field: 'author',																// Checking field name
					min_length: { value: 1,	 message: 'The author name can\'t be empty' },			// Min character count (0 - don't check), message - if error occurs
					max_length: { value: 60, message: 'Too long author name'}						// Max character count (0 - don't check), message - if error occurs
				},
				{
					field: 'email',
					min_length: { value: 7,	 message: 'Too short (or empty) email address' },
					max_length: { value: 60, message: 'Too long email address'},
					mask: { value: '^([a-z0-9_\\-]+\\.)*[a-z0-9_\\-]+@[a-z0-9_\\-]+(\\.[a-z0-9_\\-]+)*\\.[a-z]{2,6}$', message: 'Invalid email address'}
				},
				{
					field: 'comment',
					min_length: { value: 1,	 message: 'The comment text can\'t be empty' },
					max_length: { value: 200, message: 'Too long comment'}
				},
				{
					field: 'pwd1',
					min_length: { value: 5,	 message: 'The password can\'t be less then 5 characters' },
					max_length: { value: 20, message: 'Too long password'}
				},
				{
					field: 'pwd2',
					equal_to: { value: 'pwd1',	 message: 'The passwords in both fields must be equals' }
				}
			]
		});
*/

function formValidate(form, opt) {
	"use strict";
	var error_msg = '';
	form.find(":input").each(function() {
		"use strict";
		if (error_msg!='' && opt.exit_after_first_error) return;
		for (var i = 0; i < opt.rules.length; i++) {
			if (jQuery(this).attr("name") == opt.rules[i].field) {
				var val = jQuery(this).val();
				var error = false;
				if (typeof(opt.rules[i].min_length) == 'object') {
					if (opt.rules[i].min_length.value > 0 && val.length < opt.rules[i].min_length.value) {
						if (error_msg=='') jQuery(this).get(0).focus();
						error_msg += '<p class="error_item">' + (typeof(opt.rules[i].min_length.message)!='undefined' ? opt.rules[i].min_length.message : opt.error_message_text ) + '</p>'
						error = true;
					}
				}
				if ((!error || !opt.exit_after_first_error) && typeof(opt.rules[i].max_length) == 'object') {
					if (opt.rules[i].max_length.value > 0 && val.length > opt.rules[i].max_length.value) {
						if (error_msg=='') jQuery(this).get(0).focus();
						error_msg += '<p class="error_item">' + (typeof(opt.rules[i].max_length.message)!='undefined' ? opt.rules[i].max_length.message : opt.error_message_text ) + '</p>'
						error = true;
					}
				}
				if ((!error || !opt.exit_after_first_error) && typeof(opt.rules[i].mask) == 'object') {
					if (opt.rules[i].mask.value != '') {
						var regexp = new RegExp(opt.rules[i].mask.value);
						if (!regexp.test(val)) {
							if (error_msg=='') jQuery(this).get(0).focus();
							error_msg += '<p class="error_item">' + (typeof(opt.rules[i].mask.message)!='undefined' ? opt.rules[i].mask.message : opt.error_message_text ) + '</p>'
							error = true;
						}
					}
				}
				if ((!error || !opt.exit_after_first_error) && typeof(opt.rules[i].equal_to) == 'object') {
					if (opt.rules[i].equal_to.value != '' && val!=jQuery(jQuery(this).get(0).form[opt.rules[i].equal_to.value]).val()) {
						if (error_msg=='') jQuery(this).get(0).focus();
						error_msg += '<p class="error_item">' + (typeof(opt.rules[i].equal_to.message)!='undefined' ? opt.rules[i].equal_to.message : opt.error_message_text ) + '</p>'
						error = true;
					}
				}
				if (opt.error_fields_class != '') jQuery(this).toggleClass(opt.error_fields_class, error);
			}
		}
	});
	if (error_msg!='' && opt.error_message_show) {
		THEMEREX_error_msg_box = form.find(".result");
		if (THEMEREX_error_msg_box.length == 0) {
			form.append('<div class="result"></div>');
			THEMEREX_error_msg_box = form.find(".result");
		}
		if (opt.error_message_class) THEMEREX_error_msg_box.toggleClass(opt.error_message_class, true);
		THEMEREX_error_msg_box.html(error_msg).fadeIn();
		setTimeout(function() { THEMEREX_error_msg_box.fadeOut(); }, opt.error_message_time);
	}
	return error_msg!='';
}




//=============================================================
//==  Document manipulations
//=============================================================

// Animated scroll to selected id
function animateTo(id) {
	if (id.indexOf('#')==-1) id = '#' + id;
	var obj = jQuery(id).eq(0);
	if (obj.length == 0) return;
	var oft = jQuery(id).offset().top;
	var st  = jQuery(window).scrollTop();
	var speed = Math.min(1600, Math.max(400, Math.round(Math.abs(oft-st) / jQuery(window).height() * 100)));
	jQuery('body,html').animate( {scrollTop: oft - jQuery('#wpadminbar').height() - jQuery('header.fixedTopMenu .topWrap').height()}, speed, 'swing');
}

// Change browser address without reload page
function setLocation(curLoc){
	try {
		history.pushState(null, null, curLoc);
		return;
	} catch(e) {}
	location.href = curLoc;
}




//=============================================================
//==  Browser detection
//=============================================================
function isMobile() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}
function isiOS() {
	return navigator.userAgent.match(/iPad|iPhone|iPod/i) != null;
}




//=============================================================
//==  File functions
//=============================================================
function getFileName(path) {
	path = path.replace(/\\/g, '/');
	var pos = path.lastIndexOf('/');
	if (pos >= 0)
		path = path.substr(pos+1);
	return path;
}

function getFileExt(path) {
	var pos = path.lastIndexOf('.');
	path = pos >= 0 ? path.substr(pos+1) : '';
	return path;
}




//=============================================================
//==  PHP-style functions
//=============================================================
function isset(obj) {
	return obj != undefined;
}

function empty(obj) {
	return obj == undefined || (typeof(obj)=='object' && obj == null) || (typeof(obj)=='array' && obj.length == 0) || (typeof(obj)=='string' && alltrim(obj)=='');
}

function is_array(obj)  {
	"use strict";
	return typeof(obj)=='array';
}

function is_object(obj)  {
	"use strict";
	return typeof(obj)=='object';
}

function in_array(val, thearray)  {
	"use strict";
	var rez = false;
	for (var x=0; x<thearray.length-1; x++)  {
		if (thearray[x] == val)  {
			rez = true;
			break;
		}
	}
	return rez;
}

function clone(obj) {
	if (obj == null || typeof(obj) != 'object') {
		return obj;
	}
	var temp = {};
	for (var key in obj) {
		temp[key] = clone(obj[key]);
	}
	return temp;
}



//=============================================================
//==  Debug functions
//=============================================================
function objDisplay(obj) {
	"use strict";
	var html = arguments[1] ? arguments[1] : false;				// Tags decorate
	var recursive = arguments[2] ? arguments[2] : false;		// Show inner objects (arrays)
	var showMethods = arguments[3] ? arguments[3] : false;		// Show object's methods
	var level = arguments[4] ? arguments[4] : 0;				// Nesting level (for internal usage only)
	var dispStr = "";
	var addStr = "";
	if (level>0) {
		dispStr += (obj===null ? "null" : typeof(obj)) + (html ? "\n<br />" : "\n");
		addStr = replicate(html ? '&nbsp;' : ' ', level*2);
	}
	if (obj!==null) {
		for (var prop in obj) {
			if (!showMethods && typeof(obj[prop])=='function')	// || prop=='innerHTML' || prop=='outerHTML' || prop=='innerText' || prop=='outerText')
				continue;
			if (recursive && (typeof(obj[prop])=='object' || typeof(obj[prop])=='array') && obj[prop]!=obj)
				dispStr += addStr + (html ? "<b>" : "")+prop+(html ? "</b>" : "")+'='+objDisplay(obj[prop], html, recursive, showMethods, level+1);
			else
				dispStr += addStr + (html ? "<b>" : "")+prop+(html ? "</b>" : "")+'='+(typeof(obj[prop])=='string' ? '"' : '')+obj[prop]+(typeof(obj[prop])=='string' ? '"' : '')+(html ? "\n<br />" : "\n");
		}
	}
	return dispStr;
}

function cl(s) { console.log(s); }
function cd(s) { console.log(objDisplay(s)); }
function al(s) { if (typeof THEMEREX_userLoggedIn != 'undefined' && THEMEREX_userLoggedIn) alert(s); }
function ad(s) { if (typeof THEMEREX_userLoggedIn != 'undefined' && THEMEREX_userLoggedIn) alert(objDisplay(s)); }
function dl(s) {
	if (typeof THEMEREX_userLoggedIn != 'undefined' && THEMEREX_userLoggedIn) {
		if (jQuery('#debugLog').length == 0) jQuery('body').append('<div id="debugLog"><span id="debugLogClose" onclick="jQuery(\'#debugLog\').hide();jQuery(\'#debugLogContent\').empty();">x</span><div id="debugLogContent"></div></div>');
		jQuery('#debugLogContent').append('<br>'+s);
		jQuery('#debugLog').show();
	}
}
function dd(s) {
	if (typeof THEMEREX_userLoggedIn != 'undefined' && THEMEREX_userLoggedIn) {
		if (jQuery('#debugLog').length == 0) jQuery('body').append('<div id="debugLog"><span id="debugLogClose" onclick="jQuery(\'#debugLog\').hide();">x</span><div id="debugLogContent"></div></div>');
		jQuery('#debugLogContent').html(objDisplay(s));
		jQuery('#debugLog').show();
	}
}




//=============================================================
//==  smartresize
//=============================================================
(function($,sr){
    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            };

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 500);
        };
    }
    // smartresize
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');