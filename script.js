//******************************************************************************
// Global variables and Site Intialization
//******************************************************************************

var map; // Google Maps object, from API
var site; // Site settings object, from json
var area; // Area settings object, from json
var url;  // URL Get parameters

var modals = {}; // Container for all site modals
var menus = {}; // Container for all site menus

var newcomer = false; //True if first time visiting area


initSite();


//******************************************************************************
// Site initiation functions
//******************************************************************************

function initSite() { // First function to run

    // Throw up a loadingscreen, will seldom be seen
    modals.spinner =  new bootstrap.Modal(document.querySelector('#spinner-modal'),{
        backdrop:'static'
    });
    modals["spinner"].show();


    url = new URLSearchParams(window.location.search); // Load URL parameteras
    if (url.get("area")) { 
        localStorage.setItem("area", url.get("area"));
        newcomer = true;
    } // Change area if ?area=


    //Start the loading sequence loadSiteSettings -> Google Maps API -> loadAreaSettings -> buildSite
    loadSiteSettings();
}

function loadSiteSettings(){ // Load settings.json as site, called from initSite()
    var requestJSON = new XMLHttpRequest();
    requestJSON.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            site = JSON.parse(this.responseText);
            //Apply some settings

            // Load Google Maps API
            let scriptGoogleApi = document.createElement("script");
            scriptGoogleApi.setAttribute("src","https://maps.googleapis.com/maps/api/js?key="+ site.map_key +"&callback=loadAreaSettings");
            scriptGoogleApi.setAttribute("defer",true);
            document.querySelector("body").append(scriptGoogleApi);

            if (site.favicon) { document.querySelector("link[rel*='icon']").href = site.favicon; } // Set Favicon
            
            if (site.logo) { // Set site logo
                let headerSiteLogo = document.createElement("img");
                headerSiteLogo.setAttribute("id", "header-site-logo");
                headerSiteLogo.setAttribute("src", site.logo);  
                headerSiteLogo.setAttribute("class", "m-5"); 
                document.querySelector("#header-column5").append(headerSiteLogo); 
            }

            // Check for saved area
            if (!localStorage.getItem("area")) {
                localStorage.setItem("area", site.area);
                newcomer = true;
            }
            else {
                site.area = localStorage.getItem("area");
            }

        }
    };
    requestJSON.open("GET", "settings.json", true);
    requestJSON.send();
}

function loadAreaSettings(){ // Load area file as area, called from Google Maps API Callback
    var requestJSON = new XMLHttpRequest();
    requestJSON.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            area = JSON.parse(this.responseText);

            //Apply some settings
            document.title = site.name +": "+ area.name; // Set site title

            // Everything loades, build site
            buildSite()
        }
        else if (this.readyState == 4 && this.status == 404) { //If area file does not exist try to reload to default settings
            localStorage.removeItem("area");
            location.assign("/");
        }
    };
    requestJSON.open("GET", "areas/" + site.area, true);
    requestJSON.send();
}


//******************************************************************************
// Site builder functions
//******************************************************************************

function buildSite() { // Build site
    buildFooterMenu();
    loadMap();
    loadArea();


    modals["spinner"].hide(); // If we get this far it's time to close the loading screen

    if (url.get("location")) { modals[encodeURIComponent(url.get("location"))].show(); } // Show modal if ?location=
    else if (newcomer) { modals[encodeURIComponent(area.name)].show(); } // Show area modal if first time on site or changed area

}

function loadArea () { // Walk through area object and create everything connected to locations
    let locations = area.locations;
    locations.forEach(location => {
        if (location.latlng) { createMarker(location); } //Skip Marker if no coordinates, useful for creating site and system menus 
        createModal(location);
        createCard(location);
    });

    let areaModal = {
        "name": area.name,
        "description": area.description, 
    }

    createModal(areaModal);
}

function buildFooterMenu() { // Build footer menu to contain location cards

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

    let footer = document.querySelector("footer");
    footer.append(footerMenu);

    menus.footer = new bootstrap.Collapse(footerMenuCollapse, { toggle: false });

}

function createCard(location) { // Build a location card in footer menu
    var locationID = encodeURIComponent(location.name); // Create string from name that can be used as ID

    // Hardcoded default style / settings.json default_style / location style
    if (!location.style && site.default_style) { var style = site.default_style}
    else if (!location.style) { var style = "bg-light text-dark border-0"}
    else { var style = location.style}

    let card = document.createElement("div");
    card.setAttribute("class","card "+ style);
    card.onclick = function() { // onClick event to open modal and close menu
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
    

    if (location.image == "trianglify") { // Create trianglify image from location name
        let pattern =trianglify({
            height: 50,
            width: 200,
            seed: location.name,
            cellSize: 10,
            variance: 1,
        });
        cardImage.appendChild(pattern.toSVG());
    }
    else if (location.image == "color") { // Apply color generated from location name
        cardImage.style.backgroundColor = "#"+ getColor(locationID)[0];
    }
    else if (location.image) { // Apply image from area object
        cardImage.style.backgroundImage = "url("+ location.image +")";
    }
    else { // Image disabled
    }

    card.append(cardImage);

    document.querySelector("#footer-menu-container").append(card);

}

function createModal(location) { // Build a location modal in body
    var locationID = encodeURIComponent(location.name); // Create string from name that can be used as ID

    // Hardcoded default style / settings.json default_style / location style
    if (!location.style && site.default_style) { var style = site.default_style}
    else if (!location.style) { var style = "bg-light text-dark"}
    else { var style = location.style}

    let modalContent = document.createElement("div");
    modalContent.setAttribute("class","modal-content");

    let modalHeader = document.createElement("div");
    modalHeader.setAttribute("class","modal-header align-items-start " + style);
        
        let modalHeaderH = document.createElement("h1");
        modalHeaderH.innerHTML = location.name;
        modalHeader.append(modalHeaderH);

        let modalHeaderButtons = document.createElement("div");
        modalHeaderButtons.setAttribute("class","btn-group");

        let modalHeaderLink = document.createElement("a");
        modalHeaderLink.setAttribute("class","btn shadow-none border-0 " + style);
        modalHeaderLink.onclick = function(){
            copyLink(locationID, this); // Copy direct link to clipboard
        };
        modalHeaderLink.innerHTML = "<span class='material-icons link-icon'>link</span>";
        modalHeaderButtons.append(modalHeaderLink);

        let modalHeaderClose = document.createElement("a");
        modalHeaderClose.setAttribute("class","btn shadow-none border-0 " + style);
        modalHeaderClose.setAttribute("data-bs-dismiss","modal");
        modalHeaderClose.setAttribute("aria-label","Close");
        modalHeaderClose.innerHTML = "<span class='material-icons'>close</span>";
        modalHeaderButtons.append(modalHeaderClose);

        modalHeader.append(modalHeaderButtons);
    modalContent.append(modalHeader);

    if (location.image == "trianglify") { // Create trianglify image from location name
        let modalImage = document.createElement("div");
        modalImage.setAttribute("class","modal-img modal-img-slim card-img-top rounded-0");

        let pattern =trianglify({
            height: 200,
            width: 800,
            seed: location.name,
            cellSize: 15,
            variance: 1,
        });
        modalImage.appendChild(pattern.toSVG());

        modalContent.append(modalImage);
    }
    else if (location.image == "color") { // Apply color generated from location name
        let modalImage = document.createElement("div");
        modalImage.setAttribute("class","modal-img modal-img-slim card-img-top rounded-0");

        modalImage.style.backgroundColor = "#"+ getColor(locationID)[0];
        
        modalContent.append(modalImage);
    }
    else if (location.image) { // Apply image from area object
        let modalImage = document.createElement("div");
        modalImage.setAttribute("class","modal-img modal-img-slim modal-img rounded-0");
        modalImage.style.backgroundImage = "url("+ location.image +")";
        modalContent.append(modalImage);

        if (location.attribution) {
            let modalImageAttribution = document.createElement("a");
            modalImageAttribution.setAttribute("class","image-attribution");
            modalImageAttribution.setAttribute("target","_blank");
            modalImageAttribution.setAttribute("href",location.attribution[1]);
            modalImageAttribution.innerHTML = location.attribution[0];
            modalImage.append(modalImageAttribution);
        }
    }
    else { // Image disabled
    }


    if (location.description) {
        let modalBody = document.createElement("div");
        modalBody.setAttribute("class","modal-body"); //Keep body of modal always white
        //modalBody.setAttribute("class","modal-body " + style);
    
        // Evaluate markdown code to html
        let markdown = new showdown.Converter();
        modalBody.innerHTML = markdown.makeHtml(location.description);
        modalContent.append(modalBody);
    }


    // Walk through actions for location and create buttons
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
    modalFooter.setAttribute("class","modal-footer " + style);
    modalContent.append(modalFooter);

    let modalDialog = document.createElement("div");
    modalDialog.setAttribute("class","modal-dialog modal-dialog-centered modal-lg");
    modalDialog.append(modalContent);

    let modal = document.createElement("article");
    modal.setAttribute("class","modal");
    modal.setAttribute("id",locationID);
    modal.append(modalDialog);
                
    document.querySelector("body").append(modal);

    modals[locationID] =  new bootstrap.Modal(document.getElementById(locationID));
}

function copyLink(locationID, linkButton) { // Create direct link to modal and copy to clipboard
    let locationLink = window.location.href.split('?')[0] +"?area="+ site.area +"&location="+ locationID;
    let locationLinkInput = document.createElement("input");
    locationLinkInput.setAttribute("id","location-link-input");
    locationLinkInput.setAttribute("class","visually-hidden-focusable");
    locationLinkInput.setAttribute("value",locationLink);

    document.body.append(locationLinkInput);

    locationLinkInput.select();
    document.execCommand("copy");
    locationLinkInput.remove()

    let toolTip = new bootstrap.Tooltip(linkButton, {
        title: "Adressen kopierad"
    });

    linkButton.querySelector(".link-icon").innerHTML = "check_box";
    linkButton.querySelector(".link-icon").classList.add("text-success");
    toolTip.show();
    setTimeout(function(linkButton){
        linkButton.querySelector(".link-icon").innerHTML = "link";
        linkButton.querySelector(".link-icon").classList.remove("text-success");
    }, 500, linkButton);


}


//******************************************************************************
// Map functions
//******************************************************************************

function loadMap() { // Create map
    let centerPoint = { lat: area.latlng[0], lng: area.latlng[1] };
    if (area.zoom) { var zoom = area.zoom }
    else { zoom = 15 }

    map = new google.maps.Map(document.querySelector("main"), {
        zoom: zoom,
        center: centerPoint,
        mapTypeId: 'satellite',
        disableDefaultUI: true
    });
}

function createMarker(location) { // Create a location marker on map
    var locationID = encodeURIComponent(location.name);

    let marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        title: location.name,
        position: {
            lat: location.latlng[0],
            lng: location.latlng[1]
        }
    });
    marker.addListener("click", () => {
        modals[locationID].show();
    });
}


//******************************************************************************
// Helper functions
//******************************************************************************

function getColor(s, scheme) { // Take string and return colorcode
    var chk = 0x111111;
    var len = s.length;
    for (var i = 0; i < len; i++) {
        chk += (s.charCodeAt(i) * (i + 12345));
    }
  
    var baseColor = (chk & 0xffffff).toString(16);
  
    var colors = [baseColor] 
  
    if (scheme) {
        let colorScheme = new ColorScheme;
        colorScheme.from_hex(baseColor);
        colors = colors.concat(colorScheme.colors());
  
    }
  
    return colors;
}
