var THEMEREX_validateForm = null;

function userSubmitForm(form, url, nonce){
	"use strict";
	var error = false;
	var form_custom = form.data('formtype')=='custom';
	if (!form_custom) {
		error = formValidate(form, {
			error_message_show: true,
			error_message_time: 5000,
			error_message_class: "sc_infobox sc_infobox_style_error",
			error_fields_class: "error_fields_class",
			exit_after_first_error: false,
			rules: [
				{
					field: "username",
					min_length: { value: 1,	 message: THEMEREX_NAME_EMPTY },
					max_length: { value: 60, message: THEMEREX_NAME_LONG}
				},
				{
					field: "email",
					min_length: { value: 7,	 message: THEMEREX_EMAIL_EMPTY },
					max_length: { value: 60, message: THEMEREX_EMAIL_LONG},
					mask: { value: THEMEREX_EMAIL_MASK, message: THEMEREX_EMAIL_NOT_VALID}
				},
				{
					field: "message",
					min_length: { value: 1,  message: THEMEREX_MESSAGE_EMPTY },
					max_length: { value: THEMEREX_msg_maxlength_contacts, message: THEMEREX_MESSAGE_LONG}
				}
			]
		});
	}
	if (!error && url!='#') {
		THEMEREX_validateForm = form;
		var data = {
			action: "send_contact_form",
			nonce: nonce,
			type: form_custom ? 'custom' : 'contact',
			data: form.serialize()
		};
		jQuery.post(url, data, userSubmitFormResponse, "text");
	}
}
	
function userSubmitFormResponse(response) {
	"use strict";
	var rez = JSON.parse(response);
	var result = THEMEREX_validateForm.find(".result")
		.toggleClass("sc_infobox_style_error", false)
		.toggleClass("sc_infobox_style_success", false);
	if (rez.error == "") {
		result.addClass("sc_infobox_style_success").html(THEMEREX_SEND_COMPLETE);
		setTimeout(function () {
			result.fadeOut();
			THEMEREX_validateForm.get(0).reset();
			}, 3000);
	} else {
		result.addClass("sc_infobox_style_error").html(THEMEREX_SEND_ERROR + ' ' + rez.error);
	}
	result.fadeIn();}



// Order Form
function orderSubmitForm(theForm, orderForm, url, nonce){
    "use strict";
    if (url!='#') {
        THEMEREX_validateForm = theForm;
        var data = {
            action: "send_contact_form",
            nonce: nonce,
            type: 'okorder',
            data: orderForm.serialize()
        };
        jQuery.post(url, data, orderSubmitFormResponse, "text");
    }
}

function orderSubmitFormResponse(response) {
    "use strict";
    var rez = JSON.parse(response);
    classie.addClass( THEMEREX_validateForm.querySelector( ".simform-inner" ), "hide" );
    classie.addClass( THEMEREX_validateForm.querySelector( ".continue_button" ), "hide" );
    var messageEl = THEMEREX_validateForm.querySelector( ".final-message" );
    if (rez.error == "") {
        messageEl.innerHTML = THEMEREX_SEND_ORDER_COMPLETE;
    } else {
        messageEl.innerHTML =  THEMEREX_SEND_ORDER_COMPLETE;
    }
    classie.addClass( messageEl, "show" );

    jQuery('.sc_contact_form_order .dots > span').addClass('answered');
}