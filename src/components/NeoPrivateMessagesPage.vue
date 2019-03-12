<template>
	<div class="page" data-page-id="private-messages" @pageShow="pageShow" @pageHide="pageHide">
		<metro-emoji-picker @emojiPicked="emojiPicked" ref="emojiPicker" />

		<metro-navigation-view :history="false" menuTitle="Private Nachrichten" acrylic="acrylic-80" ref="messagesView">
			<template slot="navigation-items">
				<template v-if="conversations.length">
					<template v-for="(conversation, index) in conversations">
						<div class="navigation-view-item channel-list-item" :class="{'selected': currentChannel && (conversation.channel.internalId === currentChannel.internalId)}" :key="index" v-if="getPartner(conversation)" @click="enterConversation(conversation.channel.internalId)" @contextmenu.prevent.stop="conversationListItemContextClicked($event, conversation)">
							<div class="navigation-view-item-inner">
								<div class="navigation-view-item-icon">
									<metro-person-picture :display-name="getPartner(conversation).identity.avatarFileExtension ? null : getPartner(conversation).identity.name" :profile-picture="getPartner(conversation).identity.avatarFileExtension ? `http://${serverAddress}:43430/${getPartner(conversation).internalId}${getPartner(conversation).identity.avatarFileExtension}?${new Date(getPartner(conversation).attributes['neo.avatar.updated']).getTime()}` : null" />
								</div>
								<p class="navigation-view-item-content">
									<span class="text-label">{{ getPartner(conversation).identity.name }}</span>
									<span class="detail-text-label">{{ getLatestConversationMessage(conversation) }}</span>
								</p>
							</div>
						</div>
					</template>
				</template>
			</template>

			<template slot="pages">
				<div class="page" data-page-id="messages" v-show="this.selectedThread">
					<metro-messages ref="messageContainer" @messageSent="sendMessage" @emojiPickerRequested="emojiPickerRequested" />
				</div>
			</template>
		</metro-navigation-view>
	</div>
</template>

<style lang="less">
.page[data-page-id="private-messages"] {
	.frame-header {
		p.title {
			font-size: 32px;
			height: 64px;
		}
	}
}
</style>


<script>
import { NotificationDelegate } from '@/scripts/NotificationDelegate'
import { PermissionService } from '@/scripts/PermissionService'
import { SocketService } from '@/scripts/SocketService'
import PackageType from '@/scripts/PackageType'

export default {
	name: "NeoPrivateMessagesPage",
	data() {
		return {
			selectedThread: null,
		}
	},
	mounted() {
		SocketService.$on("package", this.notificationHandler);
		this.$refs["messagesView"].navigate("messages");
	},
	methods: {
		pageShow() {
			SocketService.$on("package", this.onPackage);

			if (this.selectedThread) {
				this.enterConversation(this.selectedThread);
			}

			this.$refs["messageContainer"]._scrollToBottom();
		},
		pageHide() {
			SocketService.$off("package", this.onPackage);
			this.$refs["emojiPicker"].hide();
		},
		notificationHandler(packageObj) {
			// This is required so we can still receive notifications from
			// private conversations while the regular package handler is detached
			switch(packageObj.type) {
                case PackageType.Message:
                    if (packageObj.content.messageType == "system") {
                        return;
                    }

                    let conversation = this.conversations.find(_ => _.channel.internalId == packageObj.content.channelId);

                    // TODO: Let the client receive notifications even if he is not in that channel
                    if (conversation) {
                        if (!document.hasFocus() || (conversation.channel.internalId != this.selectedThread && this.currentChannel.internalId != conversation.channel.internalId)) {
                            NotificationDelegate.sendNotification({
                                payload: packageObj.content,
                                icon: "accounts",
                                title: `${packageObj.content.identity.name} (@${packageObj.content.identity.id}) in Konversation`,
                                content: packageObj.content.message,
                                inputs: (() => {
                                    return (
                                        <input type="text" placeholder="Antworten..." data-required />
                                    )
                                })(),
                                buttons: [
                                    {
                                        text: "Senden",
                                        validate: true,
                                        action: (payload, notification) => {
                                            SocketService.send({
                                                type: PackageType.Input,
                                                content: {
                                                    input: notification.text,
                                                    targetChannel: payload.channelId
                                                }
                                            });
                                        }
                                    }
                                ],
                                dismissAction: (payload) => {
                                    if (this.currentChannel.internalId === payload.channelId) {
                                        return;
                                    }

                                    this.$parent.navigate("private-messages");
                                    this.enterConversation(payload.channelId);
                                }
                            });
                        }
                    }
                    break;

                case PackageType.EnterChannelResponse:
                    if (!packageObj.content.channel.attributes["neo.channeltype"] || packageObj.content.channel.attributes["neo.channeltype"] !== "conversation") {
                        return;
                    }

                    if (packageObj.content.result === "Success") {
                        this.selectedThread = packageObj.content.channel.internalId;

                        let messages = packageObj.content.channel.messages.map(messageObj => {
                            return {
                                author: messageObj.identity.id,
                                displayName: messageObj.identity.name,
                                date: new Date(messageObj.timestamp),
                                text: messageObj.message,
                                type: this.currentIdentity.id === messageObj.identity.id ? "sent" : "received" // Replace with internal id check
                            }
                        });

                        if (this.$refs["messageContainer"]) {
                            this.$refs["messageContainer"].setMessages(messages);
                        }

						this.$store.commit("setCurrentChannel", packageObj.content.channel);
						this.$refs["messagesView"].setTitle(this.getPartner(this.conversations.find(_ => _.channel.internalId === packageObj.content.channel.internalId)).identity.name);
                    }
                    break;
            default: break;
			}
		},
		onPackage(packageObj) {
			switch (packageObj.type) {
				case PackageType.EnterChannelResponse:
					if (!packageObj.content.channel.attributes["neo.channeltype"] || packageObj.content.channel.attributes["neo.channeltype"] !== "conversation") {
						return;
					}

					if (packageObj.content.result === "Success") {
						let messages = packageObj.content.channel.messages.map(messageObj => {
							return {
								author: messageObj.identity.id,
								displayName: messageObj.identity.name,
								date: new Date(messageObj.timestamp),
								text: messageObj.message,
								type: this.currentIdentity.id === messageObj.identity.id ? "sent" : "received" // Replace with internal id check
							}
						});

						if (this.$refs["messageContainer"]) {
							this.$refs["messageContainer"].setMessages(messages);
						}

						this.$store.commit("setCurrentChannel", packageObj.content.channel);
						this.$refs["messagesView"].setTitle(this.getPartner(this.conversations.find(_ => _.channel.internalId === packageObj.content.channel.internalId)).identity.name);
					}

					break;
				// case PackageType.DeleteChannelResponse:
				// 	if (!packageObj.content.channel.attributes["neo.channeltype"] || packageObj.content.channel.attributes["neo.channeltype"] !== "conversation") {
				// 		return;
				// 	}
				// 	break;
				case PackageType.Message:
					if (this.currentChannel.internalId == packageObj.content.channelId && packageObj.content.messageType != "system") {
						this.$refs["messageContainer"].addMessage({
							author: packageObj.content.identity.id,
							displayName: packageObj.content.identity.name,
							date: new Date(packageObj.content.timestamp),
							text: packageObj.content.message,
							type: packageObj.content.messageType
						});
					}
					break;
			}
		},

		getPartner(conversation) {
			let otherId = conversation.users.find(_ => _ != this.userList.find(user => user.identity.id == this.currentIdentity.id).internalId);
			let other = this.accountList.find(_ => _.internalId == otherId);

			if (other == null) {
				other = this.userList.find(_ => _.internalId == otherId);
			}

			return other;
		},
		getLatestConversationMessage(conversation) {
            if (conversation.channel.messages.length == 0) {
                return "Keine Nachrichten";
            }

			let latestMessage = conversation.channel.messages[conversation.channel.messages.length - 1];

			return `${latestMessage.identity.id == this.currentIdentity.id ? "Du: " : ""}${latestMessage.message}`;
		},
		
		conversationListItemContextClicked(event, conversation){
			new metroUI.MenuFlyout(event.target, [
				{
					title: "Löschen",
					icon: "delete",
					action: () => { this.deleteConversation(conversation) },
				}
			]).show();
		},
		
		enterConversation(channelId) {
			this.selectedThread = channelId;

			SocketService.send({
				type: PackageType.EnterChannel,
				content: {
					channelId: channelId,
					password: ""
				}
			});
		},
		async deleteConversation(conversation) {
			var deleteConversationDialog = new metroUI.ContentDialog({
				title: "Konversation löschen",
				content: (() => {
					return (
						<div>
							<p>Bist du sicher, dass du diese Konversation löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Löschen", primary: true }]
			});

			if (await deleteConversationDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				SocketService.send({
					type: PackageType.CustomEvent,
					content: {
                        name: "ml.festival.conversation.stop",
                        content: [
                            conversation.channel.internalId
                        ]
                    }
				});
				
				this.$refs["messagesView"]._data._currentPage.hide();
				this.$refs["messagesView"].setTitle("");
			}
		},

		emojiPicked(char) {
			this.$refs["messageContainer"].$refs["input"].value += `${char}`;
			this.$refs["messageContainer"].$refs["input"].dispatchEvent(new Event("input"));
			this.$refs["messageContainer"].$refs["input"].focus();
		},
		emojiPickerRequested(target) {
			this.$refs["emojiPicker"].toggle(target);
		},

		sendMessage(text) {
			SocketService.send({
				type: PackageType.Input,
				content: {
					input: text,
					targetChannel: this.currentChannel.internalId
				}
			});
		}
	},
	computed: {
		accountList() {
			return this.$store.state.accountList;
		},
		conversations() {
			return this.$store.state.conversations;
		},
		currentAccount() {
			return this.$store.state.currentAccount;
		},
		currentChannel() {
			return this.$store.state.currentChannel;
		},
		currentIdentity() {
			return this.$store.state.currentIdentity;
		},
		serverAddress() {
			return this.$store.state.serverAddress;
		},
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
