    //googlemap button
    if (jQuery('.footerContentWrap > .googlemap_button').length > 0) {
        jQuery('.footerContentWrap').on('click', '.googlemap_button', function () {
            "use strict";
            jQuery(this).toggleClass("open",function(){
				if ($('#map').is('.map_hidden')) {
					$('#map').slideDown(300);
				}
				else {
					$('#map').slideUp(300);
				}
            });
            jQuery(this).next().toggleClass("map_hidden");
            if(!jQuery(this).next().hasClass('itited')) {
                jQuery(this).next().addClass('itited');
                setTimeout(function () { 
					var lat;
					var lng;
					var map;
					var styles = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}];

					//type your address after "address="
					jQuery.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=london, baker street, 221b&sensor=false', function(data) {
					    lat = data.results[0].geometry.location.lat;
					    lng = data.results[0].geometry.location.lng;
					}).complete(function(){
					    dxmapLoadMap();
					});

					function attachSecretMessage(marker, message)
					{
					    var infowindow = new google.maps.InfoWindow(
					        { content: message
					        });
					    google.maps.event.addListener(marker, 'click', function() {
					        infowindow.open(map,marker);
					    });
					}

					window.dxmapLoadMap = function()
					{
					    var center = new google.maps.LatLng(lat, lng);
					    var settings = {
					        mapTypeId: google.maps.MapTypeId.ROADMAP,
					        zoom: 16,
					        draggable: false,
					        scrollwheel: false,
					        center: center,
					        styles: styles 
					    };
					    map = new google.maps.Map(document.getElementById('map'), settings);

					    var image = 'img/google_map_point.png';

					    var marker = new google.maps.Marker({
					        position: center,
					        title: 'Map title',
					        map: map,
					        icon: image
					    });
					    marker.setTitle('Map title'.toString());
					//type your map title and description here
					attachSecretMessage(marker, '<h3>Map title</h3>Map HTML description');
					} 
				}, 300);
            }
        });
    }