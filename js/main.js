/*
 * Jaime A Banda functions
 *
 */

"use strict";



/*
 * Initialize the side bar buttons
 */
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//document.getElementById('go-places').addEventListener('click', textSearchPlaces);

/*
 * Initialize the map
 *
 */
// Variable for the map
var map;
var bouncingIcon;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.7082435,
            lng: -106.3810395
        },
        zoom: 12,
        mapTypeControl: false,
        scrollwheel: false,
        types: ['store', 'restaurant']
    });

    // Get the bouncing icon
    bouncingIcon = makeMarkerIcon('09a80e');

    // Initialize service to search nearby places

}

// Helper function for icon
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// Model
function PlaceMarker() {
    place = ko.observable();
    marker = ko.observable();
}

function Item() {
    var self = this;
    self.places = ko.observableArray();
    self.hasError = ko.observable(true);
}


// ModelView
function PlacesViewModel() {
    var self = this;

    self.model = ko.observable(new Item());

    // Function to pull data from the remote API
    self.pullData = function() {
        // Hide current markers on the map
        // Remove all items from the collection
        self.hideMarkers(self.model().places());
        self.model().places.removeAll();
        // Get the boundaries of the map
        var bounds = map.getBounds();
        var boundsLatLng = new google.maps.LatLngBounds();
        // Initialize the service to find places
        var placesService = new google.maps.places.PlacesService(map);
        // Initialize the request parameters
        var request = {
            query: document.getElementById('txtFilter').value,
            bounds: bounds
        };
        // Temporal variables
        var place, icon, marker;

        // Call the service, provide parameters and callback function
        placesService.textSearch(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    // Create markers for places
                    place = results[i];
                    icon = {
                        url: place.icon,
                        size: new google.maps.Size(35, 35),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(15, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };
                    // Create a marker for each place.
                    marker = new google.maps.Marker({
                        map: map,
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location,
                        animation: google.maps.Animation.DROP,
                        id: place.id
                    });

                    // Store original icon
                    marker.bufferIcon = marker.icon;
                    console.log(marker.icon);
                    console.log(marker.bufferIcon);
                    console.log(bouncingIcon);

                    // If a marker is clicked, do a place details search on it in the next function.
                    marker.addListener('click', function() {

                    });

                    //self.model().markers.push(marker);
                    self.model().places.push({ place: place, marker: marker });
                }
                //map.fitBounds(bounds);
                self.showListings(bounds);
                // No errors
                self.model().hasError(false);
            } else {
                console.log("Something went wrong...");
                self.model().hasError(true);
            }
        });
    };

    self.clickItem = function(item) {
        if (item.marker.getAnimation() !== null) {
            item.marker.setAnimation(null);
            item.marker.setIcon(item.marker.bufferIcon);
        } else {
            item.marker.setIcon(bouncingIcon);
            item.marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    // This function will loop through the markers array and display them all.
    self.showListings = function(bounds) {
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < self.model().places.length; i++) {
            self.model().places[i].marker.setMap(map);
            bounds.extend(self.model().places[i].marker.position);
        }
        map.fitBounds(bounds);
    }

    // This function will loop through the listings and hide them all.
    self.hideMarkers = function(places) {
        for (var i = 0; i < places.length; i++) {
            places[i].marker.setMap(null);
        }
    }

}

ko.applyBindings(new PlacesViewModel());
