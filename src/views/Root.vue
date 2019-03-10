<template>
	<div class="views transparent">
		<vue-headful title="neo" />
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="root">

					<!-- Main navigation view, always visible -->
					<metro-navigation-view menuTitle="Neo" :history="false" :startRetracted="true" class="transparent no-frame-animation fixed-width" ref="mainNavView">

						<!-- Regular navigation items -->
						<template slot="navigation-items">
							<metro-navigation-view-menu-item page="channels" icon="channels" title="Channels" />

							<!-- Items provided by plugins -->
						</template>

						<!-- Bottom navigation items -->
						<template slot="bottom-items">
							<metro-navigation-view-menu-item page="profile" icon="contact" title="Profil" />
							<metro-navigation-view-menu-item page="settings" icon="settings" title="Einstellungen" />
						</template>

						<!-- Pages stored in this navigation view -->
						<template slot="pages">
							<NeoChannelPage />

							<!-- Pages provided by plugins -->

							<NeoProfilePage />
							<NeoSettingsPage />
						</template>
					</metro-navigation-view>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less">
.encoded-svg-background(@svg) {
	@url: `encodeURIComponent(@{svg})`;
	background-image: url("data:image/svg+xml;charset=utf-8,@{url}");
}

body[data-theme="light"] i.icon.channels {
	.encoded-svg-background("<svg width='20px' height='20px' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' ><path d='M16,7.2929062 L15.7563989,8.4248665 L12.9920565,8.4248665 L12.3248014,11.6285278 L15.3009709,11.6285278 L15.0150044,12.7604882 L12.1023831,12.7604882 L11.1703442,17 L9.8358341,17 L10.7466902,12.7604882 L8.0988526,12.7604882 L7.2091792,17 L5.8852604,17 L6.7749338,12.7604882 L4,12.7604882 L4.211827,11.6285278 L7.0185349,11.6285278 L7.6646072,8.4248665 L4.7308032,8.4248665 L4.9532215,7.2929062 L7.8870256,7.2929062 L8.776699,3 L10.1112092,3 L9.2215357,7.2929062 L11.890556,7.2929062 L12.8014122,3 L14.1041483,3 L13.2144748,7.2929062 L16,7.2929062 Z M11.678729,8.4248665 L9.0097087,8.4248665 L8.3106796,11.6285278 L11.0008826,11.6285278 L11.678729,8.4248665 Z' fill='#000000' fill-rule='nonzero'/></svg>");
}

body[data-theme="dark"] i.icon.channels {
	.encoded-svg-background("<svg width='20px' height='20px' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' ><path d='M16,7.2929062 L15.7563989,8.4248665 L12.9920565,8.4248665 L12.3248014,11.6285278 L15.3009709,11.6285278 L15.0150044,12.7604882 L12.1023831,12.7604882 L11.1703442,17 L9.8358341,17 L10.7466902,12.7604882 L8.0988526,12.7604882 L7.2091792,17 L5.8852604,17 L6.7749338,12.7604882 L4,12.7604882 L4.211827,11.6285278 L7.0185349,11.6285278 L7.6646072,8.4248665 L4.7308032,8.4248665 L4.9532215,7.2929062 L7.8870256,7.2929062 L8.776699,3 L10.1112092,3 L9.2215357,7.2929062 L11.890556,7.2929062 L12.8014122,3 L14.1041483,3 L13.2144748,7.2929062 L16,7.2929062 Z M11.678729,8.4248665 L9.0097087,8.4248665 L8.3106796,11.6285278 L11.0008826,11.6285278 L11.678729,8.4248665 Z' fill='#FFFFFF' fill-rule='nonzero'/></svg>");
}

.navigation-view.fixed-width > .frame {
			width: calc(~"100% - 48px");
		}

.views.transparent {
	background-color: transparent !important;
}

i.icon{
	&.graph:after {
		content: "\E9D2";
	}
}
</style>

<script>
import NeoChannelPage from "@/components/NeoChannelPage"
import NeoSettingsPage from "@/components/NeoSettingsPage"
import NeoProfilePage from "@/components/NeoProfilePage"

import { SocketService } from "@/scripts/SocketService";
import PackageType from '@/scripts/PackageType';

export default {
	name: "Root",
	components: {
		NeoChannelPage,
		NeoSettingsPage,
		NeoProfilePage
	},
	mounted() {
		this.$refs["mainNavView"].navigate("channels");

		SocketService.send({
			type: PackageType.LoginFinished
		});

		SocketService.$on("package", this.onPackage);
	},
	methods: {
		onPackage(packageObj) {
			console.debug(Object.keys(PackageType).find(t => PackageType[t] === packageObj.type));
			console.debug(packageObj.content);

			switch (packageObj.type) {
				case PackageType.AccountListUpdate:
					this.$store.commit("setAccountList", packageObj.content);
					break;
				case PackageType.ChannelListUpdate:
					this.$store.commit("setChannelList", packageObj.content);
					break;
				case PackageType.GroupListUpdate:
					this.$store.commit("setGroupList", packageObj.content);
					break;
				case PackageType.UserListUpdate:
					this.$store.commit("setUserList", packageObj.content);
					this.$forceUpdate();
					break;
				case PackageType.KnownPermissionsUpdate:
					this.$store.commit("setKnownPermissions", packageObj.content);
					break;
				case PackageType.DisconnectReason:
					let reasons = {
						"shutdown": "Der Server fährt herunter",
						"kick": "Du wurdest gekickt",
						"ban": "Du wurdest gebannt"
					};

					new metroUI.Notification({
						payload: {},
						title: "Verbindung getrennt",
						icon: "ethernet-error",
						content: reasons[packageObj.content],
						inputs: "",
						buttons: [],
					}).show();
					break;
				case PackageType.Mention:
					let mentionNotification = new metroUI.Notification({
						payload: packageObj.content,
						title: packageObj.content.identity.name + " hat dich in #" + this.channelList.find(_ => _.internalId == packageObj.content.channelId).id + " erwähnt",
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
							
							SocketService.send({
								type: PackageType.EnterChannel,
								content: payload.channelId
							});
						}
					});
					mentionNotification.show();
					break;
				default: break;
			}
		}
	},
	computed: {
        channelList() {
            return this.$store.state.channelList;
        },
		currentChannel() {
			return this.$store.state.currentChannel;
		}
	}
}
</script>