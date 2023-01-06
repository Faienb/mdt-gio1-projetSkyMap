import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bulma/css/bulma.css';

const VUE_APP = createApp(App);
VUE_APP.use(router);
VUE_APP.mount('#app');

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

function ConvertCoordinates(catalog) {

}

function GetParsedCatalog(stringUrl) {
  return retrieveCatalogue(stringUrl)
    .then(response => {
      const catalog = {};
      const catalogParsed = JSON.parse(response);
      for (const key in catalogParsed.records){
        catalog[key] = catalogParsed.records[key];
      }

      
      return catalog;
    })
    .catch(error => {
      console.error(error);
      return error;
    });
}


const MessierCatalog = GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=catalogue-de-messier&q=&rows=110&facet=objet&facet=saison&facet=mag&facet=english_name_nom_en_anglais&facet=french_name_nom_francais&facet=latin_name_nom_latin&facet=decouvreur&facet=annee");
const NGCCatalog = GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=ngc-ic-messier-catalog&q=&rows=10000&sort=name&facet=catalog&refine.catalog=NGC");
const HYGStellarCatalog = GetParsedCatalog("https://www.datastro.eu/api/records/1.0/search/?dataset=hyg-stellar-database&q=&rows=10000&start=0&sort=mag&facet=mag");