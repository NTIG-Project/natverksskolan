function initMap() {
    const centerPoint = { lat: 63.8256912, lng: 20.2631702 };
    const map = new google.maps.Map(document.getElementById("map-wrapper"), {
        zoom: 15,
        center: centerPoint,
        mapTypeId: 'satellite',
        disableDefaultUI: true
    });
}