import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        officialServer: false,
        socket: {},
    },
    mutations: {
        connectSocket(state, url) {
            state.socket = new WebSocket(url);
        },
        isOfficialServer(state) {
            state.officialServer = true;
        }
    },
    actions: {

    }
});