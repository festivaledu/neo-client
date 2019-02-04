import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		identity: null,
		channelList: null
	},
	mutations: {
		setIdentity(state, identity) {
			state.identity = identity;
		},
		setChannelList(state, channelList) {
			state.channelList = channelList;
		}
	},
	actions: {

	}
});
