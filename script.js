//******************************************************************************
// Site Intialization
//******************************************************************************

var map; // Google Maps object, from API
var site; // Site settings object, from json
var area; // Area settings object, from json
var url;  // URL Get parameters

var loaded = {google: false, settings: false, area: false}; // Help for asynchronous loading  
var modals = {}; // Container for all site modals
var menus = {}; // Container for all site menus



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

            if (!localStorage.getItem("area")) {
                localStorage.setItem("area", site.area);
            }
            else {
                site.area = localStorage.getItem("area");
            }

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

            //Apply some settings
            document.title = site.name +": "+ area.name;
            
        }
        else if (this.readyState == 4 && this.status == 404) { //If area file does not exist try to reload to default settings
            localStorage.removeItem("area");
            location.reload();
        }
    };
    requestJSON.open("GET", "areas/" + targetArea, true);
    requestJSON.send();
}

//******************************************************************************
// Site builder functions
//******************************************************************************

function loadArea () {
    let locations = area.locations;
    locations.forEach(location => {
        createMarker(location);
        createModal(location);
        createCard(location);
    });
}

function createFooterMenu() {

    if (!site.style) { site.style = "bg-dark text-white border-dark"};

    let footerMenu = document.createElement("nav");
    footerMenu.setAttribute("class","navbar fixed-bottom justify-content-center "+ site.style);

    let footerMenuToogleContainer = document.createElement("div");
    footerMenuToogleContainer.setAttribute("class","container-fluid justify-content-center");
    footerMenu.append(footerMenuToogleContainer);

    let footerMenuToogleButton = document.createElement("button");
    footerMenuToogleButton.setAttribute("class","border-0 shadow-none "+ site.style);
    footerMenuToogleButton.setAttribute("onclick","menus.footer.toggle()");
    footerMenuToogleButton.innerHTML = "<span class='material-icons'>menu</span></button>";
    footerMenuToogleContainer.append(footerMenuToogleButton);

    let footerMenuCollapse = document.createElement("div");
    footerMenuCollapse.setAttribute("class","collapse");
    footerMenuCollapse.setAttribute("id","footer-menu-collapse");
    footerMenu.append(footerMenuCollapse);

    let footerMenuCardContainer = document.createElement("div");
    footerMenuCardContainer.setAttribute("class","container-fluid d-flex flex-row justify-content-center align-content-start flex-wrap");
    footerMenuCardContainer.setAttribute("id","footer-menu-container");
    footerMenuCollapse.append(footerMenuCardContainer);

    let footer = document.getElementById("footer-wrapper");
    footer.append(footerMenu);

    menus.footer = new bootstrap.Collapse(footerMenuCollapse, { toggle: false });

}

function createCard(location) {
    var locationID = encodeURIComponent(location.name);

    if (!location.style) { location.style = "bg-light text-dark border-dark"};

    let card = document.createElement("div");
    card.setAttribute("class","card border-0 "+ location.style);
    card.onclick = function() {
        modals[locationID].show(); 
        menus.footer.hide();
    }

    let cardBody = document.createElement("div");
    cardBody.setAttribute("class","card-body");

    let cardTitle = document.createElement("h5");
    cardTitle.setAttribute("class","card-title");
    cardTitle.innerHTML = location.name;
    cardBody.append(cardTitle);
    card.append(cardBody);

    let cardImage = document.createElement("div");
    cardImage.setAttribute("class","card-image rounded-bottom");
    

    if (location.image == "trianglify") {
        let pattern =trianglify({
            height: 50,
            width: 200,
            seed: location.name,
            cellSize: 10,
            variance: 1,
        });
        cardImage.appendChild(pattern.toSVG());
    }
    else if (location.image == "color") {
        cardImage.style.backgroundColor = "#"+ checksumColor(location.name);
    }
    else if (location.image) {
        cardImage.style.backgroundImage = "url("+ location.image +")";
    }
    else {
    }

    card.append(cardImage);

    document.getElementById("footer-menu-container").append(card);

}


function checksumColor(s)
{
  var chk = 0x12345678;
  var len = s.length;
  for (var i = 0; i < len; i++) {
      chk += (s.charCodeAt(i) * (i + 1));
  }

  return (chk & 0xffffff).toString(16);
}



//******************************************************************************
// Modal functions
//******************************************************************************

function createModal(location) {
    var locationID = encodeURIComponent(location.name);

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
        modalHeaderLink.setAttribute("href","?area="+ site.area +"&location="+ locationID);
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

    if (location.image == "trianglify") {
        let modalImage = document.createElement("div");
        modalImage.setAttribute("class","modal-img modal-img-slim card-img-top rounded-0");

        let pattern =trianglify({
            height: 150,
            width: 800,
            seed: location.name,
            cellSize: 15,
            variance: 1,
        });
        modalImage.appendChild(pattern.toSVG());

        modalContent.append(modalImage);
    }
    else if (location.image == "color") {
        let modalImage = document.createElement("div");
        modalImage.setAttribute("class","modal-img modal-img-slim card-img-top rounded-0");

        modalImage.style.backgroundColor = "#"+ checksumColor(location.name);
        
        modalContent.append(modalImage);
    }
    else if (location.image) {
        let modalImage = document.createElement("img");
        modalImage.setAttribute("class","modal-img card-img-top rounded-0");
        modalImage.setAttribute("src", location.image);
        modalContent.append(modalImage);
    }
    else {

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

    let modal = document.createElement("article");
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

function createMarker(location) {
    var locationID = encodeURIComponent(location.name);

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
    if (url.get("area")) { localStorage.setItem("area", url.get("area"))};

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
    createFooterMenu();
    loadMap();
    loadArea();


    modals["spinner"].hide();

    if (url.get("location")) { modals[encodeURIComponent(url.get("location"))].show() };

}


