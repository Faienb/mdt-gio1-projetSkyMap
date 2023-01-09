<template>
  <div id="cesium-container"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';
import { store } from '../../store';
import { GetParsedCatalog } from '../../main';

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
        store.lon, store.lat, 5000, new Cesium.Cartographic());
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
        timeline: true,
        animation: true,
        geocoder: true,
        navigationInstructionsInitiallyVisible: false,
        navigationHelpButton: false,
        scene3DOnly: true
      });
      viewer.scene.primitives.add(Cesium.createOsmBuildings());

      //Remove atmosphere to show night sky
      viewer.scene.skyAtmosphere.show = false;
      viewer.scene.fog.enabled = false;
      viewer.scene.globe.showGroundAtmosphere = false;
      return viewer;
    },
    setUpSkyGlobe(viewer){
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
          slicePartitions: 60,
          stackPartitions: 60,
        },
      })
      const polarisTest = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.defaultheight + 100000.0),
        name: "Polaris star test mag:1.5",
        ellipsoid: {
          radii: new Cesium.Cartesian3(10000.0, 10000.0, 10000.0),
          material: Cesium.Color.WHITE,
          glowPower: 0.5
        },
      })
    }
  },
  async mounted() {
    // add cesium ion token to the app
    Cesium.Ion.defaultAccessToken = process.env.VUE_APP_CESIUM_ION_TOKEN;
    this.viewer = this.setupCesiumGlobe();
    if (store.lat === undefined) {
      console.log("attention tu n'a pas encore sélectionné de poit d'observation petit con !")
    }
    else {

      this.center[0] = store.lon;
      this.center[1] = store.lat;
      this.defaultheight = await this.GetAltitudofPoint(this.viewer) + 20.0;
      
      //catalog = GetParsedCatalog("")
    }
    console.log(this.defaultheight);
    this.setUpSkyGlobe(this.viewer);
    this.flytodirection(this.center, this.defaultheight, this.viewer);

  }
};
</script>

<style scoped>
#cesium-container {
  height: 500px;
}
</style>
