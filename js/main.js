/*
 * Jaime A Banda functions
 *
 */

"use strict";
// https://api.foursquare.com/v2/venues/search?client_id=S30FAFJDFZXV1Q53NBZESTTORH2WA5FMJCCPR0XINEHOFUFL&client_secret=XF0MART2OR5NTWR4IKLUY43S3RNZBX5CP0PPZNMJ55YNDR4M&venuePhotos=1&section=food&radius=20&v=20130815&ll=31.736601,-106.4454308&query=pizza hut
/*
 * Initialize the map
 *
 */
// Variable for the map
var map;
var largeInfowindow;
var bouncingIcon;

var SEARCH_ITEM = "pizzas";
var CLIENT_ID = "S30FAFJDFZXV1Q53NBZESTTORH2WA5FMJCCPR0XINEHOFUFL";
var CLIENT_SECRET = "XF0MART2OR5NTWR4IKLUY43S3RNZBX5CP0PPZNMJ55YNDR4M";
var FOUR_SQUARE_URL = "https://api.foursquare.com/v2/venues/search?" +
    "client_id=" + CLIENT_ID +
    "&client_secret=" + CLIENT_SECRET +
    "&v=20130815&ll=31.7082435,-106.3810395&query=" + SEARCH_ITEM;

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
    });

    // Get the bouncing icon
    bouncingIcon = makeMarkerIcon('09a80e');

    // Create the information window
    largeInfowindow = new google.maps.InfoWindow();

    // Initialize service to search nearby places

}

// Helper function for the alternative icon image
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

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<h4>Hola</h4><div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            //this.setMarker(null);
        });
    }
}

// Main Model
function data() {
    var self = this;
    self.places = ko.observableArray();
    self.hasError = ko.observable(false);
}

// Place-Marker model
function PlaceMarker(place, marker) {
    var self = this;
    self.place = ko.observable(place);
    self.marker = ko.observable(marker);
    self.clicked = ko.observable(false);
}


// ModelView
function PlacesViewModel() {
    // self reference
    var self = this;

    // Array for the FOURSQUARE RESULTS
    self.placeName = [];
    self.fourSquare = [];
    // Variable containing the model
    self.model = ko.observable(new data());
    // Variable for filtering text
    self.filterText = ko.observable("");
    // Computed field
    self.filteredList = ko.computed(function() {
        var list;
        var shouldBeFiltered;

        list = ko.utils.arrayFilter(self.model().places(), function(item) {
            shouldBeFiltered = item.place().name.toLowerCase().indexOf(self.filterText().toLowerCase()) >= 0;
            shouldBeFiltered ? item.marker().setVisible(true) : item.marker().setVisible(false);
            return shouldBeFiltered;
        });

        return list;
    }, self);

    // Function to pull data from the remote API
    self.pullData = function() {
        // Get the boundaries of the map
        var bounds = map.getBounds();

        // Initialize the service to find places
        var placesService = new google.maps.places.PlacesService(map);
        // Initialize the request parameters
        var request = {
            query: SEARCH_ITEM,
            bounds: bounds
        };
        // Temporal variables
        var place, icon, marker;

        // Call the service, provide parameters and callback function
        placesService.textSearch(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    // Set temp var
                    place = results[i];

                    // Start pulling data from 4square
                    if ($.inArray(place.name, self.placeName) === -1) {
                        // If place name is not in the array, just added
                        self.placeName.push(place.name);
                    }

                    // Create markers for places
                    icon = {
                        url: place.icon,
                        size: new google.maps.Size(35, 35),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(15, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };
                    // Create a marker for each place.
                    marker = new google.maps.Marker({
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location,
                        animation: google.maps.Animation.DROP,
                        id: place.id
                    });

                    // Store original icon
                    marker.bufferIcon = marker.icon;

                    // If a marker is clicked, do a place details search on it in the next function.
                    marker.addListener('click', function() {
                        if (this.getAnimation() !== null) {
                            this.setAnimation(null);
                            this.setIcon(this.bufferIcon);
                            //item.clicked(false);
                        } else {
                            this.setIcon(bouncingIcon);
                            this.setAnimation(google.maps.Animation.BOUNCE);
                            //item.clicked(true);
                        }

                        populateInfoWindow(this, largeInfowindow);
                    });
                    self.model().places.push(new PlaceMarker(place, marker));

                    console.log("Name: " + results[i].name + ", lat: " + results[i].geometry.location.lat() + ", lng: " + results[i].geometry.location.lng());
                }

                console.log(self.placeName);

                // Add markers to map
                self.showMarkers();

                // No errors
                self.model().hasError(false);
            } else {
                console.log("Something went wrong...");
                self.model().hasError(true);
                $('#myModal').modal('toggle');
            }
        });
    };

    self.filterList = function() {};

    self.clickItem = function(item) {
        if (item.marker().getAnimation() !== null) {
            item.marker().setAnimation(null);
            item.marker().setIcon(item.marker().bufferIcon);
            item.clicked(false);
        } else {
            item.marker().setIcon(bouncingIcon);
            item.marker().setAnimation(google.maps.Animation.BOUNCE);
            item.clicked(true);
        }
    }

    // This function will loop through the markers array and display them all.
    self.showMarkers = function() {
        // Extend the boundaries of the map for each marker and display the marker
        for (var j = 0; j < self.filteredList().length; j++) {
            setTimeout(function(marker, map) {
                marker.setMap(map);
            }, j * 200, self.filteredList()[j].marker(), map);
        }
    }

    // This function will loop through the listings and hide them all.
    self.hideMarkers = function() {
        for (var i = 0; i < self.filteredList().length; i++) {
            self.filteredList()[i].marker().setMap(null);
        }
    }
}

var init = new PlacesViewModel()
ko.applyBindings(init);

// Start execution when ALL the content on the page has loaded
$(window).load(function() {
    init.pullData();
});
