import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		serverName: "",
		currentAccount: null,
		identity: null,
		currentChannel: null,
		accountList: [],
		channelList: [],
        groupList: [],
        grantedPermissions: {},
		knownPermissions: {},
		userList: [],
		lastUpdate: new Date()
	},
	mutations: {
		setCurrentAccount(state, account) {
			state.currentAccount = account;
			
			state.lastUpdate = new Date();
		},
		setIdentity(state, identity) {
			state.identity = identity;
			
			state.lastUpdate = new Date();
		},
		setAccountList(state, accountList) {
			state.accountList = accountList;

			state.lastUpdate = new Date();
		},
		setCurrentChannel(state, channel) {
			state.currentChannel = channel;
			
			state.lastUpdate = new Date();
		},
		setChannelList(state, channelList) {
			state.channelList = channelList;

			if (state.currentChannel) {
				state.currentChannel = channelList.find(channel => channel.internalId == state.currentChannel.internalId);
			}
			
			state.lastUpdate = new Date();
		},
		setGroupList(state, groupList) {
			state.groupList = groupList;
			
			state.lastUpdate = new Date();
        },
        setGrantedPermissions(state, permissions) {
            state.grantedPermissions = permissions;

            state.lastUpdate = new Date();
        },
		setKnownPermissions(state, permissions) {
			state.knownPermissions = permissions;
			
			state.lastUpdate = new Date();
		},
		setServerName(state, serverName) {
			state.serverName = serverName;

			state.lastUpdate = new Date();
		},
		setUserList(state, userList) {
			state.userList = userList;
			
			state.lastUpdate = new Date();
		}
	},
	actions: {

	}
});
