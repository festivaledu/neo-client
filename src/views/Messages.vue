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
export default {
	name: "messages",
	methods: {
		Messages_MessageSent(text) {
			this.$refs["messages"].addMessage({
				author: "DDBE86A4-A9A5-4F5D-B134-48323636AB77",
				displayName: "unknown",
				date: new Date(),
				text: text,
				type: "sent"
			});
		}
	}
}
</script>