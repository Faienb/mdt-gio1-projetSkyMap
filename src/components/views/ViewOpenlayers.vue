<template>
  <div id="ol-container" class="map"></div>
</template>

<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import LayerVector from 'ol/layer/Vector';
import SourceVector from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import Icon from 'ol/style/Icon.js';
import Style from 'ol/style/Style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default {
  data() {
    return {
      center: [8.226667, 46.801111],
      olmap: null,
      zoom: 8
    };
  },
  computed: {
    /**
     * Transform coordinate from EPSG:4326 to EPSG:3857
     *
     * @use center in EPSG:4326
     * @return center in EPSG:3857
     */
    center3857() {
      return olProj.transform(this.center, 'EPSG:4326', 'EPSG:3857');
    }
  },
  methods: {
    /**
     * Init Openlayers map
     *
     * @param {number[]} mapcenter center of the map in EPSG:3857
     * @param {number} mapzoom zommlevel
     * @returns {Map} initmap new openlayers map
     */
    setupOpenlayersMap(mapcenter, mapzoom) {
      return new Map({
        target: 'ol-container',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`
            })
          })
        ],
        view: new View({
          center: mapcenter,
          zoom: mapzoom,
          minZoom: 8,
          maxZoom: 18,
        })
      });
    }
  },
  mounted() {
    //Ajout à chaque clic d'une nouvelle couche avec le marker
    function setUpmarker(ObsPoint) {
      let TelescopeMarker = new LayerVector({
        source: new SourceVector({
          features: [
            new Feature({
              geometry: new Point(ObsPoint)
            })
          ]
        }),
        style: new Style({
          image: new Icon({
            src: "telescope48.png",
            anchor: [0.5, 0.5]
          })
        })
      })
      return TelescopeMarker;
    }
    this.olmap = this.setupOpenlayersMap(this.center3857, this.zoom);
    let marker = setUpmarker(this.center3857);
    this.olmap.addLayer(marker);
    this.olmap.on('singleclick', function (evt) {
      //Ajout à chaque clic d'une nouvelle couche avec le marker
      let ObsPoint = evt.coordinate;
      console.log(ObsPoint);
      // convert coordinate to EPSG4326
      console.log(olProj.transform(ObsPoint, 'EPSG:3857', 'EPSG:4326'));
    });
  },
};
</script>

<style scoped>
#ol-container {
  height: 500px;
}
</style>
