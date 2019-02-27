<template>
	<div class="page" data-page-id="channels">
		<metro-navigation-view menuTitle="%server_name%" :history="false" acrylic="acrylic-80" class="transparent" ref="channelView">
			<template slot="navigation-items">
				<!-- Render a list of available channels -->
				<div class="navigation-view-item channel-list-item" :class="{'selected': true}" v-for="(channel, index) in channelData" :key="index">
					<div class="navigation-view-item-inner">
						<div class="navigation-view-item-icon">
							<metro-person-picture :profilePicture="channel.channelArtwork" />
						</div>
						<p class="navigation-view-item-content">
							<span class="text-label">#{{channel.id}}</span>
							<span class="detail-text-label">{{channel.status}}</span>
						</p>
					</div>
				</div>
			</template>
			
			<template slot="pages">
				<!-- One messages page to rule them all -->
				<div class="page" data-page-id="messages" data-page-title="#channel1">
					<metro-messages ref="messageContainer" @messageSent="Messages_MessageSent" />
					
					
				</div>
				
				<div class="user-list acrylic acrylic-80">
						
				</div>
			</template>
		</metro-navigation-view>
	</div>
</template>

<style lang="less">
.navigation-view {
	.navigation-view-menu .navigation-view-items .navigation-view-item.channel-list-item {
		height: 64px;
		
		.navigation-view-item-icon {
			width: 48px;
			height: 64px;
			
			.person-picture {
				width: 32px;
				height: 32px;
				margin: 16px 8px;
				
				&:before {
					width: 32px;
					height: 32px;
				}
				
				.initials {
					font-size: 20px;
					line-height: 32px;
					padding: 0;
				}
			}
		}
		
		.navigation-view-item-content {
			left: 64px;
			
			span {
				display: block;
				line-height: 22px;
			}
			
			.text-label {
				font-weight: 600;
			}
			.detail-text-label {
				opacity: 0.6;
			}
		}
	}
}

.page[data-page-id="channels"] {
	.frame-header {
		right: 320px;
		background-color: #fff;
		
		p.title {
			font-size: 32px;
			height: 64px;
		}
	}
	
	.frame-content {
		width: calc(~"100% - 320px");
		background-color: #fff;
	}
}

.page[data-page-id="messages"] {
	.messages-container {
		position: relative;
		
		.messages-input {
			left: -24px;
			bottom: -10px;
		}
	}
}

.user-list {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 320px;
}
</style>

<script>
export default {
	props: ["channelData"],
	mounted() {
		this.$refs["channelView"].navigate("messages");
	},
	methods: {
		Messages_MessageSent(text) {
			this.$refs["messageContainer"].addMessage({
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
