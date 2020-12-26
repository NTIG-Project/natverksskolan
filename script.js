//******************************************************************************
// Site Intialization
//******************************************************************************

var map;
var site;
var area;
var spinner;

var loaded = {google: false, settings: false, area: false};



initSite();

//******************************************************************************
// Settings functions
//******************************************************************************

function loadSiteSettings(){
    var requestJSON = new XMLHttpRequest();
    requestJSON.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            site = JSON.parse(this.responseText);
            loaded.settings = true;
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
            loaded.area = true;
        }
    };
    requestJSON.open("GET", "areas/" + targetArea, true);
    requestJSON.send();
}


//******************************************************************************
// Map functions
//******************************************************************************

// readyMap() called from Google Maps API callback
function readyMap() {
    loaded.google = true;
}

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
    let locations = area.locations;
    locations.forEach(function(data){
        let marker = new google.maps.Marker({
            map: map,
            position: {
                lat: data.lat,
                lng: data.lng
            }
        })
    });
}



//******************************************************************************
// Site functions
//******************************************************************************

function initSite() {
    spinner =  new bootstrap.Modal(document.getElementById('spinner-modal'),{
        backdrop:'static'
    });
    spinner.show();

    waitSite()
}

function waitSite() {

    if (loaded.settings == false) {
        loadSiteSettings();
        window.setTimeout(waitSite, 100);
    }
    else if (loaded.area == false) {
        loadAreaSettings(site.area);
        window.setTimeout(waitSite, 100);
    }
    else if (loaded.google == false) {
        window.setTimeout(waitSite, 100);
    }
    else {
        loadSite();
    }    

}

function loadSite() {
    loadMap();
    loadMarkers();

    spinner.hide();
}
