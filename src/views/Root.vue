<template>
	<div class="views transparent">
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
							<metro-navigation-view-menu-item page="profile" icon="contact" title="Profile" />
							<metro-navigation-view-menu-item page="settings" icon="settings" title="Settings" />
						</template>
						
						<!-- Pages stored in this navigation view -->
						<template slot="pages">
							<NeoChannelPage :channelData="this.channels" />
							
							<!-- Pages provided by plugins -->
							
							<NeoProfilePage />
							
							<!-- The settings page is only available if the user is permitted -->
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

export default {
	name: "Root",
	components: {
		NeoChannelPage,
		NeoSettingsPage,
		NeoProfilePage
	},
	data() {
		return {
			channels: [
				{
					id: "%channel_name%",
					status: "%status%",
					channelArtwork: "https://via.placeholder.com/32x32"
				}
			]
		}
	},
	mounted() {
		this.$refs["mainNavView"].navigate("channels");
	}
}
</script>