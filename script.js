//******************************************************************************
// Site Intialization
//******************************************************************************

var map;
var site;
var area;

var loaded = {google: false, settings: false, area: false};
var modals = {};



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
// Modal functions
//******************************************************************************

function createModal(location, locationID) {

    if (!location.background) { location.background = "bg-light"}
    if (!location.color) { location.color = "text-dark"}

    let modalContent = document.createElement("div");
    modalContent.setAttribute("class","modal-content " + location.background + " " + location.color );

    let modalHeader = document.createElement("div");
    modalHeader.setAttribute("class","modal-header");
    modalHeader.innerHTML = "<h2>"+ location.name +"</h2><button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>";
    modalContent.append(modalHeader);

    if (location.image) {
        let modalImage = document.createElement("img");
        modalImage.setAttribute("class","card-img-top");
        modalImage.setAttribute("src", location.image);
        modalContent.append(modalImage);
    }

    let modalBody = document.createElement("div");
    modalBody.setAttribute("class","modal-body");
    let markdown = new showdown.Converter();
    modalBody.innerHTML = markdown.makeHtml(location.description);
    modalContent.append(modalBody);

    if (location.actions) {
        var modalActions = document.createElement("div");
        modalActions.setAttribute("class","btn-group-vertical");
        location.actions.forEach(action => {
            let modalActionButton = document.createElement("a");

            if (!action.style) { action.style = "btn-primary" }
            modalActionButton.setAttribute("class","btn rounded-0 " + action.style);

            if (!action.target) { action.target = "_self" }
            modalActionButton.setAttribute("target", action.target);

            modalActionButton.setAttribute("href", action.href);
            modalActionButton.innerHTML = action.name;
            modalActions.append(modalActionButton);
        });
        modalContent.append(modalActions);
    }

    let modalFooter = document.createElement("div");
    modalFooter.setAttribute("class","modal-footer");
    modalContent.append(modalFooter);

    let modalDialog = document.createElement("div");
    modalDialog.setAttribute("class","modal-dialog modal-dialog-centered modal-lg");
    modalDialog.append(modalContent);

    let modal = document.createElement("div");
    modal.setAttribute("class","modal");
    modal.setAttribute("id",locationID);
    modal.append(modalDialog);
                
    document.getElementsByTagName("body")[0].append(modal);

    modals[locationID] =  new bootstrap.Modal(document.getElementById(locationID));
}


//******************************************************************************
// Map functions
//******************************************************************************

// readyMap() called from Google Maps API callback
function readyMap() {
    loaded.google = true;
}

function loadMap() {
    let centerPoint = { lat: area.lat, lng: area.lng };
    map = new google.maps.Map(document.getElementById("map-wrapper"), {
        zoom: 15,
        center: centerPoint,
        mapTypeId: 'satellite',
        disableDefaultUI: true
    });
}

function createMarker(location, locationID) {
    let marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        title: location.name,
        position: {
            lat: location.lat,
            lng: location.lng
        }
    });
    marker.addListener("click", () => {
        modals[locationID].show();
    });
}



//******************************************************************************
// Site initiation functions
//******************************************************************************

function initSite() {
    modals.spinner =  new bootstrap.Modal(document.getElementById('spinner-modal'),{
        backdrop:'static'
    });
    modals["spinner"].show();

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
    loadArea();

    modals["spinner"].hide();
}


//******************************************************************************
// Site builder functions
//******************************************************************************

function loadArea () {
    let locations = area.locations;
    var locationCounter = 1;
    locations.forEach(location => {
        let locationID = 'location' + locationCounter
        createMarker(location, locationID);
        createModal(location, locationID);
        locationCounter++;
    });
}