jQuery( document ).ready(function($) {
    $("#email-signup").on('submit', function(e) {
        e.preventDefault();
        $("#email-submit").prop('disabled', true);
        $("#email-submit span").toggle();
        var email = $("#signup_email").val();
        $.ajax({
            type: "GET",
            url: "https://aa-sendgrid-signup.azurewebsites.net/api/sendverify/" + email + '?callback=?',
            crossDomain: true,
            dataType: 'jsonp',
          success: function (response, status) {
            //console.log('success', response, status);
            $('#email-signup').trigger("reset");
            $('.message').html("Please check your inbox to confirm your email address. In case you can not find the confirmation email, please check your trash or junk mail folder.");
            $('.message').fadeIn(1000).delay(5000).fadeOut(1000);
            $('.message').addClass("text-success");
            $("#email-submit").prop('disabled', false);
            $("#email-submit span").hide();
           },
           error: function (xOptions, textStatus) {
             if (textStatus === 'parsererror' && xOptions.status >= 200 && xOptions.status <= 300){
               $('#email-signup').trigger("reset");
               $('.message').html("Please check your inbox to confirm your email address. In case you can not find the confirmation email, please check your trash or junk mail folder.");
               $('.message').fadeIn(1000).delay(5000).fadeOut(1000);
               $('.message').addClass("text-success");
               $("#email-submit").prop('disabled', false);
               $("#email-submit span").hide();
             } else {
               $('#email-signup').trigger("reset");
               $('.message').html("Error: " + textStatus + ": " + xOptions.statusText);
               $('.message').fadeIn(1000).delay(5000).fadeOut(1000);
               $('.message').addClass("text-danger");
               $("#email-submit").prop('disabled', false);
               $("#email-submit span").hide();
             }
           }
          });
        return;
    });
});
