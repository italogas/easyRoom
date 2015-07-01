// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
function initialize() {


    var markers = [];
    var name_moradia;
    var add_moradia;
    var lat_moradia;
    var lnt_moradia;
    var img_moradia;
    var id_user;

var decode = function(str_input){
    return str_input.replace(/\\x21/g, "!").replace(/\\x23/g, "#").replace(/\\x24/g, "$").replace(/\\x25/g, "%")
        .replace(/\\xc0/g, "À").replace(/\\xc1/g, "Á").replace(/\\xc2/g, " ").replace(/\\xc3/g, "Ã").replace(/\\xc4/g, "Ä").replace(/\\xc5/g, "Å").replace(/\\xc6/g, "Æ").replace(/\\xc7/g, "Ç")
        .replace(/\\xc8/g, "È").replace(/\\xc9/g, "É").replace(/\\xca/g, "Ê").replace(/\\xcb/g, "Ë").replace(/\\xcc/g, "Ì").replace(/\\xcd/g, "Í").replace(/\\xce/g, "Î").replace(/\\xcf/g, "Ï")
        .replace(/\\xd0/g, "Ð").replace(/\\xd1/g, "Ñ").replace(/\\xd2/g, "Ò").replace(/\\xd3/g, "Ó").replace(/\\xd4/g, "Ô").replace(/\\xd5/g, "Õ").replace(/\\xd6/g, "Ö").replace(/\\xd7/g, "×")
        .replace(/\\xd8/g, "Ø").replace(/\\xd9/g, "Ù").replace(/\\xda/g, "Ú").replace(/\\xdb/g, "Û").replace(/\\xdc/g, "Ü").replace(/\\xdd/g, "Ý").replace(/\\xde/g, "Þ").replace(/\\xdf/g, "ß")
        .replace(/\\xe0/g, "à").replace(/\\xe1/g, "á").replace(/\\xe2/g, "â").replace(/\\xe3/g, "ã").replace(/\\xe4/g, "ä").replace(/\\xe5/g, "å").replace(/\\xe6/g, "æ").replace(/\\xe7/g, "ç")
        .replace(/\\xe8/g, "è").replace(/\\xe9/g, "é").replace(/\\xea/g, "ê").replace(/\\xeb/g, "ë").replace(/\\xec/g, "ì").replace(/\\xed/g, "í").replace(/\\xee/g, "î").replace(/\\xef/g, "ï")
        .replace(/\\xf0/g, "ð").replace(/\\xf1/g, "ñ").replace(/\\xf2/g, "ò").replace(/\\xf3/g, "ó").replace(/\\xf4/g, "ô").replace(/\\xf5/g, "õ").replace(/\\xf6/g, "ö").replace(/\\xf7/g, "÷")
        .replace(/\\xf8/g, "ø").replace(/\\xf9/g, "ù").replace(/\\xfa/g, "ú").replace(/\\xfb/g, "û").replace(/\\xfc/g, "ü").replace(/\\xfd/g, "ý").replace(/\\xfe/g, "þ").replace(/\\xff/g, "ÿ");


}


var setMarkers = function setMarkers(map, locations) {
  // Add markers to the map

  // traces out a polygon as a series of X,Y points. The final
  // coordinate closes the poly by connecting to the first
  // coordinate.
  var shape = {
      coords: [1, 1, 1, 35, 35, 35, 35 , 35],
      type: 'poly'
  };
  
  for (var i = 0; i < locations.length; i++) {
    var house = locations[i];
    
    var image = {
      
      url: house.imgurl.replace("*", "/"),
      // This marker is 20 pixels wide by 32 pixels tall.
      size: new google.maps.Size(50, 40),
      // The origin for this image is 0,0.
      origin: new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      anchor: new google.maps.Point(0, 32)
    };


    var myLatLng = new google.maps.LatLng(parseFloat(house.lat), parseFloat(house.lng));
    
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image,
        shape: shape,
        title: house.name,
        zIndex: i
    });
//   var infowindow = new google.maps.InfoWindow({
    var   content =  "<div id=\"boxmessage\"></div><strong>"+house.name+"</strong><br>"+ house.address+"</div>"
 // });

    var infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
        return function() {
           infowindow.setContent(content);
           infowindow.open(map,marker);
         };
     })(marker,content,infowindow)); 
   //end for
  }

}

    //  var haightAshbury = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));//(-7.2163815,-35.9074335);
    var haightAshbury = new google.maps.LatLng(-7.2163815,-35.9074335);
      var mapOptions = { 

        zoom: 16,

        center: haightAshbury,

        mapTypeId: google.maps.MapTypeId.TERRAIN

      };

      map = new google.maps.Map(document.getElementById('map-canvas'),

          mapOptions);

    //addMarker(map.getCenter());

      // Create the search box and link it to the UI element.

      var input = /** @type {HTMLInputElement} */
    (

        document.getElementById('pac-input'));

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
    google.maps.event.addListener(map, 'idle', function() {
	
	    var tipo = $("#tipo").find('option:selected').val();
        console.log(tipo); 
		var coord = map.getBounds().toUrlValue().split(',');
		var xmlHttp = null;	
		
	        xmlHttp = new XMLHttpRequest();
		var req = "/getmoradiascoordenadas/"+ coord[0] + "/" + coord[1]+ "/" + coord[2]+ "/"+ coord[3]+ "/"+ tipo ;
		console.log(req);
		xmlHttp.open("GET", req, false);
		xmlHttp.send(null);
	//	console.log(xmlHttp.responseText);
		var str_moradias = xmlHttp.responseText;//.substring(3, xmlHttp.responseText.length-5);
        //alert(typeof(str_moradias));
	//str_moradias = JSON.parse(str_moradias);
	var fixedstring = decode(str_moradias);//.replace(/\\/g, "\\\\");//JSON.stringify("["+str_moradias+"]");
/*	var fixedstring;
	try{
	    // If the string is UTF-8, this will work and not throw an error.
	    fixedstring=decodeURIComponent(escape(str_moradias));
	}catch(e){
    // If it isn't, an error will be thrown, and we can asume that we have an ISO string.
	    window.alert(e)
	    fixedstring=str_moradias;
	}

*/
		//window.alert(fixedstring);
                //console.log(fixedstring);

		var array = JSON.parse(fixedstring); 
        //window.alert(array.moradias[1])
        var tam = array.moradias.length;

		for (i = 0; i < tam; i++) { 
		    //console.log(array.moradias[i].name+"-"+array.moradias[i].imgurl+array.moradias[i].lat+"-"+array.moradias[i].lng);
		}
		setMarkers(map, array.moradias);
//		window.alert(array[1].address+"-"+ typeof(array));	
		//window.alert("---"+map.getCenter()+"---");	
		//console.log(map.getBounds());
	});

/*    google.maps.event.addListener(map, 'click', function(event) {

        addMarker(event.latLng);

    });*/
    
   
    

    function addMarker(location) {

        if (markers.length >= 1) {

            return;
        }

        var nome_user = "Antonio";

        var icon_name = $('input[name="tipo-moradia"]:checked').val();

        var nome_moradia = document.getElementById("box-nome-moradia").value;

        var marker = new google.maps.Marker({

            position: location,

            icon: 'images/' + icon_name + '-icon.png',

            map: map

        });

        img_moradia = "images*" + icon_name + "-icon.png";
        var geocoder = new google.maps.Geocoder();



        function getAddress(location) {

            var latlng = new google.maps.LatLng(location.lat(), location.lng());
            lat_moradia = location.lat();
            lnt_moradia = location.lng();

            geocoder.geocode({
                'latLng': latlng
            }, function(results, status) {

                if (status == google.maps.GeocoderStatus.OK) {

                    if (results[0]) {




                        document.getElementById("boxmessage").innerHTML = "<div id=\"boxmessage\"><strong>" + tipo_moradia + ": " + nome_moradia + "</strong><br>"

                        + (results[0].formatted_address.replace(" - ", "<br>")) + "</div>";

                        name_moradia = tipo_moradia + ": " + nome_moradia + "<br>";
                        add_moradia = (results[0].formatted_address.replace(" - ", "<br>"));


                    }

                } else {

                    return "Desconhecido." //window.alert("Geocoder failed due to: " + status);

                }

            });



        }

        var name_us = "name";

        var add_us = "add";

        getAddress(location);



        var tipo_moradia = icon_name.charAt(0).toUpperCase() + icon_name.slice(1);

        var infowindow = new google.maps.InfoWindow({

            content: "<div id=\"boxmessage\"></div>" //<strong>"+tipo_moradia+" "+nome_moradia+"</strong><br></div>"

            //+'-Latitude: ' + location.lat() + '<br>Longitude: ' + location.lng()+""

        });




        google.maps.event.addListener(marker, 'click', function() {

            infowindow.open(map, marker);

        });

        infowindow.open(map, marker);

        markers.push(marker);

    }




    // Sets the map on all markers in the array.

    function setAllMap(map) {

        for (var i = 0; i < markers.length; i++) {

            markers[i].setMap(map);

        }

    }



    // Removes the markers from the map, but keeps them in the array.

    function clearMarkers() {

        setAllMap(null);

    }



    // Shows any markers currently in the array.

    function showMarkers() {

        setAllMap(map);

    }



    // Deletes all markers in the array by removing references to them.

    deleteMarkers = function deleteMarkers() {

        clearMarkers();

        markers = [];
        add_moradia = undefined;
    }

    salvarMoradia = function salvarMoradia() {


        var xmlHttp = null;

        xmlHttp = new XMLHttpRequest();
        if (add_moradia == undefined) {
            window.alert("Clique em algum ponto do mapa para adicionar uma moradia!")
        } else {
            var req = "/addhouse/" + iduser + "/" + name_moradia + "/" + add_moradia + "/" + lat_moradia + "/" + lnt_moradia + "/" + img_moradia;
            //window.alert(req);
            console.log(req);
            xmlHttp.open("GET", req, false);
            xmlHttp.send(null);
            window.alert(xmlHttp.responseText);
        }



    }




    var searchBox = new google.maps.places.SearchBox(
        /** @type {HTMLInputElement} */
        (input));

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.

    google.maps.event.addListener(searchBox, 'places_changed', function() {

        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }



        // For each place, get the icon, place name, and location.
        markers = [];

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {

            var image = {

                url: place.icon,

                size: new google.maps.Size(71, 71),

                origin: new google.maps.Point(0, 0),

                anchor: new google.maps.Point(17, 34),

                scaledSize: new google.maps.Size(1, 1)

            };



            // Create a marker for each place.

            var marker = new google.maps.Marker({

                map: map,

                icon: image,

                title: place.name,

                position: place.geometry.location

            });



            markers.push(marker);



            bounds.extend(place.geometry.location);

        }

        deleteMarkers();

        map.fitBounds(bounds);
	
        map.setZoom(16);

    });

    // [END region_getplaces]



    // Bias the SearchBox results towards places that are within the bounds of the

    // current map's viewport.

    google.maps.event.addListener(map, 'bounds_changed', function() {

        var bounds = map.getBounds();

        searchBox.setBounds(bounds);

    });

}



google.maps.event.addDomListener(window, 'load', initialize);
