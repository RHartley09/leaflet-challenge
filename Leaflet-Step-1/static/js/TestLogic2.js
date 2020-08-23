// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
    Magnitude0_to_1: new L.LayerGroup(),
    Magnitude1_to_2: new L.LayerGroup(),
    Magnitude2_to_3: new L.LayerGroup(),
    Magnitude3_to_4: new L.LayerGroup(),
    Magnitude4_to_5: new L.LayerGroup(),
    Magnitude5_and_Greater: new L.LayerGroup()
};

// Create the map with our layers
var map = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [
        layers.Magnitude0_to_1,
        layers.Magnitude1_to_2,
        layers.Magnitude2_to_3,
        layers.Magnitude3_to_4,
        layers.Magnitude4_to_5,
        layers.Magnitude5_and_Greater
    ]
});

// Add our 'lightmap' tile layer to the map
lightmap.addTo(map);

// Create an overlays object to add to the layer control
var overlays = {
    "Magnitude of 0 to 1": layers.Magnitude0_to_1,
    "Magnitude of 1 to 2": layers.Magnitude1_to_2,
    "Magnitude of 2 to 3": layers.Magnitude2_to_3,
    "Magnitude of 3 to 4": layers.Magnitude3_to_4,
    "Magnitude of 4 to 5": layers.Magnitude4_to_5,
    "Magnitude of 5+": layers.Magnitude5_and_Greater
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map
var info = L.control({
    position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    return div;
};
// Add the info legend to the map
info.addTo(map);

// Initialize an object containing icons for each layer group
var icons = {
    Magnitude0_to_1: L.ExtraMarkers.icon({
        icon: "ion-settings",
        iconColor: "white",
        markerColor: "yellow",
        shape: "star"
    }),
    Magnitude1_to_2: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "red",
        shape: "circle"
    }),
    Magnitude2_to_3: L.ExtraMarkers.icon({
        icon: "ion-minus-circled",
        iconColor: "white",
        markerColor: "blue-dark",
        shape: "penta"
    }),
    Magnitude3_to_4: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "orange",
        shape: "circle"
    }),
    Magnitude4_to_5: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "green",
        shape: "circle"
    }),
    Magnitude5_and_Greater: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "green",
        shape: "circle"
    })
};

// Perform an API call to the Citi Bike Station Information endpoint
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {

    //   // When the first API call is complete, perform another call to the Citi Bike Station Status endpoint
    //   d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json", function(statusRes) {
    console.log(data)
    var mag = data.features.mag;
    console.log("Mag data type and value:",typeof(mag),mag)
    //     var stationStatus = statusRes.data.stations;
    //     var stationInfo = infoRes.data.stations;

    // Create an object to keep of the number of markers in each layer
    var MagnitudeObj = {
        Magnitude0_to_1: 0,
        Magnitude1_to_2: 0,
        Magnitude2_to_3: 0,
        Magnitude3_to_4: 0,
        Magnitude4_to_5: 0,
        Magnitude5_and_Greater: 0
    };

    // Initialize a Magnitudes, which will be used as a key to access the appropriate layers, icons, and station count for layer group
    var Magnitudes;
    var mag = data.properties.mag
    // Loop through the stations (they're the same size and have partially matching data)
    for (var i = 0; i < mag.length; i++) {

        // Create a new station object with properties of both station objects
        var station = Object.assign({}, mag[i]);
        // If a station is listed but not installed, it's coming soon
        if (mag <= 1) {
            Magnitudes = "Magnitude of 0 to 1";
        }
        // If a station has no bikes available, it's empty
        else if (mag <= 2) {
            Magnitudes = "Magnitude of 1 to 2";
        }
        // If a station is installed but isn't renting, it's out of order
        else if (mag <= 3) {
            Magnitudes = "Magnitude of 2 to 3";
        } 
        // If a station has less than 5 bikes, it's status is low
        else if (mag <= 4) {
            Magnitudes = "Magnitude of 4 to 5";
        }
        // Otherwise the station is normal
        else {
            Magnitudes = "Magnitude of 5+";
        }

        // Update the station count
        mag++;
        // Create a new marker with the appropriate icon and coordinates
        var newMarker = L.marker([34.052235, -118.243683], {
            icon: icons[m]
        });

        // Add the new marker to the appropriate layer
        newMarker.addTo(layers[Magnitudes]);

        // Bind a popup to the marker that will  display on click. This will be rendered as HTML
        newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");
    }

    // Call the updateLegend function, which will... update the legend!
    // updateLegend(updatedAt, stationCount);
});


// Update the legend's innerHTML with the last updated time and station count
// function updateLegend(time, stationCount) {
//     document.querySelector(".legend").innerHTML = [
//         "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
//         "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
//         "<p class='coming-soon'>Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
//         "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
//         "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
//         "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>"
//     ].join("");
// }
