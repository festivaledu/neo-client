import Vue from "vue";
import CryptoJS from "crypto-js";
import NodeRSA from "node-rsa";

export const SocketService = new Vue({
    data: {
        iv: [],
        key: [],
        rsaE: "",
        rsaM: "",
        socket: {},
    },
    methods: {
        generateAesParams() {
            this.iv = CryptoJS.lib.WordArray.random(128 / 8);
            this.key = CryptoJS.lib.WordArray.random(256 / 8);
        },
        connect(url) {
            this.generateAesParams();
            this.socket = new WebSocket(url);
            this.socket.onmessage = this.onMessage;
            this.socket.onopen = this.onOpen;
        },
        encrypt(data) {
            let encrypted = CryptoJS.AES.encrypt(data, this.key, { iv: this.iv }).toString();

            return encrypted;
        },
        onMessage(event) {
            let container = JSON.parse(event.data);
            let p = {};

            if (container.isEncrypted) {
                p = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(container.payload, this.key, { iv: this.iv })));
            } else {
                p = JSON.parse(container.payload);
            }

            if (p.type === 1) {
                this.rsaE = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(p.content.exponent));
                this.rsaM = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(p.content.modulus));
                console.log(this.rsaE);
                console.log(this.rsaM);
                return;
            }

            this.$emit("onPackage", p);
        },
        onOpen(event) {
            this.sendAesParams();
            this.$emit("onOpen");
        },
        send(data) {
            this.socket.send(JSON.stringify({
                isEncrypted: true,
                payload: this.encrypt(JSON.stringify(data)),
            }));
        },
        sendAesParams() {
            // const rsa = new NodeRSA({ e: Buffer.from(this.rsaE, "hex"), n: Buffer.from(this.rsaM, "hex") }, "pkcs1-public", { environment: "browser", encryptionScheme: "pkcs1" });

            // var encrypted = rsa.encrypt(JSON.stringify({
            //     aesKey: CryptoJS.enc.Base64.stringify(this.key),
            //     aesIV: CryptoJS.enc.Base64.stringify(this.iv),
            // }), "base64");

            // console.log(encrypted);

            this.socket.send(JSON.stringify({
                isEncrypted: false,
                payload: JSON.stringify({
                    content: {
                        aesKey: CryptoJS.enc.Base64.stringify(this.key),
                        aesIV: CryptoJS.enc.Base64.stringify(this.iv),
                    },
                    type: 2,
                }),
            }));
        },
    },
});