//******************************************************************************
// Site Intialization
//******************************************************************************

var map;
var site;
var area;





//******************************************************************************
// Settings functions
//******************************************************************************

function loadSiteSettings(){
    var requestJSON = new XMLHttpRequest();
    requestJSON.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            site = JSON.parse(this.responseText);
        }
    };
    requestJSON.open("GET", "settings.json", true);
    requestJSON.send();
}

function loadAreaSettings(targetArea){
    var requestJSON = new XMLHttpRequest();
    requestJSON.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            area = JSON.parse(this.responseText);
        }
    };
    requestJSON.open("GET", "areas/" + targetArea, true);
    requestJSON.send();
}


//******************************************************************************
// Map functions
//******************************************************************************

// loadMap() called from Google Maps API callback
function loadMap() {
    let centerPoint = { lat: 63.8256912, lng: 20.2631702 };
    map = new google.maps.Map(document.getElementById("map-wrapper"), {
        zoom: 15,
        center: centerPoint,
        mapTypeId: 'satellite',
        disableDefaultUI: true
    });
}

function loadMarkers() {
    let locations = area.area_locations;
    locations.forEach(function(data){
        let marker = new google.maps.Marker({
            map: map,
            position: {
                lat: data.location_lat,
                lng: data.location_lng
            }
        })
    });
}



//******************************************************************************
// Site functions
//******************************************************************************

