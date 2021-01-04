//******************************************************************************
// Site Intialization
//******************************************************************************

var map; // Google Maps object, from API
var site; // Site settings object, from json
var area; // Area settings object, from json
var url;  // URL Get parameters

var loaded = {google: false, settings: false, area: false}; // Help for asynchronous loading  
var modals = {}; // Container for all site modals



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

            //Apply some settings
            document.title = site.name;

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

    if (!location.style) { location.style = "bg-light text-dark border-white"}

    let modalContent = document.createElement("div");
    modalContent.setAttribute("class","modal-content");

    let modalHeader = document.createElement("div");
    modalHeader.setAttribute("class","modal-header " + location.style);
        
        let modalHeaderH = document.createElement("h2");
        modalHeaderH.innerHTML = location.name;
        modalHeader.append(modalHeaderH);

        let modalHeaderButtons = document.createElement("div");
        modalHeaderButtons.setAttribute("class","btn-group");

        let modalHeaderLink = document.createElement("a");
        modalHeaderLink.setAttribute("class","btn shadow-none border-0 " + location.style);
        modalHeaderLink.setAttribute("href","?location="+ locationID);
        modalHeaderLink.innerHTML = "<span class='material-icons'>link</span>";
        modalHeaderButtons.append(modalHeaderLink);

        let modalHeaderClose = document.createElement("a");
        modalHeaderClose.setAttribute("class","btn shadow-none border-0 " + location.style);
        modalHeaderClose.setAttribute("data-bs-dismiss","modal");
        modalHeaderClose.setAttribute("aria-label","Close");
        modalHeaderClose.innerHTML = "<span class='material-icons'>close</span>";
        modalHeaderButtons.append(modalHeaderClose);

        modalHeader.append(modalHeaderButtons);
    modalContent.append(modalHeader);

    if (location.image) {
        let modalImage = document.createElement("img");
        modalImage.setAttribute("class","card-img-top rounded-0");
        modalImage.setAttribute("src", location.image);
        modalContent.append(modalImage);
    }

    let modalBody = document.createElement("div");
    modalBody.setAttribute("class","modal-body " + location.style);
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
    modalFooter.setAttribute("class","modal-footer " + location.style);
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


function copyLink(locationID) {

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


    url = new URLSearchParams(window.location.search);


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

    if (url.get("location")) { modals[url.get("location")].show() }

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