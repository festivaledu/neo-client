import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import metroUI from 'metroui-vue'
Vue.use(metroUI);

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

import vueHeadful from 'vue-headful'
Vue.component("vue-headful", vueHeadful);

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
	to.matched.some(record => {
		if (record.name != "login") {
			if (!store.state.currentIdentity) {
				next({
					path: "/login",
					replace: true
				})
			} else {
				next();
			}
		} else {
			next();
		}
	})
});

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount("#app");
