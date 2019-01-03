import Vue from "vue";

export const SocketService = new Vue({
    data: {
        socket: '',
    },
    methods: {
        connect(url) {
            this.socket = new WebSocket(url);
            this.socket.onmessage = this.onMessage;
        },
        onMessage(socket, event) {
            let container = JSON.parse(event.data);

            if (container.IsEncrypted) {

            } else {
                this.$emit("onPackage", JSON.parse(container.Payload));
            }
        },
        send(data, encrypt) {            
            if (encrypt) {

            } else {
                this.socket.send(JSON.stringify({ IsEncrypted: false, Payload: JSON.stringify(data) }));
            }
        },
    },
});