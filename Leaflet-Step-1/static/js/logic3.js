// var geojsonMarkerOptions = { 
//     radius: 8,
//     fillColor: "#ff7800",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// ***Doesn't work yet***
// };
// L.geoJson(someGeojsonFeature, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, ge ojsonMarkerOptions);
//     }
// }).addTo(map);}

/* 
 * Create a circle symbol to use with a GeoJSON layer instead of the default blue marker
 */

// This will be run when L.geoJSON creates the point layer from the GeoJSON data.
function createCircleMarker(feature, latlng) {
    // Change the values of these options to change the symbol's appearance
    let options = {
        radius: 8,
        fillColor: "lightgreen",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }
    return L.circleMarker(latlng, options);
}

// Use jQuery's getJSON method to fetch the data from a URL
//   jQuery.getJSON( "http://example.com/layer1.geojson", function( json ) {
//     // Use Leaflet's geoJSON method to turn the data into a feature layer
//     L.geoJSON( json, {
//       pointToLayer: createCircleMarker // Call the function createCircleMarker to create the symbol for this layer
//     }).addTo( mymap )
//   })
// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
jQuery.getJSON( "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function( data ) {
    // Once we get a response, send the data.features object to the createFeatures function
    // Call the function createCircleMarker to create the symbol for this layer
    L.geoJSON( data, {
        pointToLayer: createCircleMarker
    }).addTo( mymap )
    createFeatures(data.features)
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });


    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Light Map": lightmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}
