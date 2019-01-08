<template>
	<!--<div>
		<p>{{ status }}</p>
		<input v-model="message" placeholder="Message" type="text">
		<button @click="sendMessage">Send</button>
		<p>{{ receivedMessage }}</p>
	</div>-->
	<div class="views">
		<div class="view view-active">
			<div class="pages">
				<div class="page page-active">
					<metro-messages ref="messages" @messageSent="Messages_MessageSent" />
				</div>
			</div>
		</div>
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
		SocketService.$on("close", this.onClose);
		SocketService.$on("package", this.onPackage);
	},
	methods: {
		onOpen() {
			//this.status = "Connected";
			this.$refs["messages"].addSystemMessage("Connected")
		},
		onClose() {
			this.$refs["messages"].addSystemMessage("Disconnected")
		},
		onPackage(packageObj) {
			//this.receivedMessage = packageObj.content;
			this.$refs["messages"].addMessage({
				author: "server",
				displayName: "Server",
				date: new Date(),
				text: packageObj.content,
				type: "received"
			});
		},
		Messages_MessageSent(text) {
			SocketService.send({ content: text, type: 0 });
			this.$refs["messages"].addMessage({
				author: "client",
				displayName: "Client",
				date: new Date(),
				text: text,
				type: "sent"
			});
		},
	}
}
</script>