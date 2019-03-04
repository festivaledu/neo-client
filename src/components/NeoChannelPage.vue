<template>
	<div class="page" data-page-id="channels">
		<metro-navigation-view menuTitle="%server_name%" :history="false" acrylic="acrylic-80" class="transparent" ref="channelView">
			<template slot="navigation-items">
				<!-- Render a list of available channels -->
				<div class="navigation-view-item channel-list-item" :class="{'selected': ($store.state.currentChannel && channel.internalId === $store.state.currentChannel.internalId) || false}" v-for="(channel, index) in $store.state.channelList" :key="index" @click="enterChannel(channel.internalId)">
					<div class="navigation-view-item-inner">
						<div class="navigation-view-item-icon">
							<metro-person-picture :displayName="channel.name" :profilePicture="channel.channelArtwork" />
						</div>
						<p class="navigation-view-item-content">
							<span class="text-label">{{channel.name}}</span>
							<span class="detail-text-label">{{channel.statusMessage}}</span>
						</p>
					</div>
				</div>
			</template>
			
			<template slot="pages">
				<!-- One messages page to rule them all -->
				<div class="page" data-page-id="messages" data-page-title="%channelName%">
					<metro-messages ref="messageContainer" @messageSent="Messages_MessageSent" />
				</div>
				
				<div class="list-view user-list acrylic acrylic-80">
					<div class="list-view-menu">
						<div class="list-view-items">
							<!-- Render a list of groups and their members -->
							<!-- <div class="list-view-item-separator">
								<p>%group_name%</p>
							</div> -->
							
							<!-- <div v-if="channelData.length && userData.length">
								<div class="list-view-item double-line" v-for="(user, index) in channelData[0].memberIds" :key="index" @click.stop="userListItemClicked">
									<div class="list-view-item-icon">
										<metro-person-picture :displayName="userData.find(_ => _.internalId === user).identity.name" />
									</div>
									<p class="list-view-item-content">
										<span class="text-label">{{userData.find(_ => _.internalId === user).identity.name}}</span>
										<span class="detail-text-label">{{user}}</span>
									</p>
								</div>
							</div> -->
							<!-- <div v-if="$store.state.currentChannel && $store.state.userList.length">
								<NeoChannelUserListItem v-for="(memberId, index) in $store.state.currentChannel.memberIds" :key="index" :memberId="memberId" />
							</div> -->
							<div v-for="(group, index) in $store.state.groupList" :key="index">
								<p>{{group}}</p>
								<div class="list-view-item-separator">
									<p>{{group.name}}</p>
								</div>
								
								<NeoChannelUserListItem v-for="(memberId, index) in group.memberIds" :key="index" :memberId="memberId" />
								<!-- <div class="list-view-item double-line" v-for="(user, index) in group.memberIds" :key="index" @click.stop="userListItemClicked">
									<div class="list-view-item-icon">
										<metro-person-picture :displayName="userData.find(_ => _.internalId === user).identity.name" />
									</div>
									<p class="list-view-item-content">
										<span class="text-label">{{userData.find(_ => _.internalId === user).identity.name}}</span>
										<span class="detail-text-label">{{user}}</span>
									</p>
								</div> -->
							</div>
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
import NeoChannelUserListItem from "@/components/NeoChannelUserListItem.vue"

import { SocketService } from "@/scripts/SocketService";
import PackageType from '@/scripts/PackageType';

export default {
	name: "NeoChannelPage",
	components: {
		NeoChannelUserListItem
	},
	props: ["channelData", "userData"],
	mounted() {
		this.$refs["channelView"].navigate("messages");
		
		SocketService.send({
			type: PackageType.LoginFinished
		});
		
		SocketService.$on("package", packageObj => {
			// console.log(packageObj);
			console.log(`NeoChanellPage: ${packageObj.type}`);
			switch (packageObj.type) {
				case PackageType.EnterChannelResponse:
					this.$store.commit("setCurrentChannel", packageObj.content);
					break;
				case PackageType.Message:
					// Message Object received
					this.$refs["messageContainer"].addMessage({
						author: packageObj.content.identity.id,
						displayName: packageObj.content.identity.name,
						date: new Date(packageObj.content.timestamp),
						text: packageObj.content.message,
						type: packageObj.content.messageType
					});
					break;
				default: break;
			}
		});
	},
	methods: {
		enterChannel(channelId) {
			if (this.$store.state.currentChannel.internalId === channelId) {
				return;
			}
			
			SocketService.send({
				type: PackageType.EnterChannel,
				content: channelId
			});
		},
		Messages_MessageSent(text) {
			// this.$refs["messageContainer"].addMessage({
			// 	author: "DDBE86A4-A9A5-4F5D-B134-48323636AB77",
			// 	displayName: "unknown",
			// 	date: new Date(),
			// 	text: text,
			// 	type: "sent"
			// });
			SocketService.send({
				type: PackageType.Input,
				content: text
			});
		},
		userListItemClicked(event) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Send Private Message",
					icon: "chat-bubbles",
					disabled: true
				}
			]);
			flyout.show();
		}
	}
}
</script>
