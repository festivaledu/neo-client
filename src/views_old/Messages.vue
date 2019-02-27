<template>
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
import { SocketService } from '@/scripts/SocketService'

export default {
	name: "messages",
	mounted() {
		// SocketService.connect("ws://10.60.20.108:42420/neo");
		SocketService.$on("package", packageObj => {
			console.log(packageObj);
			switch (packageObj.type) {
				case 10:
					// Message Object received
					this.$refs["messages"].addMessage({
						author: packageObj.content.identity.id,
						displayName: packageObj.content.identity.name,
						date: new Date(packageObj.content.timestamp),
						text: packageObj.content.message,
						type: packageObj.content.messageType
					});
					break;
			}
		});
	},
	methods: {
		Messages_MessageSent(text) {
			// this.$refs["messages"].addMessage({
			// 	author: "DDBE86A4-A9A5-4F5D-B134-48323636AB77",
			// 	displayName: "unknown",
			// 	date: new Date(),
			// 	text: text,
			// 	type: "sent"
			// });
			SocketService.send({
				type: 9,
				content: text
			});
		}
	}
}
</script>