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
			this.$emit("close");
		},
		onMessage(event) {
			let container = JSON.parse(event.data);
			let packageObj = {};

			if (container.isEncrypted) {
				packageObj = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(container.payload, this.key, { iv: this.iv })));
			} else {
				packageObj = JSON.parse(container.payload);
			}

			if (packageObj.type === 1) {
				this.rsaE = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(packageObj.content.exponent));
				this.rsaM = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(packageObj.content.modulus));
				
				console.log(this.rsaE);
				console.log(this.rsaM);
				return;
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
			// const rsa = new NodeRSA({ e: Buffer.from(this.rsaE, "hex"), n: Buffer.from(this.rsaM, "hex") }, "pkcs1-public", { environment: "browser", encryptionScheme: "pkcs1" });

			// var encrypted = rsa.encrypt(JSON.stringify({
			//	 aesKey: CryptoJS.enc.Base64.stringify(this.key),
			//	 aesIV: CryptoJS.enc.Base64.stringify(this.iv),
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
})