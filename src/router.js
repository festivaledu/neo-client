import Vue from "vue";
import Router from "vue-router";
import Login from "./views/Login.vue";

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
		},
		// {
		// 	path: '/controls',
		// 	name: 'controls',
		// 	// route level code-splitting
		// 	// this generates a separate chunk (about.[hash].js) for this route
		// 	// which is lazy-loaded when the route is visited.
		// 	component: () => import(/* webpackChunkName: "controls" */ './views/Controls.vue')
		// },
		// {
		// 	path: '/messages',
		// 	name: 'messages',
		// 	component: () => import(/* webpackChunkName: "messages" */ './views/Messages.vue')
		// },
		// {
		// 	path: '/navigation-view',
		// 	name: 'NavigationView',
		// 	component: () => import(/* webpackChunkName: "navigation-view" */ './views/NavigationView.vue')
		// }
	]
})
