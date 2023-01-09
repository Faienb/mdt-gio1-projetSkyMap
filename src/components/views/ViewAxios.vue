<template>
  <div class="card">
    <div class="card-content">
      <p>Ville : {{ ville }} (altitude: {{ elevation }}m)</p>
	  <p>Date : {{ date }} (heure: {{ heure }})</p>
	  <p>Conditions actuelles : {{ condActuelles }} <img height="20" width="20" v-bind:src="condActuellesIcon" /></p>
	</div>
    <footer class="card-footer">
      <p class="card-footer-item">
        <span>
          <a target="_blank" rel="noopener noreferrer" :href="url">
		  {{previsionMeteo}}
		  </a>
        </span>
      </p>
    </footer>
  </div>
</template>

<script>

import axios from 'axios'

export default {
	
    name: 'myTest',
	data() {
        return {
			previsionApiUrl: 'https://www.prevision-meteo.ch/services/json/nyon',
			url: 'http://www.prevision-meteo.ch',
			previsionMeteo: 'prevision-meteo.ch',
			ville: '',
			elevation: '',
			date: '',
			heure: '',
			condActuelles: '',
			condActuellesIcon: '',
			results: ''
        };
    },
	
    async mounted() {
		try{
			const result = await axios.get(this.previsionApiUrl);
			this.results = result;
			this.ville = result.data.city_info.name;
			this.elevation = result.data.city_info.elevation;
			this.date = result.data.current_condition.date;
			this.heure = result.data.current_condition.hour;
			this.condActuelles = result.data.current_condition.condition;
			this.condActuellesIcon = result.data.current_condition.icon;
			console.log(result);
		} catch (e){
			console.error(e)
		}
	}
}
</script>

<style scoped>
.card {
	font-size: 14px;
	width: 75%;
	margin: auto;
}
.card-content {
	font-size: 20px;
	text-align: left;
}
.card-footer {
	font-size: 24px;
	color: #41B883;
}
a {
	font-size: 12px;
	color: #41B883;
}
a:hover {
	color: #41B883;
}
</style>
