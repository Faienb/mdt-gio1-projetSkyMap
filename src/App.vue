<template>
  <img id="vue-icon" src="./assets/Logo2.png" alt="Logo" />
  <!-- Bulma: menu tabs -->
  <div class="tabs is-centered">
    <ul>
      <li
        v-for="menu in menuList"
        :key="menu.name"
        :class="{ 'is-active': currentRoute === menu.route }"
      >
        <router-link :to="menu.route"> {{ menu.menuname }} </router-link>
      </li>
    </ul>
  </div>
  <!-- end Bulma: menu tabs -->
  <router-view />
</template>

<script>
export default {
  name: 'App-root',
  data() {
    return {
      menuList: [
        {
          menuname: 'Home',
          route: '/'
        },
        {
          menuname: 'Axios',
          route: '/axios'
        },
        {
          menuname: 'OpenLayer',
          route: '/openlayers'
        },
        {
          menuname: 'Select observation point',
          route: '/leaflet'
        },
        {
          menuname: 'Sky Map',
          route: '/cesium'
        }
      ]
    };
  },
  computed: {
    currentRoute() {
      return this.$route.path;
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  height: 100%;
  width: 100%;
}
#vue-icon {
  height: 5em;
}
</style>
