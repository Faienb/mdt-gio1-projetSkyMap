<template>
  <div id="l-container"></div>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { store } from '../../store';
const Telescope = L.icon({
  iconUrl: 'telescope48.png',

  iconSize: [48, 48], // size of the icon
  iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
  popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
})
export default {
  name: 'LeafletMapView',
  data() {
    return {
      center: [46.801111, 8.226667],
      lmap: null,
      zoom: 8,
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
    },
    onMapClick(e) {
      L.popup()
        .setLatLng(e.latlng)
        .setContent("Current observation point : Lat WGS84 = " + e.latlng.lat.toFixed(6) + " Lon WGS84 = " + e.latlng.lng.toFixed(6))
        .openOn(this.lmap);
      L.marker(e.latlng, { icon: Telescope }).addTo(this.lmap);
      store.LatWGS84 = e.latlng.lat;
      store.LonWGS84 = e.latlng.lng;
    }
  },
  mounted() {
    this.lmap = this.setupLeafletMap(this.center, this.zoom);

    if (this.lmap.hasLayer(Telescope)) {
      this.lmap.removeLayer(Telescope);
    }
    this.lmap.on('click', event => this.onMapClick(event));
  }
};
</script>

<style scoped>
#l-container {
  height: 500px;
}
</style>
