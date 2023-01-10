import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bulma/css/bulma.css';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';


const VUE_APP = createApp(App);
VUE_APP.use(router);
VUE_APP.mount('#app');

function localSideralTime(longitude) {//longitude et valeur de retour en degrés décimaux => à convertir en h:m:s par la suite en divisant d'abord par 15)
  var datetime = new Date(Date.now()),
    Y = datetime.getUTCFullYear(),
    M = datetime.getUTCMonth() + 1,//en javascript : janvier = 0 !
    D = datetime.getUTCDate(),
    h = datetime.getUTCHours(),
    m = datetime.getUTCMinutes(),
    s = datetime.getUTCSeconds();

  D += h / 24 + m / 60 / 24 + s / 3600 / 24;//pour avoir la fraction du jour sous forme décimale

  return sideralTimeGreewich(julianDay(D, M, Y)) + longitude;// longitude > 0 --> Est
}

function julianDay(D, M, Y) {
  var A, B;

  if (M <= 2) {
    M += 12;
    Y -= 1;
  }

  A = Math.trunc(Y / 100);

  if (Y < 1582) B = 0;//si l'année est une date dans le calendrier julien
  else B = Math.trunc(2 - A + Math.trunc(A / 4));

  return Math.trunc(365.25 * (Y + 4716))
    + Math.trunc(30.6001 * (M + 1))
    + D + B - 1524.5;
}

function sideralTimeGreewich(julianday) {
  var T = (julianday - 2451545.0) / 36525,
    temp = (
      + 280.46061837
      + 360.98564736629 * (julianday - 2451545)
      + 0.000387933 * T * T
      - (T * T * T) / 38710000
    ) % 360;//opération modulo peut donner un résultat négatif...
  if (temp < 0) temp += 360;//...si c'est le cas, ajouter 360°

  return temp;
}

function RaDe2000toTRSCartesian(catalog, positionObs) {
  console.log(catalog);
  let pos = new Cartesian3.fromDegrees(positionObs.LonWGS84, positionObs.LatWGS84, positionObs.Height);
  let x0TRS = pos.x;
  let y0TRS = pos.y;
  let z0TRS = pos.z;
  let SideralTime = localSideralTime(positionObs.LonWGS84);
  let latRad = positionObs.LatWGS84 * Math.PI / 180.0;
  let lonRad = positionObs.LonWGS84 * Math.PI / 180.0;
  for (const key in catalog) {
    if (catalog[key].fields.ra !== undefined && catalog[key].fields.dec !== undefined) {
      let RaJ2000 = catalog[key].fields.ra
      let DecJ2000 = catalog[key].fields.dec
      let Radeg;
      let Decdeg;
      if (typeof RaJ2000 === 'string') {
        Radeg = Number(RaJ2000.split(":")[0]) + Number(RaJ2000.split(":")[1]) / 60 + Number(RaJ2000.split(":")[1]) / 3600;
        Decdeg = Number(DecJ2000.split(":")[0]) + Number(DecJ2000.split(":")[1]) / 60 + Number(DecJ2000.split(":")[1]) / 3600;
      }
      else {
        Radeg = Number(RaJ2000);
        Decdeg = Number(DecJ2000);
      }
      let angleHoraire = SideralTime - Radeg;
      let hauteurRad = Math.asin(Math.cos(latRad) * Math.cos(Decdeg * Math.PI / 180.0) * Math.cos(angleHoraire * Math.PI / 180.0) + Math.sin(latRad) * Math.sin(Decdeg * Math.PI / 180.0));
      let a = (-Math.cos(Decdeg * Math.PI / 180.0) * Math.cos(latRad) * Math.sin(angleHoraire * Math.PI / 180.0))
      let b = (Math.sin(Decdeg * Math.PI / 180.0) - Math.sin(latRad) * Math.cos(angleHoraire * Math.PI / 180.0))
      let azimutRad = Math.atan2(a, b);
      let hauteurDeg = hauteurRad * 180.0 / Math.PI;
      let azimutDeg = azimutRad * 180.0 / Math.PI;

      //Convert into cartesian coordinates
      let r = 100000.0;
      let xTopo = r * Math.cos(hauteurRad) * Math.cos(azimutRad);
      let yTopo = r * Math.cos(hauteurRad) * Math.sin(azimutRad);
      let zTopo = r * Math.sin(hauteurRad);
      //Convert into TRS coordinates
      let xTRS = x0TRS + (-Math.sin(latRad) * Math.cos(lonRad) * xTopo - Math.sin(lonRad) * yTopo + Math.cos(latRad) * Math.cos(lonRad) * zTopo);
      let yTRS = y0TRS + (-Math.sin(latRad) * Math.sin(lonRad) * xTopo + Math.cos(lonRad) * yTopo + Math.cos(latRad) * Math.sin(lonRad) * zTopo);
      let zTRS = z0TRS + (Math.cos(latRad) * xTopo + Math.sin(latRad) * zTopo);

      //Update coordinates
      catalog[key].fields.xTRS = xTRS;
      catalog[key].fields.yTRS = yTRS;
      catalog[key].fields.zTRS = zTRS;
    }
    else {
      catalog[key].fields.xTRS = undefined;
    }
  }
  return catalog
}

export function GetParsedCatalog(stringUrl, positionObs) {
  return fetch(stringUrl)
    .then(response => response.json())
    .then(catalog => RaDe2000toTRSCartesian(catalog.records, positionObs))
    .catch(error => {
      console.error(error);
      return error;
    });
}