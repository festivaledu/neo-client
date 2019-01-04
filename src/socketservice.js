import Vue from "vue";
import CryptoJS from "crypto-js";

export const SocketService = new Vue({
    data: {
        iv: [],
        key: [],
        socket: {},
    },
    methods: {
        generateAesParams() {
            this.iv = CryptoJS.lib.WordArray.random(128 / 8);
            this.key = CryptoJS.lib.WordArray.random(256 / 8);
        },
        connect(url) {
            this.socket = new WebSocket(url);
            this.socket.onmessage = this.onMessage;
        },
        encrypt(data) {
            let encrypted = CryptoJS.AES.encrypt(data, this.key, { iv: this.iv }).toString();

            return encrypted;
        },
        onMessage(event) {
            let container = JSON.parse(event.data);

            if (container.isEncrypted) {
                this.$emit("onPackage", JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(container.payload, this.key, { iv: this.iv }))))
            } else {
                this.$emit("onPackage", JSON.parse(container.payload));
            }
        },
        send(data) {
            this.socket.send(JSON.stringify({
                isEncrypted: true,
                payload: this.encrypt(JSON.stringify(data)),
            }));
        },
        sendAesParams() {
            this.socket.send(JSON.stringify({
                isEncrypted: false,
                payload: JSON.stringify({
                    content: {
                        aesKey: CryptoJS.enc.Base64.stringify(this.key),
                        aesIV: CryptoJS.enc.Base64.stringify(this.iv),
                    },
                    type: 1,
                }),
            }));
        },
    },
});