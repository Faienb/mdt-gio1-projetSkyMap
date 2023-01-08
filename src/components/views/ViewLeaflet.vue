<template>
  <div id="l-container"></div>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default {
  name: 'LeafletMapView',
  data() {
    return {
      center: [46.801111, 8.226667],
      lmap: null,
      zoom: 8
    };
  },
  methods: {
    /**
     * Init Leaflet map
     *
     * @param {number[]} mapcenter center of the map in EPSG:3857
     * @param {number} mapzoom zommlevel
     * @returns {Map} initmap new leaflet map
     */
    setupLeafletMap(mapcenter, mapzoom) {
      let initmap = L.map('l-container').setView(mapcenter, mapzoom);
      L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
        maxZoom: 18,
        minZoom: 8,
        attribution:
          '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(initmap);
      return initmap;
    }
  },
  mounted() {
    var Telescope = L.icon({
      iconUrl: 'telescope48.png',

      iconSize: [48, 48], // size of the icon
      iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
      popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    this.lmap = this.setupLeafletMap(this.center, this.zoom);
    let map = this.lmap;
    var popup = L.popup();

    function onMapClick(e) {
      popup
        .setLatLng(e.latlng)
        .setContent("Current observation point : Lat WGS84 = " + e.latlng.lat.toFixed(6) + "Lon WGS84 = " + e.latlng.lng.toFixed(6))
        .openOn(map);
      L.marker(e.latlng, { icon: Telescope }).addTo(map);
    }
    if (map.hasLayer(Telescope)) {
      map.removeLayer(Telescope);
    }
    map.on('click', onMapClick);
  }
};
</script>

<style scoped>
#l-container {
  height: 500px;
}
</style>
