jQuery( document ).ready(function($) {
    $(".contact_1").on('submit', function(e) {
        e.preventDefault();
        $(".contact_form_submit").prop('disabled', true);
        $(".contact_form_submit span").toggle();
        var email = encodeURI($("#contact_form_email").val());
        var name = encodeURI($("#contact_form_name").val());
        var message = $("#contact_form_message").val();
        var changePeriod = message.replace(/\./g, '[PERIOD]');
        var changeSlash = changePeriod.replace(/\//g, '[FORWARDSLASH]');
        message = encodeURI(changeSlash);
        var recaptcha = encodeURI($("#g-recaptcha-response").val());
        var dev = 'false';

        var url = 'https://aa-sendgrid-signup.azurewebsites.net/api/sendcontact/';
        $.ajax({
            type: "GET",
            url: url + email + '/' + name + '/' + message + '/' + recaptcha + '/' + dev,
            crossDomain: true,
            dataType: 'jsonp',
          success: function (response, status) {
            //console.log('success', response, status);
            $('.contact_1').trigger("reset");
            $('.message').html("Thank you for contacting us! We will be in touch soon.");
            $('.message').fadeIn(1000).delay(5000).fadeOut(1000);
            $('.message').addClass("text-success");
            $(".contact_form_submit").prop('disabled', false);
            $(".contact_form_submit span").hide();
           },
           error: function (xOptions, textStatus) {
             if (textStatus === 'parsererror' && xOptions.status >= 200 && xOptions.status <= 300){
               $('.contact_1').trigger("reset");
               $('.message').html("Thank you for contacting us! We will be in touch soon.");
               $('.message').fadeIn(1000).delay(5000).fadeOut(1000);
               $('.message').addClass("text-success");
               $(".contact_form_submit").prop('disabled', false);
               $(".contact_form_submit span").hide();
             } else {
               $('.contact_1').trigger("reset");
               $('.message').html("Error: " + textStatus + ": " + xOptions.statusText);
               $('.message').fadeIn(1000).delay(5000).fadeOut(1000);
               $('.message').addClass("text-danger");
               $(".contact_form_submit").prop('disabled', false);
               $(".contact_form_submit span").hide();
             }
           }
          });
        return;
    });
});
