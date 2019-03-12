<template>
	<div class="page" data-page-id="channels" @pageShow="pageShow" @pageHide="pageHide">
		<metro-emoji-picker @emojiPicked="emojiPicked" ref="emojiPicker" />

		<metro-navigation-view :history="false" acrylic="acrylic-80" class="transparent" ref="channelView">
			<template slot="navigation-items">
				<template v-if="channelList.length">
					<div class="navigation-view-item channel-list-item" :class="{'selected': currentChannel && (channel.internalId === currentChannel.internalId)}" v-for="(channel, index) in channelList" :key="index" @click="enterChannel(channel.internalId)" @contextmenu.prevent.stop="channelListItemContextClicked($event, channel)">
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
				<metro-navigation-view-menu-item icon="add" title="Channel erstellen" @click.native.prevent="createChannel" v-if="this.canCreateChannel" />
			</template>

			<template slot="pages">
				<div class="page" data-page-id="messages">
					<metro-messages ref="messageContainer" @messageSent="sendMessage" @emojiPickerRequested="emojiPickerRequested" :disabled="!this.canWriteMessages" />
				</div>

				<metro-list-view class="user-list" acrylic="acrylic-80">
					<template slot="list-items" v-if="currentChannel && userList.length && groupList.length">
						<div v-for="group in sortedGroupList" :key="group.internalId + userList.length" :data-group-identifier="group.internalId">
							<div v-if="group.memberIds.filter(_ => currentChannel.activeMemberIds.includes(_)).length">
								<div class="list-view-item-separator">
									<p>{{group.name}}</p>
								</div>

								<div v-for="(memberId, index) in sortedMemberList(group.memberIds.filter(_ => currentChannel.activeMemberIds.includes(_)))" :key="index">
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
				color: var(--base-medium);
			}
		}
	}
}

.page[data-page-id="channels"] {
	position: relative;

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
import NeoChannelUserListItem from '@/components/NeoChannelUserListItem.vue'

import { NotificationDelegate } from '@/scripts/NotificationDelegate'
import { PermissionService } from '@/scripts/PermissionService'
import { SocketService } from '@/scripts/SocketService'
import PackageType from '@/scripts/PackageType'

export default {
	name: "NeoChannelPage",
	components: {
		NeoChannelUserListItem
	},
	data() {
		return {
			selectedChannel: null
		}
	},
	mounted() {
		SocketService.$on("package", this.messageHandler);
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
		pageShow() {
			SocketService.$on("package", this.onPackage);
			
			if (this.selectedChannel) {
				this.enterChannel(this.selectedChannel);
			}
			
			this.$refs["messageContainer"]._scrollToBottom();
		},
		pageHide() {
			SocketService.$off("package", this.onPackage);
			this.$refs["emojiPicker"].hide();
		},
		messageHandler(packageObj) {
			// This is required so we can still push messages to the
			// selected channel while the regular package handler is detached
			if (packageObj.type == PackageType.Message)  {
				if (this.canReadMessages && this.currentChannel.internalId == packageObj.content.channelId) {
					this.$refs["messageContainer"].addMessage({
						author: packageObj.content.identity.id,
						displayName: packageObj.content.identity.name,
						date: new Date(packageObj.content.timestamp),
						text: packageObj.content.message,
						type: packageObj.content.messageType
					});
				}
			} else if (packageObj.type == PackageType.Mention) {
				if ((packageObj.content.channelId === this.currentChannel.internalId && document.hasFocus()) || !this.channelList.find(_ => _.internalId == packageObj.content.channelId)) {
					return;
				}

				NotificationDelegate.sendNotification({
					payload: packageObj.content,
					icon: "accounts",
					title: `${packageObj.content.identity.name} (@${packageObj.content.identity.id}) in #${this.channelList.find(_ => _.internalId == packageObj.content.channelId).id}`,
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
						this.$parent.navigate("channels");
						this.enterChannel(payload.channelId);
					}
				});
			}
		},
		onPackage(packageObj) {
			switch (packageObj.type) {
				case PackageType.MetaResponse:
					this.$store.commit("setServerName", packageObj.content.name);
					this.$refs["channelView"].setMenuTitle(this.$store.state.serverName);
					break;
				case PackageType.EnterChannelResponse:
					if (packageObj.content.channel.attributes["neo.channeltype"] && packageObj.content.channel.attributes["neo.channeltype"] === "conversation") {
						return;
					}

					if (packageObj.content.result === "Success") {
						this.selectedChannel = packageObj.content.channel.internalId;
						
						let messages = packageObj.content.channel.messages.map(messageObj => {
							return {
								author: messageObj.identity.id,
								displayName: messageObj.identity.name,
								date: new Date(messageObj.timestamp),
								text: messageObj.message,
								type: this.currentIdentity.id === messageObj.identity.id ? "sent" : "received"
							}
						});

						if (this.$refs["messageContainer"]) {
							if (this.canReadMessages) {
								this.$refs["messageContainer"].setMessages(messages);
							} else {
								this.$refs["messageContainer"].setMessages([{
									text: "Du bist nicht berechtigt, Nachrichten zu lesen",
									type: "system"
								}]);
							}
						}


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
												return <p>Du bist nicht berechtigt, einen Channel zu betreten.</p>;
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

		_getUser(internalId) {
			return this.userList.find(_ => _.internalId === internalId);
		},
		_isChannelOwner(channel) {
			if (this._getUser(channel.owner)) {
				return this._getUser(channel.owner).identity.id == this.currentIdentity.id;
			}

			return false;
		},

		channelListItemContextClicked(event, channel) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Bearbeiten",
					icon: "edit",
					disabled: !this._isChannelOwner(channel) && !this.canEditChannel,
					action: () => { this.editChannel(channel) },
				},
				{
					title: "Löschen",
					icon: "delete",
					disabled: (channel.attributes['neo.channeltype'] && channel.attributes['neo.channeltype'] == 'main') || (!this._isChannelOwner(channel) && !this.canDeleteChannel),
					action: () => { this.deleteChannel(channel) },
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
							<p>Channel-Name</p>
							<input type="text" placeholder="Channel-Name" data-required />

							<p>Channel-ID</p>
							<input type="text" placeholder="Channel-ID (min. 3 Zeichen)" data-minlength="3" />

							<p>Benutzerlimit (-1 für unbegrenzt)</p>
							<input type="text" placeholder="Benutzerlimit" data-required />

							<p>Passwort</p>
							<input type="password" placeholder="Passwort (optional)" />

							<p>Wähle die Channel-Art:</p>
							<metro-combo-box>
								<select>
									{ /* <option value="Temporary">Temporär</option> */ }
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
										<p>Benutzerlimit (-1 für unbegrenzt)</p>
										<input type="text" placeholder="Benutzerlimit" value={channel.limit} data-required />

										<p>Passwort</p>
										<input type="password" placeholder="Passwort (optional)" value={channel.password} />

										<p>Channel-Art</p>
										<metro-combo-box>
											<select>
												{ /* <option value="Temporary" selected={channel.lifetime == 'Temporary'}>Temporär</option> */ }
												<option value="Permanent" selected={channel.lifetime == 'Permanent'}>Permanent</option>
											</select>
										</metro-combo-box>
									</div>
								} else {
									return <div style="align-items: center; display: flex">
										<i class="icon report-hacked" style="display: inline-block; font-size: 20px; margin: 12px"></i>
										<p>Dies ist der Hauptchannel. Du kannst daher nicht alle Eigenschaften bearbeiten und den Channel auch nicht entfernen.</p>
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

		async deleteChannel(channel) {
			var deleteChannelDialog = new metroUI.ContentDialog({
				title: "Channel löschen",
				content: (() => {
					return (
						<div>
							<p>Bist du sicher, dass du diesen Channel löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
							<br />
							<p>Alle Mitglieder, die diesen Channel aktuell geöffnet haben, werden in den Hauptchannel verschoben.</p>
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

		async enterChannel(channelId) {
			if (this.currentChannel.internalId && this.currentChannel.internalId === channelId) {
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
					disabled: isCurrentUser || this.currentIdentity.id.startsWith("Guest-") || this.userList.find(_ => _.internalId === memberId).identity.id.startsWith("Guest-")
				},
				{
					title: "Bestrafen",
					icon: "block-contact",
					disabled: isCurrentUser || (!this.canModerateKick && !this.canModerateBan),
					action: () => { this.createPunishment(memberId) }
				}
			]);
			flyout.show();
		},

		async createPunishment(memberId) {
			console.log(memberId);
			var punishmentDialog = new metroUI.ContentDialog({
				title: "Nutzer bestrafen",
				content: (() => {
					return (
						<div>
							<p>Wähle die Art der Bestrafung:</p>
							<metro-combo-box>
								<select>
									{/*<option value="mute">Stummschalten</option>*/}
									{this.allowedPunishments.map(p => {
										return (
											<option value={p.value}>{p.label}</option>
										)})
									}
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


		emojiPickerRequested(target) {
			this.$refs["emojiPicker"].toggle(target);
		},
		emojiPicked(char) {
			this.$refs["messageContainer"].$refs["input"].value += `${char}`;
			this.$refs["messageContainer"].$refs["input"].dispatchEvent(new Event("input"));
			this.$refs["messageContainer"].$refs["input"].focus();
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

		sortedMemberList(memberIds) {
			if (memberIds.length <= 1) {
				return memberIds;
			}
			
			return memberIds.slice(0).sort((a, b) => {
				if (a && b) {
					return this.userList.find(_ => _.internalId === a).identity.name.localeCompare(this.userList.find(_ => _.internalId === b).identity.name);
				}
				return 0;
			});
		}
	},
	computed: {
		canCreateChannel() { return PermissionService.hasPermission("neo.channel.create", this.$store.state.grantedPermissions); },
		canDeleteChannel() { return PermissionService.hasPermission("neo.channel.delete", this.$store.state.grantedPermissions); },
		canEditChannel() { return PermissionService.hasPermission("neo.channel.edit", this.$store.state.grantedPermissions); },
		canJoinChannel() { return PermissionService.hasPermission("neo.channel.join", this.$store.state.grantedPermissions); },
		canJoinChannelIgnoreBlacklist() { return PermissionService.hasPermission("neo.channel.join.ignoreblacklist", this.$store.state.grantedPermissions); },
		canJoinChannelIgnoreLimit() { return PermissionService.hasPermission("neo.channel.join.ignorelimit", this.$store.state.grantedPermissions); },
		canJoinChannelIgnorePassword() { return PermissionService.hasPermission("neo.channel.join.ignorepassword", this.$store.state.grantedPermissions); },
		canJoinChannelIgnoreWhitelist() { return PermissionService.hasPermission("neo.channel.join.ignorewhitelist", this.$store.state.grantedPermissions); },
		canReadMessages() { return PermissionService.hasPermission("neo.global.read", this.$store.state.grantedPermissions); },
		canWriteMessages() { return PermissionService.hasPermission("neo.global.write", this.$store.state.grantedPermissions); },
		canCreateGroup() { return PermissionService.hasPermission("neo.group.create", this.$store.state.grantedPermissions); },
		canDeleteGroup() { return PermissionService.hasPermission("neo.group.delete", this.$store.state.grantedPermissions); },
		canModerateBan() { return PermissionService.hasPermission("neo.moderate.ban", this.$store.state.grantedPermissions); },
		canModerateKick() { return PermissionService.hasPermission("neo.moderate.kick", this.$store.state.grantedPermissions); },

		allowedPunishments() {
			let punishments = [];

			if (this.canModerateKick) {
				punishments.push({ value: "kick", label: "Kicken" });
			}

			if (PermissionService.canModerateBan) {
				punishments.push({ value: "ban", label: "Bannen" });
			}

			return punishments;
		},

		currentIdentity() {
			return this.$store.state.currentIdentity;
		},
		currentChannel() {
			return this.$store.state.currentChannel;
		},
		channelList() {
			return this.$store.state.channelList.filter(c => !c.attributes["neo.channeltype"] || c.attributes["neo.channeltype"] !== "conversation");
		},
		groupList() {
			return this.$store.state.groupList;
		},
		lastUpdate() {
			return this.$store.state.lastUpdated;
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
