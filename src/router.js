import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: "/",
			name: "root",
			component: () => import(/* webpackChunkName: "root" */ './views/Root.vue')
		},
		{
			path: "/login",
			name: "login",
			component: () => import(/* webpackChunkName: "login" */ './views/Login.vue')
		}
	]
})
