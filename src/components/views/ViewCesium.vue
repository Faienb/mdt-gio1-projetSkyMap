<template>
  <div id="cesium-container"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';
import { store } from '../../store';
import { GetParsedCatalog } from '../../main';
import { is } from '@babel/types';
import SkyBox from 'cesium/Source/Scene/SkyBox';

export default {
  name: 'CesiumGlobeView',
  data() {
    return {
      center: [7.33487, 46.19804],
      defaultheight: 2000.0,
      viewer: null
    };
  },
  methods: {
    GetAltitudofPoint(viewer) {
      var pointOfInterest = Cesium.Cartographic.fromDegrees(
        this.center[0], this.center[1], 5000, new Cesium.Cartographic());
      // Sample the terrain (async) and write the answer to the console.
      return Cesium.sampleTerrain(viewer.terrainProvider, 9, [pointOfInterest])
        .then(function (samples) {
          console.log('Height in meters is: ' + samples[0].height);
          return samples[0].height
        });
    },
    /**
     * Fly to position
     *
     * @param {number[]} globecenter position to fly to
     * @param {number} globeheight altitude
     * @param {Viewer} viewer cesium viewer
     */
    flytodirection(globecenter, globeheight, viewer) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          globecenter[0],
          globecenter[1],
          globeheight
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(10.0),
          roll: Cesium.Math.toRadians(0.0),
        },
      });
    },
    /**
     * Init Cesium globe
     *
     * @returns {Viewer} viewer from cesium
     */
    setupCesiumGlobe() {
      let viewer = new Cesium.Viewer('cesium-container', {
        terrainProvider: new Cesium.createWorldTerrain(),
        fullscreenButton: false,
        homeButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        animation: false,
        geocoder: true,
        navigationInstructionsInitiallyVisible: false,
        navigationHelpButton: false,
        scene3DOnly: true,
      });
      viewer.scene.primitives.add(Cesium.createOsmBuildings());

      //Remove atmosphere to show night sky
      viewer.scene.skyAtmosphere.show = false;
      viewer.scene.fog.enabled = false;
      viewer.scene.globe.showGroundAtmosphere = false;
      viewer.scene.skyBox.show = false;
      return viewer;
    },
    setUpSkyGlobe(viewer) {
      var dashedLine = viewer.entities.add({
        name: 'Blue dashed line',
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([this.center[0], this.center[1], this.defaultheight,
          this.center[0], this.center[1], this.defaultheight - 100.0]),
          width: 4,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN
          })
        }
      });

      var center = Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.defaultheight);
      var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(0, -Math.PI / 4, 200));

      const skySphere = viewer.entities.add({
        name: "Yellow ellipsoid outline",
        position: Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.defaultheight),
        ellipsoid: {
          radii: new Cesium.Cartesian3(100000.0, 100000.0, 100000.0),
          fill: false,
          outline: true,
          outlineColor: Cesium.Color.LIGHTBLUE,
          slicePartitions: 24,
          stackPartitions: 24,
        },
      })
    },
    displayStars(viewer, ObjectInfo, name, color) {
      let SkyObjectName = name;
      let xTRS = ObjectInfo.fields.xTRS;
      let yTRS = ObjectInfo.fields.yTRS;
      let zTRS = ObjectInfo.fields.zTRS;
      const SkyObject = viewer.entities.add({
        position: Cesium.Cartesian3.fromArray([xTRS, yTRS, zTRS]),
        name: SkyObjectName,
        ellipsoid: {
          radii: new Cesium.Cartesian3(500.0, 500.0, 500.0),
          material: color,
          glowPower: 1.0
        },
      })
    }
  },
  async mounted() {
    // add cesium ion token to the app
    Cesium.Ion.defaultAccessToken = process.env.VUE_APP_CESIUM_ION_TOKEN;
    this.viewer = this.setupCesiumGlobe();
    if (store.LatWGS84 === undefined) {
      console.log("attention tu n'a pas encore sélectionné de poit d'observation petit con !")
      alert("Attention vous n'avez pas sélectionné de point d'observation !")
      store.LatWGS84 = this.center[1];
      store.LonWGS84 = this.center[0];
      this.defaultheight = await this.GetAltitudofPoint(this.viewer) + 50.0;
      console.log(this.defaultheight);
    }
    else {

      this.center[0] = store.LonWGS84;
      this.center[1] = store.LatWGS84;
      this.defaultheight = await this.GetAltitudofPoint(this.viewer) + 50.0;
    }
    store.Height = this.defaultheight;
    this.setUpSkyGlobe(this.viewer);
    this.flytodirection(this.center, this.defaultheight, this.viewer);

    //Recuperation de la date et de l'heure de l'observation
    store.Date = new Date().toISOString();
    console.log(store.Date);

    //Affichage des étoiles
    let MessierCatalog = await GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=catalogue-de-messier&q=&rows=110&facet=objet&facet=saison&facet=mag&facet=english_name_nom_en_anglais&facet=french_name_nom_francais&facet=latin_name_nom_latin&facet=decouvreur&facet=annee", store);
    let NGCCatalog = await GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=ngc-ic-messier-catalog&q=&rows=1000&sort=name&facet=catalog&facet=object_definition&facet=const&facet=hubble", store);
    let HYGStellarCatalog = await GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=hyg-stellar-database&q=&rows=1000&sort=mag&facet=mag", store);
    for (const key in MessierCatalog) {
      if (MessierCatalog[key].fields.xTRS !== undefined) {
        let name = MessierCatalog[key].fields.messier;
        this.displayStars(this.viewer, MessierCatalog[key], name, Cesium.Color.LIGHTCORAL.withAlpha(0.5));
      }
    }
    for (const key in NGCCatalog) {
      if (NGCCatalog[key].fields.xTRS !== undefined) {
        let name = NGCCatalog[key].fields.name;
        this.displayStars(this.viewer, NGCCatalog[key], name, Cesium.Color.LIGHTGREEN.withAlpha(0.5));
      }
    }
    for (const key in HYGStellarCatalog) {
      if (HYGStellarCatalog[key].fields.xTRS !== undefined) {
        let name = HYGStellarCatalog[key].fields.gl;
        this.displayStars(this.viewer, HYGStellarCatalog[key], name, Cesium.Color.WHITE);
      }
    }
  }
};
</script>

<style scoped>
#cesium-container {
  height: 600px;
}
</style>
