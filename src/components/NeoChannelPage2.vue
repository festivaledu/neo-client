<template>
	<div class="page" data-page-id="channels">
		<metro-navigation-view :history="false" acrylic="acrylic-80" class="transparent" ref="channelView">
			<template slot="navigation-items">
				<div class="navigation-view-item channel-list-item" :class="{'selected': currentChannel && (channel.internalId === currentChannel.internalId)}" v-for="(channel, index) in channelList" :key="index">
					<div class="navigation-view-item-inner">
						<div class="navigation-view-item-icon">
							<metro-person-picture :displayName="channel.name" />
						</div>
						<p class="navigation-view-item-content">
							<span class="text-label">{{channel.name}}</span>
							<span class="detail-text-label">{{channel.statusMessage}}</span>
						</p>
					</div>
				</div>
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="messages" data-page-title="%channelName%">
					<metro-messages ref="messageContainer" @messageSent="sendMessage" />
				</div>
				
				<div class="list-view user-list acrylic acrylic-80">
					<div class="list-view-menu">
						<!-- {{currentChannel}} -->
						<div class="list-view-items" v-if="currentChannel">
							<NeoChannelUserListGroup v-for="(group, index) in groupList" :key="index" :group="group" />
						</div>
					</div>
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
			left: 48px;
			
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
		background-color: var(--alt-high);
		
		p.title {
			font-size: 32px;
			height: 64px;
		}
	}
	
	.frame-content {
		width: calc(~"100% - 320px");
		background-color: var(--alt-high);
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
	left: auto;
	right: 0;
}
</style>

<script>
import NeoChannelUserListGroup from "@/components/NeoChannelUserListGroup.vue"

import { SocketService } from "@/scripts/SocketService";
import PackageType from '@/scripts/PackageType';

export default {
	name: "NeoChannelPage",
	components: {
		NeoChannelUserListGroup
	},
	mounted() {
		SocketService.$on("package", this.onPackage);
	},
	methods: {
		onPackage(packageObj) {
			switch (packageObj.type) {
				case PackageType.EnterChannelResponse:
					this.$store.commit("setCurrentChannel", packageObj.content);
					this.$refs["channelView"].setTitle(this.currentChannel.name);
					break;
				default: break;
			}
		},
		sendMessage(text) {
			
		}
	},
	computed: {
		currentChannel() {
			return this.$store.state.currentChannel;
		},
		channelList() {
			return this.$store.state.channelList;
		},
		groupList() {
			return this.$store.state.groupList;
		}
	}
}
</script>
