<template>
	<div class="views">
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="navigation-view">
					<metro-navigation-view title="This is header text" :history="false" :startRetracted="true" ref="navView" class="transparent no-frame-animation fixed-width">
						<template slot="navigation-items">
							<metro-navigation-view-menu-item page="channel-list" icon="channels" title="Channels" />

							<!-- Items below this line should be plugins from the server -->
							<metro-navigation-view-menu-item page="test2" icon="chat-bubbles" title="Private Messages" />
							<metro-navigation-view-menu-item page="test3" icon="graph" title="Surveys" />
						</template>
						<template slot="pages">
							<div class="page" data-page-id="channel-list">
								<metro-navigation-view title="This is header text" :history="false" ref="" acrylic="acrylic-80">
									<template slot="navigation-items">
										<div class="navigation-view-item channel-list-item" data-page="messages">
											<div class="navigation-view-item-inner">
												<div class="navigation-view-item-icon">
													<metro-person-picture displayName="#" />
												</div>
												<p class="navigation-view-item-content">
													<span class="text-label">#channel</span>
													<span class="detail-text-label">Status Message</span>
												</p>
											</div>
										</div>
									</template>

									<template slot="pages">
										<div class="page" data-page-id="messages" data-page-title="#debug">
											<metro-messages ref="messages" @messageSent="Messages_MessageSent" />
										</div>
									</template>
								</metro-navigation-view>
							</div>
							<div class="page" data-page-id="test2" data-page-title="Example page 2">
								<p>Example page 2</p>
							</div>
							<div class="page" data-page-id="test3" data-page-title="Example page 3">
								<p>Example page 3</p>
							</div>
							<div class="page" data-page-id="settings" data-page-title="Settings">
								<p>Settings</p>
							</div>
						</template>
						<template slot="settings-button">
							<metro-navigation-view-settings-button page="settings" title="Settings" />
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

.views {
	background-color: transparent !important;
}

i.icon{
	&.channels {
		.encoded-svg-background("<svg width='20px' height='20px' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' ><path d='M16,7.2929062 L15.7563989,8.4248665 L12.9920565,8.4248665 L12.3248014,11.6285278 L15.3009709,11.6285278 L15.0150044,12.7604882 L12.1023831,12.7604882 L11.1703442,17 L9.8358341,17 L10.7466902,12.7604882 L8.0988526,12.7604882 L7.2091792,17 L5.8852604,17 L6.7749338,12.7604882 L4,12.7604882 L4.211827,11.6285278 L7.0185349,11.6285278 L7.6646072,8.4248665 L4.7308032,8.4248665 L4.9532215,7.2929062 L7.8870256,7.2929062 L8.776699,3 L10.1112092,3 L9.2215357,7.2929062 L11.890556,7.2929062 L12.8014122,3 L14.1041483,3 L13.2144748,7.2929062 L16,7.2929062 Z M11.678729,8.4248665 L9.0097087,8.4248665 L8.3106796,11.6285278 L11.0008826,11.6285278 L11.678729,8.4248665 Z' fill='#000000' fill-rule='nonzero'/></svg>");
	}

	&.graph:after {
		content: "\E9D2";
	}
}

.navigation-view.fixed-width {
	& > .frame {
		width: calc(~"100vw - 48px");
	}
}

.navigation-view .navigation-view-menu .navigation-view-items .navigation-view-item.channel-list-item {
	height: 64px;

	.navigation-view-item-icon {
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
</style>


<script>
export default {
	name: "NavigationView",
	mounted() {
		this.$refs["navView"].navigate("channel-list")
	},
	methods: {
		Messages_MessageSent(text) {
			this.$refs["messages"].addMessage({
				author: "DDBE86A4-A9A5-4F5D-B134-48323636AB77",
				displayName: "unknown",
				date: new Date(),
				text: text,
				type: "sent"
			});
			// SocketService.send({
			// 	type: 9,
			// 	content: text
			// });
		}
	}
}
</script>