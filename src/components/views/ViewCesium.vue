<template>
  <div id="cesium-container"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';

export default {
  name: 'CesiumGlobeView',
  data() {
    return {
      center: [0.0, 0.0],
      defaultheight: 0.0,
      viewer: null
    };
  },
  methods: {
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
          pitch: Cesium.Math.toRadians(0.0),
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
        sceneMode: Cesium.SceneMode.SCENE3D,
        globe: false,
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        geocoder: false,
        skyBox: false
      });
      //viewer.scene.primitives.add(Cesium.createOsmBuildings());
      //viewer.scene.globe.showGroundAtmosphere = false
      //viewer.scene.skyBox.brightnessShift = 0.5;
      const skySphere = viewer.entities.add({
        name: "Yellow ellipsoid outline",
        position: Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.defaultheight),
        ellipsoid: {
          radii: new Cesium.Cartesian3(100.0, 100.0, 100.0),
          fill: false,
          outline: true,
          outlineColor: Cesium.Color.YELLOW,
          slicePartitions: 60,
          stackPartitions: 60,
        },
      })
      const brownCircle = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.defaultheight),
        name: "Brown circle at height with outline",
        ellipse: {
          semiMinorAxis: 100.0,
          semiMajorAxis: 100.0,
          height: -1.0,
          material: Cesium.Color.BLACK,
          outline: true, // height must be set for outline to display
        },
      })
      const polarisTest = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.defaultheight+99.0),
        name: "Polaris star test",
        ellipsoid: {
          radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
          material: Cesium.Color.WHITE,
          glowPower: 0.5
        },
      })
      return viewer;
    }
  },
  mounted() {
    // add cesium ion token to the app
    Cesium.Ion.defaultAccessToken = process.env.VUE_APP_CESIUM_ION_TOKEN;

    this.viewer = this.setupCesiumGlobe();
    this.flytodirection(this.center, this.defaultheight, this.viewer);
  }
};
</script>

<style scoped>
#cesium-container {
  height: 500px;
}
</style>
