<template>
	<div class="card">
		<div class="card-content">
			<p>Observation point : LatWGS84 = {{ Lat }} [°], LonWgs84 {{ Lon }} [°], Altitude {{ elevation }} [m]</p>
			<p>Date : {{ date }} {{ heure }}</p>
			<p>Sunrise : {{ sunrise }}, Sunset {{ sunset }}</p>
			<p>Actual Conditions : {{ condActuelles }} <img height="20" width="20" v-bind:src="condActuellesIcon" />
			</p>
			<p>Temperature : {{ temperature }} [°C]</p>
			<p>Pression : {{ pression }} [hPa]</p>
			<p>Humidity : {{ humidity }} [%]</p>
			<p>Wind speed : {{ windSpeed }} [m/s]</p>
			<p>Wind direction : {{ WindDir }}</p>

		</div>
		<footer class="card-footer">
			<p class="card-footer-item">
				<span>
					<a target="_blank" rel="noopener noreferrer" :href="url">
						{{ previsionMeteo }}
					</a>
				</span>
			</p>
		</footer>
	</div>
</template>

<script>

import axios from 'axios'
import { store } from '../../store';

export default {

	name: 'myTest',
	data() {
		return {
			previsionApiUrl: 'https://www.prevision-meteo.ch/services/json/veysonnaz',
			url: 'http://www.prevision-meteo.ch',
			previsionMeteo: 'prevision-meteo.ch',
			elevation: '',
			date: '',
			heure: '',
			condActuelles: '',
			condActuellesIcon: '',
			Lat: '',
			Lon: '',
			sunrise: '',
			sunset: '',
			temperature: '',
			pression: '',
			humidity: '',
			windSpeed: '',
			WindDir: '',
			results: ''
		};
	},

	async mounted() {
		if (store.LatWGS84 !== undefined) {
			try {
				this.previsionApiUrl = 'https://www.prevision-meteo.ch/services/json/lat=' + store.LatWGS84.toFixed(6) + 'lng=' + store.LonWGS84.toFixed(6);
				const result = await axios.get(this.previsionApiUrl);
				this.results = result;
				this.Lat = result.data.forecast_info.latitude;
				this.Lon = result.data.forecast_info.longitude;
				this.elevation = result.data.forecast_info.elevation;
				this.sunrise = result.data.city_info.sunrise;
				this.sunset = result.data.city_info.sunset;
				this.date = result.data.current_condition.date;
				this.heure = result.data.current_condition.hour;
				this.condActuelles = result.data.current_condition.condition;
				this.condActuellesIcon = result.data.current_condition.icon;
				this.temperature = result.data.current_condition.tmp;
				this.pression = result.data.current_condition.pressure;
				this.humidity = result.data.current_condition.humidity;
				this.windSpeed = result.data.current_condition.wnd_spd;
				this.WindDir = result.data.current_condition.wnd_dir;
			} catch (e) {
				console.error(e)
			}
		}
		else {
			try {
				alert("Attention vous n'avez pas sélectionné de point d'observation !");
				const result = await axios.get(this.previsionApiUrl);
				this.results = result;
				this.Lat = result.data.city_info.latitude;
				this.Lon = result.data.city_info.longitude;
				this.elevation = result.data.forecast_info.elevation;
				this.sunrise = result.data.city_info.sunrise;
				this.sunset = result.data.city_info.sunset;
				this.date = result.data.current_condition.date;
				this.heure = result.data.current_condition.hour;
				this.condActuelles = result.data.current_condition.condition;
				this.condActuellesIcon = result.data.current_condition.icon;
				this.temperature = result.data.current_condition.tmp;
				this.pression = result.data.current_condition.pressure;
				this.humidity = result.data.current_condition.humidity;
				this.windSpeed = result.data.current_condition.wnd_spd;
				this.WindDir = result.data.current_condition.wnd_dir;
			} catch (e) {
				console.error(e)
			}
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
