import Vue from "vue";
import CryptoJS from "crypto-js";

export const SocketService = new Vue({
	data: {
		iv: [],
		key: [],
		rsaE: "",
		rsaM: "",
		socket: null,
	},
	methods: {
		generateAesParams() {
			this.iv = CryptoJS.lib.WordArray.random(128 / 8);
			this.key = CryptoJS.lib.WordArray.random(256 / 8);
		},
		connect(url) {
			this.generateAesParams();
			this.socket = new WebSocket(url);
			this.socket.onopen = this.onOpen;
			this.socket.onclose = this.onClose;
			this.socket.onerror = this.onError;
			this.socket.onmessage = this.onMessage;
		},
		encrypt(data) {
			let encrypted = CryptoJS.AES.encrypt(data, this.key, { iv: this.iv }).toString();

			return encrypted;
		},
		onOpen(event) {
			this.sendAesParams();
			this.$emit("open", event);
		},
		onClose(event) {
			this.$emit("close", event);
		},
		onError(error) {
			this.$emit("error", error);
		},
		onMessage(event) {
			let container = JSON.parse(event.data);
			let packageObj = {};

			if (container.isEncrypted) {
				packageObj = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(container.payload, this.key, { iv: this.iv })));
			} else {
				packageObj = JSON.parse(container.payload);
			}

			this.$emit("package", packageObj);
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
					type: 2,
				}),
			}));
		},
	},
})