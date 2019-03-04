import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		identity: null,
		currentChannel: null,
		channelList: [],
		groupList: [],
		userList: []
	},
	mutations: {
		setIdentity(state, identity) {
			state.identity = identity;
		},
		setCurrentChannel(state, channel) {
			state.currentChannel = channel;
		},
		setChannelList(state, channelList) {
			state.channelList = channelList;
		},
		setGroupList(state, groupList) {
			state.groupList = groupList;
		},
		setUserList(state, userList) {
			state.userList = userList;
		}
	},
	actions: {

	}
});
