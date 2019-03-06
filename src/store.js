import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
		serverName: "",
		currentAccount: null,
		identity: null,
		currentChannel: null,
		channelList: [],
		groupList: [],
		userList: []
	},
	mutations: {
		setCurrentAccount(state, account) {
			state.currentAccount = account;
		},
		setIdentity(state, identity) {
			state.identity = identity;
		},
		setCurrentChannel(state, channel) {
			state.currentChannel = channel;
		},
		setChannelList(state, channelList) {
			state.channelList = channelList;

			if (state.currentChannel) {
				state.currentChannel = channelList.find(channel => channel.internalId == state.currentChannel.internalId);
			}
		},
		setGroupList(state, groupList) {
			state.groupList = groupList;
        },
        setServerName(state, serverName) {
            state.serverName = serverName;
        },
		setUserList(state, userList) {
			state.userList = userList;
		}
	},
	actions: {

	}
});
