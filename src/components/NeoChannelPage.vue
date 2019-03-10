<template>
	<div class="page" data-page-id="channels">
		<metro-navigation-view :history="false" acrylic="acrylic-80" class="transparent" ref="channelView">
			<template slot="navigation-items">
				<template v-for="(channel, index) in channelList">
					<div class="navigation-view-item channel-list-item" :class="{'selected': currentChannel && (channel.internalId === currentChannel.internalId)}" :key="index" @click="enterChannel(channel.internalId)" @contextmenu.prevent.stop="channelListItemContextClicked($event, channel)">
						<div class="navigation-view-item-inner">
							<div class="navigation-view-item-icon">
								<metro-person-picture :displayName="channel.name" />
							</div>
							<p class="navigation-view-item-content">
								<span class="text-label">{{channel.name}}</span>
								<span class="detail-text-label">#{{channel.id}}</span>
							</p>
						</div>
					</div>
				</template>
			</template>

            <template slot="bottom-items">
				<metro-navigation-view-menu-item icon="add" title="Channel erstellen" @click.native.prevent="createChannel" />
			</template>

			<template slot="pages">
				<div class="page" data-page-id="messages" data-page-title="%channelName%"> 
					<metro-messages ref="messageContainer" @messageSent="sendMessage" />
				</div>

				<metro-list-view class="user-list" acrylic="acrylic-80">
					<template slot="list-items" v-if="currentChannel && userList.length && groupList.length">
						<div v-for="group in sortedGroupList" :key="group.internalId + userList.length" :data-group-identifier="group.internalId">
							<div v-if="group.memberIds.filter(_ => currentChannel.activeMemberIds.includes(_)).length">
								<div class="list-view-item-separator">
									<p>{{group.name}}</p>
								</div>
								
								<div v-for="(memberId, index) in sortMemberList(group.memberIds.filter(_ => currentChannel.activeMemberIds.includes(_)))" :key="index">
									<NeoChannelUserListItem :memberId="memberId" @click.native.stop="userListItemClicked(memberId)" @contextmenu.native.prevent.stop="userListItemContextClicked($event, memberId)" :key="index + lastUpdate" />
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
		
		.message-text span.underline {
			text-decoration: underline;
		}
	}
}

.user-list {
	left: auto;
	right: 0;
}
</style>

<script>
import NeoChannelUserListItem from "@/components/NeoChannelUserListItem.vue";

import { PermissionService } from "@/scripts/PermissionService";
import { SocketService } from "@/scripts/SocketService";
import PackageType from "@/scripts/PackageType";
import { NotificationDelegate } from "@/scripts/NotificationDelegate";

export default {
	name: "NeoChannelPage",
	components: {
		NeoChannelUserListItem
	},
	mounted() {
		SocketService.$on("package", this.onPackage);
		this.$refs["channelView"].navigate("messages");
		this.$refs["channelView"].setMenuTitle(this.$store.state.serverName);
		
		this.$refs["messageContainer"].onMessageRender = (messageText) => {
			const mentionName = messageText.match(/@(\S+)/) ? messageText.match(/@(\S+)/)[1] : "";
			
			if (mentionName && this.userList.filter(_ => _.identity.id === mentionName).length) {
				return messageText.replace(/(\@\S+)/g, "<span class=\"underline\">$1</span>");
			}
			
			return messageText;
		}
	},
	methods: {
		onPackage(packageObj) {
			switch (packageObj.type) {
				case PackageType.MetaResponse:
					this.$store.commit("setServerName", packageObj.content.name);
					this.$refs["channelView"].setMenuTitle(this.$store.state.serverName);
					break;
                case PackageType.EnterChannelResponse:                
                    if (packageObj.content.result === "Success") {
						let messages = packageObj.content.channel.messages.map(messageObj => {
							return {
								author: messageObj.identity.id,
								displayName: messageObj.identity.name,
								date: new Date(messageObj.timestamp),
								text: messageObj.message,
								type: this.currentIdentity.id === messageObj.identity.id ? "sent" : "received"
							}
						});
						this.$refs["messageContainer"].setMessages(messages);
						
                        this.$store.commit("setCurrentChannel", packageObj.content.channel);
                        this.$refs["channelView"].setTitle(this.currentChannel.name);
                    } else {
                        new metroUI.ContentDialog({
                            title: "Channel kann nicht betreten werden",
                            content: (() => {
                            return (
                                <div>
                                    {(() => {
                                        switch (packageObj.content.result) {
                                            case "NotAllowed":
                                                return <p>Du bist nicht berechtigt Channel zu betreten.</p>;
                                            case "IncorrectPassword":
                                                return <p>Das Passwort ist falsch.</p>;
                                            case "Full":
                                                return <p>Der Channel hat die maximale Anzahl an Mitgliedern erreicht.</p>;
                                            default: return null
                                        }
                                    })()}
                                </div>
                            )
                            })(),
                            commands: [{ text: "Ok" }]
                        }).show();
                    }
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
				case PackageType.Mention:
					if (packageObj.content.channelId === this.currentChannel.internalId && document.hasFocus()) {
						return;
					}
				
					NotificationDelegate.sendNotification({
                        payload: packageObj.content,
                        icon: "accounts",
						//title: packageObj.content.identity.name + " (in #" + this.channelList.find(_ => _.internalId == packageObj.content.channelId).id + ")",
						title: `${packageObj.content.identity.name} (@${packageObj.content.identity.id}) in #${this.channelList.find(_ => _.internalId == packageObj.content.channelId).id}`,
						content: packageObj.content.message,
						inputs: (() => {
							return (
								<input type="text" placeholder="Antworten..." data-required="true" />
							)
						})(),
						buttons: [
							{
								text: "Senden",
								validate: true,
								action: (payload) => {
									// alert(`Answering ${payload.identity.id} in channel ${payload.channelId} with text ${mentionNotification.text}`)
									SocketService.send({
										type: PackageType.Input,
										content: {
											input: mentionNotification.text,
											targetChannel: payload.channelId
										}
									});
								}
							}
						],
						dismissAction: (payload) => {
							// alert(`Entering channel ${payload.channelId}`)
							if (this.currentChannel.internalId === payload.channelId) {
								return;
							}
							
							this.enterChannel(payload.channelId);
						}
					});
                    break;
                case PackageType.DeleteChannelResponse:
                    if (packageObj.content === "Success") {
                        new metroUI.Notification({
                            payload: {},
                            title: "Channel",
                            icon: "delete",
                            content: "Der Channel wurde erfolgreich gelöscht",
                            inputs: "",
                            buttons: [],
                        }).show();
                    } else {
                        new metroUI.ContentDialog({
                            title: "Channel konnte nicht gelöscht werden",
                            content: (() => {
                            return (
                                <div>
                                    {(() => {
                                        switch (packageObj.content) {
                                            case "NotAllowed":
                                                return <p>Du bist nicht berechtigt diesen Channel zu löschen.</p>;
                                            case "NotFound":
                                                return <p>Der Channel existiert nicht.</p>;
                                            default: return null
                                        }
                                    })()}
                                </div>
                            )
                            })(),
                            commands: [{ text: "Ok" }]
                        }).show();
                    }
                    break;
				default: break;
			}
		},		
		channelListItemContextClicked(event, channel) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				// {
				// 	title: "Verlassen",
				// 	icon: "leave-chat",
				// 	disabled: true
				// },
				{
					title: "Bearbeiten",
					icon: "edit",
					action: this.editChannel,
					actionParams: channel
				},
				{
					title: "Löschen",
                    icon: "delete",
                    disabled: channel.attributes['neo.channeltype'] && channel.attributes['neo.channeltype'] == 'main',                    
					action: this.deleteChannel,
					actionParams: channel
				}
			]);
			flyout.show();
        },
        async createChannel() {
            let channelDialog = new metroUI.ContentDialog({
				title: "Channel erstellen",
				content: (() => {
					return (
                        <div>
                            <input type="text" placeholder="Channel-Name" data-required />
                            <input type="text" placeholder="Channel-ID (min. 3 Zeichen)" data-minlength="3" />
                            <input type="text" placeholder="Benutzerlimit (-1 für unbegrenzt)" data-required />
                            <input type="password" placeholder="Passwort (optional)" />
							<p>Wähle die Art des Channels:</p>
							<metro-combo-box>
								<select>
									<option value="Temporary">Temporär</option>
									<option value="Permanent">Permanent</option>
								</select>
							</metro-combo-box>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Channel erstellen", primary: true }]
			});
			
			switch (await channelDialog.showAsync()) {
                case metroUI.ContentDialogResult.Primary:
                    SocketService.send({
                        type: PackageType.CreateChannel,
                        content: {
                            name: channelDialog.text[0],
                            id: channelDialog.text[1],
                            limit: new Number(channelDialog.text[2]),
                            password: channelDialog.text[3],
                            lifetime: channelDialog.text[4]
                        }
			        });
					break;
				default: break;
			}
        },
		async createPunishment(memberId) {
			let punishmentDialog = new metroUI.ContentDialog({
				title: "Nutzer bestrafen",
				content: (() => {
					return (
						<div>
							<p>Wähle die Art der Bestrafung:</p>
							<metro-combo-box>
								<select>
									{/*<option value="mute">Stummschalten</option>*/}
									<option value="kick">Kicken</option>
									<option value="ban">Bannen</option>
								</select>
							</metro-combo-box>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
			});
			
			switch (await punishmentDialog.showAsync()) {
				case metroUI.ContentDialogResult.Primary:
                    SocketService.send({
                        type: PackageType.CreatePunishment,
                        content: {
                            target: memberId,
                            action: punishmentDialog.text
                        }
			        });
					break;
				default: break;
			}
        },
        async editChannel(channel) {
            let channelDialog = new metroUI.ContentDialog({
				title: "Channel bearbeiten",
				content: (() => {
					return (
                        <div>
                            <p>Channel-Name</p>
                            <input type="text" placeholder="Channel-Name" value={channel.name} data-required />
                            <p>Channel-ID</p>
                            <input type="text" placeholder="Channel-ID (min. 3 Zeichen)" value={channel.id} data-minlength="3" />
                            {(() => {
                                if (!channel.attributes['neo.channeltype'] || channel.attributes['neo.channeltype'] != 'main') {
                                    return <div>
                                        <p>Benutzerlimit</p>
                                        <input type="text" placeholder="Benutzerlimit (-1 für unbegrenzt)" value={channel.limit} data-required />
                                        <p>Passwort</p>
                                        <input type="password" placeholder="Passwort (optional)" value={channel.password} />
                                        <p>Art des Channels</p>
                                        <metro-combo-box>
                                            <select>
                                                <option value="Temporary" selected={channel.lifetime == 'Temporary'}>Temporär</option>
                                                <option value="Permanent" selected={channel.lifetime == 'Permanent'}>Permanent</option>
                                            </select>
                                        </metro-combo-box>
                                    </div>
                                } else {
                                    return <div style="align-items: center; display: flex">
                                        <i class="icon report-hacked" style="display: inline-block; font-size: 20px; margin: 12px"></i>
                                        <p>Dies ist der Mainchannel. Du kannst daher nicht alle Eigenschaften bearbeiten und den Channel auch nicht entfernen.</p>
                                    </div>
                                }
                            })()}
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Speichern", primary: true }]
			});
			
			switch (await channelDialog.showAsync()) {
                case metroUI.ContentDialogResult.Primary:
                    channel.name = channelDialog.text[0];
                    channel.id = channelDialog.text[1];

                    if (!channel.attributes['neo.channeltype'] || channel.attributes['neo.channeltype'] != 'main') {
                        channel.limit = new Number(channelDialog.text[2]),
                        channel.password = channelDialog.text[3],
                        channel.lifetime = channelDialog.text[4]
                    }

                    SocketService.send({
                        type: PackageType.EditSettings,
                        content: {
                            scope: "channel",
                            model: channel,
                        }
                    });
					break;
				default: break;
			}
        },
		async enterChannel(channelId) {
			if (this.currentChannel.internalId === channelId) {
				return;
            }

            let channel = this.channelList.find(c => c.internalId === channelId);
            
            if (channel.password && (!this.$store.state.currentAccount || channel.owner !== this.$store.state.currentAccount.internalId) && !PermissionService.hasPermission("neo.channel.join.ignorepassword", this.$store.state.grantedPermissions)) {
                let channelPasswordDialog = new metroUI.ContentDialog({
                    title: "Passwort eingeben",
                    content: (() => {
                        return (
                            <div>
                                <p>Dieser Channel ist mit einem Passwort geschützt:</p>
                                <input type="password" placeholder="Channel-Passwort" data-required />
                            </div>
                        )
                    })(),
                    commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
                });
                
                switch (await channelPasswordDialog.showAsync()) {
                    case metroUI.ContentDialogResult.Primary:
                        SocketService.send({
                            type: PackageType.EnterChannel,
                            content: {
                                channelId: channelId,
                                password: channelPasswordDialog.text
                            }
                        });
                        break;
                    default: break;
                }
            } else {
                SocketService.send({
                    type: PackageType.EnterChannel,
                    content: {
                        channelId: channelId,
                        password: ""
                    }
                });
            }

            if (channel.password && PermissionService.hasPermission("neo.channel.join.ignorepassword", this.$store.state.grantedPermissions)) {
                new metroUI.Notification({
                    payload: {},
                    title: "Info",
                    icon: "info",
                    content: "Du hast diesen Channel ohne Passwort betreten. Du könntest eventuell unerwünscht sein.",
                    inputs: "",
                    buttons: [],
                }).show();
            }
        },
        async deleteChannel(channel) {
            var deleteChannelDialog = new metroUI.ContentDialog({
				title: "Channel löschen",
				content: (() => {
					return (
						<div>
							<p>Bist du sicher, dass du diesen Channel löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
							<br />
							<p>Alle Mitglieder, die diesen Channel aktuell geöffnet haben, werden in den Mainchannel verschoben.</p>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Löschen", primary: true }]
			});

            var result = await deleteChannelDialog.showAsync();
            
            if (result == metroUI.ContentDialogResult.Primary) {
                SocketService.send({
                    type: PackageType.DeleteChannel,
                    content: channel.internalId
                });
            }
        },
		sendMessage(text) {
			SocketService.send({
				type: PackageType.Input,
				content: {
                    input: text,
                    targetChannel: this.currentChannel.internalId
                }
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
		userListItemClicked(memberId) {
			let user = this.userList.find(_ => _.internalId === memberId);

			if (user && user.identity.id.localeCompare(this.currentIdentity.id) != 0) {
				this.$refs["messageContainer"].$refs["input"].value += `@${user.identity.id} `;
				this.$refs["messageContainer"].$refs["input"].dispatchEvent(new Event("input"));
				this.$refs["messageContainer"].$refs["input"].focus();
			}
		},
		userListItemContextClicked(event, memberId) {
			let isCurrentUser = this.userList.find(_ => _.internalId === memberId).identity.id == this.currentIdentity.id;

			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Private Nachricht",
					icon: "chat-bubbles",
					disabled: true || isCurrentUser
				},
				{
					title: "Bestrafen",
                    icon: "block-contact",
                    disabled: isCurrentUser,
					action: this.createPunishment,
					actionParams: memberId
				}
			]);
			flyout.show();
		}
	},
	computed: {
		currentIdentity() {
			return this.$store.state.identity;
		},
		currentChannel() {
			return this.$store.state.currentChannel;
		},
		channelList() {
			return this.$store.state.channelList;
		},
		groupList() {
			return this.$store.state.groupList;
		},
		lastUpdate() {
			return this.$store.state.lastUpdate;
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
