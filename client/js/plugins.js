"use strict";
jQuery(document).ready(function() {

    // 2/3/4th level menu  offscreen fix
    var MainWindowWidth = jQuery(window).width();
    jQuery(window).resize(function(){
        MainWindowWidth = jQuery(window).width();
    });
    jQuery('#mainmenu ul li').mouseover(function(){
        if(MainWindowWidth > 767) {
            // checks if third level menu exist         
            var subMenuExist = jQuery(this).find('ul').length;            
            if( subMenuExist > 0){
                var subMenuWidth = jQuery(this).find('ul').width();
                var subMenuOffset = jQuery(this).find('ul').parent().offset().left + subMenuWidth;
                // if sub menu is off screen, give new position
                if((subMenuOffset + subMenuWidth) > MainWindowWidth){                  
                    var newSubMenuPosition = subMenuWidth + 0;
                    $(this).find('ul').first().css({
                        left: -newSubMenuPosition,
                        //top: '10px',
                    });
                } else {
                    $(this).find('ul').first().css({
                        left: '100%',
                        //top: '10px',
                    });

                }
            }
        }
    });
});


$( function() {
    // init Isotope
    var $container = $('#isotope_container');
        if ($container.length) {
            $container.imagesLoaded( function() {
                $container.isotope({
                    itemSelector: '.isotope-item',
                    layoutMode: 'fitRows'
                });
            });
        };

    // bind filter click
    $('#isotope_filters').on( 'click', 'a', function( e ) {
        e.preventDefault();
        var filterValue = $( this ).attr('data-filter');
        // use filterFn if matches value
        // filterValue = filterFns[ filterValue ] || filterValue;
        $container.isotope({ filter: filterValue });
    });
    // change is-checked class on buttons
    $('#isotope_filters').each( function( i, filters ) {
        var $filters = $( filters );
        $filters.on( 'click', 'a', function() {
            $filters.find('.is-checked').removeClass('is-checked');
            $( this ).addClass('is-checked');
        });
    });

});