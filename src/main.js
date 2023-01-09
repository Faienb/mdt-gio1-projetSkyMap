import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bulma/css/bulma.css';


const VUE_APP = createApp(App);
VUE_APP.use(router);
VUE_APP.mount('#app');

let positionObs = {
  "Date": "06.01.2023",
  "Heure": "15:44.55",
  "LonWGS84": 7.59527,
  "LatWGS84": 46.25247
}
//Simplifier tout ça en utilisant l'API fetch
//supprimer méthode et utiliser fetch
function retrieveCatalogue(stringUrl) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", stringUrl);
    request.send();
    request.onload = () => {
      if (request.status === 200) {
        resolve(request.response);
      } else {
        reject(Error(request.statusText));
      }
    };
    request.onerror = () => {
      reject(Error("Erreur réseau"));
    };
  });
}

function RaDeJ2000toRaDeObs(catalog, positionObs) {
  //Determination des variables
  let year = Number(positionObs["Date"].split(".")[2]);
  let month = Number(positionObs["Date"].split(".")[1]);
  let day = Number(positionObs["Date"].split(".")[0]);
  let hour = Number(positionObs["Heure"].split(".")[0]);
  let minute = Number(positionObs["Heure"].split(".")[1]) / 60;
  let second = Number(positionObs["Heure"].split(".")[2]) / 3600;
  hour = hour + minute + second;

  let longitude = positionObs["LonWGS84"] * Math.PI / 180.0;
  let latitude = positionObs["LatWGS84"] * Math.PI / 180.0;

  // Étape 1 : calcule de l'angle d'obliquité de l'écliptique
  var Jday = 367 * year - Math.floor((7 * (year + Math.floor((month + 9) / 12))) / 4) + Math.floor((275 * month) / 9) + day + 1721013.5 + hour / 24;
  var obliquity = 23.4393 - 3.563E-7 * (Jday - 2451545);

  // Étape 2 : calcule du temps sidéral moyen
  var MeanSideralTime = 280.46061837 + 360.98564736629 * (Jday - 2451545);

  // Étape 3 : calcule du temps sidéral apparent
  var ApparentSideralTime = MeanSideralTime + longitude;

  for (const key in catalog) {
    console.log(catalog.key.fields);
    let RaJ20000 = catalog.key.fields.ra * Math.PI / 180.0;
    let DecJ2000 = catalog.key.fields.dec * Math.PI / 180.0;

    // Étape 4 : calcule de l'ascension droite et de la déclinaison
    var RaObs = (ApparentSideralTime / 15 + RaJ20000) * 180.0 / Math.PI;
    var DecObs = (Math.asin(Math.sin(obliquity) * Math.sin(latitude))) * 180.0 / Math.PI;

    catalog.key.fields.RaObs = RaObs;
    catalog.key.fields.DecObs = DecObs;
  }

  return catalog;
}

export function GetParsedCatalog(stringUrl, positionObs) {
  return fetch(stringUrl)
    .then(response => response.json())
    .then(catalog => RaDeJ2000toRaDeObs(catalog.records, positionObs))
    .catch(error => {
      console.error(error);
      return error;
    });
}


//const MessierCatalog = GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=catalogue-de-messier&q=&rows=110&facet=objet&facet=saison&facet=mag&facet=english_name_nom_en_anglais&facet=french_name_nom_francais&facet=latin_name_nom_latin&facet=decouvreur&facet=annee");
//const NGCCatalog = GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=ngc-ic-messier-catalog&q=&rows=10000&sort=name&facet=catalog&refine.catalog=NGC");
//const HYGStellarCatalog = GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=hyg-stellar-database&q=&rows=10000&start=0&sort=mag&facet=mag");