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
      viewer.scene.sun.show = false;
      return viewer;
    },
    setUpSkyGlobe(viewer) {
      var dashedLine = viewer.entities.add({
        name: 'Direction to observator',
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
        name: "Celestial Sphere",
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

    ComputeMagnitude(mag) {
      const c = 1000;
      const bSirius = -1.47;
      //should be 0.4 to be accurate
      let r = c / (10 ** (0.2 * mag));
      if (mag < -20) {
        r = 2500;
      }
      return r;
    },

    displayStars(viewer, CoorTRS, name, color, mag) {
      let SkyObjectName = name;
      let xTRS = CoorTRS[0];
      let yTRS = CoorTRS[1];
      let zTRS = CoorTRS[2];
      let r = this.ComputeMagnitude(mag)
      const SkyObject = viewer.entities.add({
        position: Cesium.Cartesian3.fromArray([xTRS, yTRS, zTRS]),
        name: SkyObjectName,
        ellipsoid: {
          radii: new Cesium.Cartesian3(r, r, r),
          material: color,
          glowPower: 1.0,
        },
      })
    },
    displayDeepSkyObjects(viewer, CoorTRS, name, color, mag) {
      let SkyObjectName = name;
      let xTRS = CoorTRS[0];
      let yTRS = CoorTRS[1];
      let zTRS = CoorTRS[2];
      const bSirius = -1.47;
      let r = this.ComputeMagnitude(mag)
      const SkyObject = viewer.entities.add({
        position: Cesium.Cartesian3.fromArray([xTRS, yTRS, zTRS]),

        name: SkyObjectName,
        ellipsoid: {
          radii: new Cesium.Cartesian3(r, r, r),
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
    let NGCCatalog = await GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=ngc-ic-messier-catalog&q=&rows=1000&sort=-v_mag&facet=catalog&facet=object_definition&facet=const&facet=hubble&refine.object_definition=Galaxy", store);
    let HYGStellarCatalog = await GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=hyg-stellar-database&q=&rows=2000&sort=-mag&facet=mag", store);
    for (const key in MessierCatalog) {
      if (MessierCatalog[key].fields.xTRS !== undefined) {
        let name = MessierCatalog[key].fields.messier + ", Relative magnitude : " + MessierCatalog[key].fields.mag.toFixed(1);
        let mag = MessierCatalog[key].fields.mag;
        let CoorTRS = [MessierCatalog[key].fields.xTRS, MessierCatalog[key].fields.yTRS, MessierCatalog[key].fields.zTRS];
        this.displayDeepSkyObjects(this.viewer, CoorTRS, name, Cesium.Color.LIGHTCORAL.withAlpha(0.5), mag);
      }
    }
    for (const key in NGCCatalog) {
      if (NGCCatalog[key].fields.xTRS !== undefined) {
        let NGCName = '';
        if ('common_names' in NGCCatalog[key].fields) {
          NGCName = NGCCatalog[key].fields.common_names;
        }
        NGCName = NGCName + " " + NGCCatalog[key].fields.name;
        let name = NGCName + ", Relative magnitude : " + NGCCatalog[key].fields.v_mag.toFixed(1);
        let mag = NGCCatalog[key].fields.v_mag;
        let CoorTRS = [NGCCatalog[key].fields.xTRS, NGCCatalog[key].fields.yTRS, NGCCatalog[key].fields.zTRS];
        this.displayDeepSkyObjects(this.viewer, CoorTRS, name, Cesium.Color.LIGHTGREEN.withAlpha(0.5), mag);
      }
    }
    for (const key in HYGStellarCatalog) {
      if (HYGStellarCatalog[key].fields.xTRS !== undefined) {
        let StarName = '';
        if ('proper' in HYGStellarCatalog[key].fields) {
          StarName = HYGStellarCatalog[key].fields.proper + " " + HYGStellarCatalog[key].fields.bf;
        }
        else if ('bf' in HYGStellarCatalog[key].fields) {
          StarName = HYGStellarCatalog[key].fields.bf;
        }
        else {
          StarName = HYGStellarCatalog[key].fields.gl
        }
        let name = StarName + ", Relative magnitude : " + HYGStellarCatalog[key].fields.mag.toFixed(1);
        let mag = HYGStellarCatalog[key].fields.mag;
        let CoorTRS = [HYGStellarCatalog[key].fields.xTRS, HYGStellarCatalog[key].fields.yTRS, HYGStellarCatalog[key].fields.zTRS];
        this.displayStars(this.viewer, CoorTRS, name, Cesium.Color.WHITE, mag);
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
