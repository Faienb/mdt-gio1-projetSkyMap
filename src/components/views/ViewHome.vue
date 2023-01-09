<template>
<div class="template">
  <div class="main">
  <p class="title">{{ title }}</p>
  <div class="bodytext" id="left">
  Notre projet a pour objectif de réaliser une application Web géo-portail basée sur le framework VueJS.<br>
  Notre choix de sujet s’est porté sur le monde céleste. Le but de cette application est d’afficher certaines caractéristiques des étoiles notamment… Pour ce faire, nous avons utilisé la bibliothèque Leaflet en affichant une carte 2D du monde et par un clic de souris on récupère les coordonnées X, Y du point. Puis on utilise, la bibliothèque Cesium pour afficher certaines caractéristiques d’une étoile.
  </div>
  <div class="image" id="webb"></div>
  </div>
  <div class="main">
  <div class="image" id="milky"></div>
  <div class="bodytext" id="sub-title">Outils utilisés</div>
  <div class="bodytext" id="right">
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/git.png" height="25px" width="25px"></div><div class="bodytext" id="iconright">Git</div></div>
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/vs.jpg" height="25px" width="25px"></div><div class="bodytext" id="iconright">Visual Studio Code</div></div>
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/vue.png" height="25px" width="25px"></div><div class="bodytext" id="iconright">Vue.js</div></div>
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/nodejs.png" height="25px" width="25px"></div><div class="bodytext" id="iconright">NodeJS</div></div>
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/leaflet.jpg" height="25px" width="25px"></div><div class="bodytext" id="iconright">2D Leaflet</div></div>
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/cesium.png" height="25px" width="25px"></div><div class="bodytext" id="iconright">3D Cesium</div></div>
  </div>
  <div class="bodytext" id="sub-title">Conception de l'application</div>
  <div class="bodytext" id="right">
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/icon_pers.jpg" height="25px" width="25px"></div><div class="bodytext" id="iconright">Roxane Cuendet</div></div>
  <div class="main"><div class="bodytext" id="icon"><img src="../../assets/icon_pers.jpg" height="25px" width="25px"></div><div class="bodytext" id="iconright">Fabien Délèze</div></div>
  </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      title: 'Géoinformatique Opérationnelle'

    };
  }
};
</script>

<style scoped>
.template {
	width: 100%;
  border: 0px solid black;
  padding-left: 20%;
  padding-right: 20%;
}
.main {
	width: 100%;
  float: left;
  border: 0px solid black;
}
.title {
	font-size: 16px;
	width: 100%;
	margin: auto;
  border: 0px solid black;
  padding: 10px;
}
#sub-title {
  font-size: 14px;
  font-weight: bold;
  float: right;
}
.bodytext {
	font-size: 14px;
  text-align: justify;
  width: 66%;
	margin: auto;
  border: 0px solid black;
  padding: 10px;
}
#left {
  float: left;
}
#right {
  float: right;
}
#iconright {
  width: 90%;
  text-align: left;
  float: right;
}
.image{
	width: 34%;
  text-align: left;
	margin: auto;
  border: 0px solid black;
  padding: 10px;
}

#icon {
  width: 10%;
  float: left;
  height: 100%;
  padding: 5px;

}

#milky {
  content:url(../../assets/designed_milky_way.png);
  float: left;
}
#webb {
  content:url(../../assets/james_webb.jpg);
  float: right;
}


</style>