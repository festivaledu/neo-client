<template>
	<div>
		<p>{{ status }}</p>
		<input v-model="message" placeholder="Message" type="text">
		<button @click="sendMessage">Send</button>
		<p>{{ receivedMessage }}</p>
	</div>
</template>

<script>
import { SocketService } from "@/scripts/SocketService";

export default {
	name: 'home',
	data() {
		return {
			message: "",
			receivedMessage: null,
			status: null
		}
	},
	mounted() {
		SocketService.connect("ws://localhost:42420/neo");
		SocketService.$on("open", this.onOpen);
		SocketService.$on("package", this.onPackage);
	},
	methods: {
		onOpen() {
			this.status = "Connected";
		},
		onPackage(packageObj) {
			this.receivedMessage = packageObj.content;
		},
		sendMessage() {
			SocketService.send({ content: this.message, type: 0 });
		},
	}
}
</script>