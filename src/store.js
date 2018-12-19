import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        socket: {}
    },
    mutations: {
        connectSocket(state, url) {
            state.socket = new WebSocket(url);
        }
    },
    actions: {

    }
});