import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		serverName: "",
		serverAddress: "",
		currentAccount: null,
		currentIdentity: null,
		userList: [],
		accountList: [],
		groupList: [],
		channelList: [],
		currentChannel: null,
		knownPermissions: {},
		grantedPermissions: {},
		conversations: [],

		lastUpdated: new Date()
	},
	mutations: {
		setServerName(state, serverName) {
			state.serverName = serverName;

			state.lastUpdated = new Date();
		},
		setServerAddress(state, serverAddress) {
			state.serverAddress = serverAddress;
			
			state.lastUpdated = new Date();
		},



		setCurrentAccount(state, account) {
			state.currentAccount = account;

			state.lastUpdated = new Date();
		},
		setCurrentIdentity(state, identity) {
			state.currentIdentity = identity;

			state.lastUpdated = new Date();
		},


		setUserList(state, userList) {
			state.userList = userList;

			state.lastUpdated = new Date();
		},
		setAccountList(state, accountList) {
			state.accountList = accountList;

			state.lastUpdated = new Date();
		},
		setGroupList(state, groupList) {
			state.groupList = groupList;

			state.lastUpdated = new Date();
		},
		setChannelList(state, channelList) {
			state.channelList = channelList;

			if (state.currentChannel) {
				state.currentChannel = channelList.find(channel => channel.internalId == state.currentChannel.internalId);
			}

			state.lastUpdated = new Date();
		},



		setCurrentChannel(state, channel) {
			state.currentChannel = channel;

			state.lastUpdated = new Date();
		},



		setKnownPermissions(state, permissions) {
			state.knownPermissions = permissions;

			state.lastUpdated = new Date();
		},
		setGrantedPermissions(state, permissions) {
			state.grantedPermissions = permissions;

			state.lastUpdated = new Date();
		},
		
		setConversations(state, conversations) {
			state.conversations = conversations;

			state.lastUpdated = new Date();
		}
	}
});
