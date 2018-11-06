// Init Google map
var googlemap_init_obj = {
	map: null,
	dom: null,
	opt: null,
	address: null,
	point: null,
	description: null
}
function googlemap_init(dom_obj, address, description, point) {
	googlemap_init_obj.dom = dom_obj;
	googlemap_init_obj.point = point;
	googlemap_init_obj.description = description;
	googlemap_init_obj.opt = {
		zoom: 16,
		center: new google.maps.LatLng(0, 0),
		scrollwheel: true,
		scaleControl: false,
		disableDefaultUI: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var custom_map = new google.maps.Geocoder();
	custom_map.geocode( { "address": address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			googlemap_init_obj.address = results[0].geometry.location;
			googlemap_create();
		} else
			alert("Geocode was not successful for the following reason: " + status);
	});
	
	jQuery(window).resize(function() {
		if (googlemap_init_obj.map) googlemap_init_obj.map.setCenter(googlemap_init_obj.address_position);
	});
}

function googlemap_create() {
	if (!googlemap_init_obj.address) return false;
	googlemap_init_obj.map = new google.maps.Map(googlemap_init_obj.dom, googlemap_init_obj.opt);
	googlemap_init_obj.map.setCenter(googlemap_init_obj.address);
	var marker = new google.maps.Marker({
		map: googlemap_init_obj.map,
		icon: googlemap_init_obj.point,
		position: googlemap_init_obj.map.getCenter()
	});
	var infowindow = new google.maps.InfoWindow({
		content: googlemap_init_obj.description
	});
	google.maps.event.addListener(marker, "click", function() {
		infowindow.open(googlemap_init_obj.map, marker);
	});
}

function googlemap_refresh() {
	googlemap_create();	
}