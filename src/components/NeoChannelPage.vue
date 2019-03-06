<template>
	<div class="page" data-page-id="channels">
		<metro-navigation-view :history="false" acrylic="acrylic-80" class="transparent" ref="channelView">
			<template slot="navigation-items">
				<div class="navigation-view-item channel-list-item" :class="{'selected': currentChannel && (channel.internalId === currentChannel.internalId)}" v-for="(channel, index) in channelList" :key="index" @click="enterChannel(channel.internalId)">
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

				<metro-list-view class="user-list" acrylic="acrylic-80" :key="userList.length">
					<template slot="list-items" v-if="currentChannel && userList.length && groupList.length">
						<div v-for="group in sortedGroupList" :key="group.internalId + userList.length" :data-group-identifier="group.internalId">
							<div v-if="group.memberIds.filter(_ => currentChannel.activeMemberIds.includes(_)).length">
								<div class="list-view-item-separator">
									<p>{{group.name}}</p>
								</div>
								
								<div v-for="(memberId, index) in sortMemberList(group.memberIds.filter(_ => currentChannel.activeMemberIds.includes(_)))" :key="index + userList.length">
									<NeoChannelUserListItem :memberId="memberId" @click.native.stop="userListItemClicked" />
								</div>
							</div>
						</div>
					</template>
				</metro-list-view>
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
					font-size: 16px;
					line-height: 14px;
					padding: 9px 0;
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
	mounted() {
		SocketService.$on("package", this.onPackage);
		this.$refs["channelView"].navigate("messages");
		this.$refs["channelView"].setMenuTitle(this.$store.state.serverName);
	},
	methods: {
		onPackage(packageObj) {
			switch (packageObj.type) {
                case PackageType.MetaResponse:                    
                    this.$store.commit("setServerName", packageObj.content.name);
		            this.$refs["channelView"].setMenuTitle(this.$store.state.serverName);
                    break;
				case PackageType.EnterChannelResponse:
					this.$store.commit("setCurrentChannel", packageObj.content);
					this.$refs["channelView"].setTitle(this.currentChannel.name);
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
		},
		enterChannel(channelId) {
			if (this.currentChannel.internalId === channelId) {
				return;
			}
			
			SocketService.send({
				type: PackageType.EnterChannel,
				content: channelId
			});
		},
		sendMessage(text) {
			SocketService.send({
				type: PackageType.Input,
				content: text
			});
		},
        sortMemberList(memberIds) {
			return memberIds.slice(0).sort((a, b) => {
				if (a && b) {
					return this.userList.find(_ => _.internalId === a).identity.name.localeCompare(this.userList.find(_ => _.internalId === b).identity.name);
				}
				return 0;
			});
        },
		userListItemClicked(event) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Private Nachricht",
					icon: "chat-bubbles",
					disabled: true
				}
			]);
			flyout.show();
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
        },
        sortedGroupList() {
            return this.groupList.slice(0).sort((a, b) => b.sortValue - a.sortValue);
        },
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
