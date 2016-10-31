/*
 * JAIME A BANDA
 * OCT/34/2016
 */

'use strict';
// Variables for the map
var map;
var largeInfowindow;
var bouncingIcon;

var SEARCH_ITEM = 'steaks';
var CLIENT_ID = 'S30FAFJDFZXV1Q53NBZESTTORH2WA5FMJCCPR0XINEHOFUFL';
var CLIENT_SECRET = 'XF0MART2OR5NTWR4IKLUY43S3RNZBX5CP0PPZNMJ55YNDR4M';
var FOUR_SQUARE_URL = 'https://api.foursquare.com/v2/venues/search?' +
    'client_id=' + CLIENT_ID +
    '&client_secret=' + CLIENT_SECRET +
    '&section=food' +
    '&radius=20' +
    '&v=20130815' +
    '&ll=LAT_PARAM,LNG_PARAM' +
    '&query=SEARCH_ITEM';

/**
 * @description Initialize the map
 */
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.880772,
            lng: -106.397618
        },
        zoom: 14,
        mapTypeControl: false,
        scrollwheel: false,
    });

    // Get the bouncing icon
    bouncingIcon = makeMarkerIcon('09a80e');

    // Create the information window
    largeInfowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(largeInfowindow, 'closeclick', function() {
        // stop marker animation here
        largeInfowindow.marker.setAnimation(null);
    });
}

/**
 * @description Called to display an error if map is unable to load
 */
function mapError() {
    init.model().hasError(true);
    $('#map').html('<h3>Unable to load the map</h3>');
}

/**
 * @description Helper function for the alternative icon image
 * @param {string} markerColor - Hexadecimal representation of a color for the icon
 * @return MarkerImage - A new icon with an specific color
 */
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

/**
 * @description Helper function display the info window with info of an specific place
 * @param {Marker} marker - Marker object selected that contain information
 * @param {InfoWindow} infowindow - The window that display information of a place
 */
function populateInfoWindow(marker, infowindow) {
    //infowindow.close();
    infowindow.marker = marker;
    infowindow.setContent('<div><p>' + marker.title + '</p>' +
        '<p>Review: <span styles="display:inline"; id="rateYo"></span></p></div>');

    infowindow.open(map, marker);
    $('#rateYo').rateYo({
        starWidth: '12px',
        rating: marker.rating
    });
}

/**
 * @description Helper function for the alternative icon image
 * @param {string} markerColor - Hexadecimal representation of a color for the icon
 * @return MarkerImage - A new icon with an specific color
 */

/**
 * @description Container of the model of the page
 * @constructor
 */
function data() {
    var self = this;
    self.places = ko.observableArray();
    self.hasError = ko.observable(false);
}

/**
 * @description Place-Marker model, contain the marker, place and foursquare model of a place
 * @constructor
 * @param {Place} place - The place from the map
 * @param {Marker} marker - The marker pointing to a place on the map
 */
function PlaceMarker(place, marker) {
    var self = this;
    self.place = ko.observable(place);
    self.marker = ko.observable(marker);
    self.fourSquareData = ko.observable();
}

/**
 * @description FourSquareData model, contain place information returned from a the FourSquare API
 * @constructor
 * @param {string} address - The address from a place
 * @param {string} phone - The phone from a place
 * @param {string} url - The URL of a place
 */
function FourSquareData(address, phone, url) {
    var self = this;
    self.address = ko.observable(address);
    self.phone = ko.observable(phone);
    self.url = ko.observable(url);
}

/**
 * @description ModelViewViewModel of the page
 * @constructor
 */
function PlacesViewModel() {
    // self reference
    var self = this;
    // Variable for filtering text
    self.filterText = ko.observable('');
    // Selected item, set an empty item
    var placeHolder = new PlaceMarker();
    placeHolder.fourSquareData(new FourSquareData('', '', ''));
    self.selectedItem = ko.observable(placeHolder);
    // Variable containing the model
    self.model = ko.observable(new data());
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

    /**
     * @description Function to pull data from the remote API's
     */
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
                    console.log(place);
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
                    marker.addListener('click', (function() {
                        return function() {
                            var marker = this;
                            //Change the animation of the icon
                            self.setAnimationItem(marker);
                            // Set the item clicked
                            self.selectedItem(marker.parent);
                            // Pull the info only the first time,if the marker is clicked and no errors before        
                            populateInfoWindow(marker, largeInfowindow);
                        }
                    })());

                    // Create new PlaceMarker object
                    var placeMarker = new PlaceMarker(place, marker);

                    // Set the parent container and the rating
                    marker.parent = placeMarker;
                    marker.rating = place.rating;


                    // Get FourSquare data for the place
                    self.pullFourSquareData(place.geometry.location, place.name, placeMarker.fourSquareData);

                    // Store the places and the markers
                    self.model().places.push(placeMarker);
                }
                // Add markers to map
                self.showMarkers();

                // No errors
                self.model().hasError(false);
            } else {
                console.log('Something went wrong...');
                self.model().hasError(true);
                $('#myModal').modal('toggle');
            }
        });
    };

    /**
     * @description Helper function to start the animation of an icon
     */
    self.setAnimationItem = function(clickedItem) {
        for (var i = 0; i < self.model().places().length; i++) {
            if (clickedItem === self.model().places()[i].marker()) {
                if (clickedItem.getAnimation() !== null) {
                    clickedItem.setAnimation(null);
                    clickedItem.setIcon(clickedItem.bufferIcon);
                } else {
                    clickedItem.setIcon(bouncingIcon);
                    clickedItem.setAnimation(google.maps.Animation.BOUNCE);
                }
            } else {
                self.model().places()[i].marker().setAnimation(null);
                self.model().places()[i].marker().setIcon(self.model().places()[i].marker().bufferIcon);
            }
        }
    };


    /**
     * @description Click event when an item is selected from the list
     * @constructor
     */
    self.clickItem = function(item) {
        self.setAnimationItem(item.marker());
        self.selectedItem(item);
        populateInfoWindow(item.marker(), largeInfowindow);
    };

    /**
     * @description Helper function to pull FourSquare data
     */
    self.pullFourSquareData = function(location, title, fourSquareData) {
        var fourSquareURL = FOUR_SQUARE_URL.
        replace('LAT_PARAM', location.lat).
        replace('LNG_PARAM', location.lng).
        replace('SEARCH_ITEM', title).
        replace(' ', '%20');

        $.getJSON(fourSquareURL, function(data) {

            var address = '';
            var phone = '';
            var url = '';

            if (data.response.venues) {
                if (data.response.venues.length > 0) {
                    if (data.response.venues[0].location) {
                        if (data.response.venues[0].location.formattedAddress)
                            address = data.response.venues[0].location.formattedAddress.join();
                    }
                    if (data.response.venues[0].contact) {
                        if (data.response.venues[0].contact.formattedPhone)
                            phone = data.response.venues[0].contact.formattedPhone;
                    }
                    if (data.response.venues[0].url)
                        url = data.response.venues[0].url;
                }
            }

            // Create FourSquare model
            fourSquareData(new FourSquareData(address, phone, url));

        }).fail(function() {
            console.log("Something is wrong...");
            $('#alert-msg').html('<strong>Warning!</strong> Unable to get the data from FourSquare.');
            console.log(self.model().hasError(true));
        });
    };

    // 
    /**
     * @description This function will loop through the markers array and display them all for the first time.
     */
    self.showMarkers = function() {
        // Extend the map to fit the markers 
        var bounds = new google.maps.LatLngBounds();

        // Extend the boundaries of the map for each marker and display the marker
        for (var j = 0; j < self.filteredList().length; j++) {
            setTimeout(function(marker, map) {
                marker.setMap(map);
            }, j * 50, self.filteredList()[j].marker(), map);
            bounds.extend(self.filteredList()[j].marker().position);
        }
        map.fitBounds(bounds);
    };
}

// Apply the bindings from knockout
var init = new PlacesViewModel();
ko.applyBindings(init);

// Start execution when ALL the content on the page is loaded
$(window).load(function() {
    init.pullData();
});
