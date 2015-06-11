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
 
    google.maps.event.addListener(map, 'click', function(event) {

        addMarker(event.latLng);

    });



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
