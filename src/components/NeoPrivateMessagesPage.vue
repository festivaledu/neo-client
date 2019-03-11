<template>
	<div class="page" data-page-id="private-messages">
		<metro-navigation-view :history="false" menuTitle="Private Nachrichten" acrylic="acrylic-80" ref="messagesView">
			<template slot="navigation-items">
					<div class="navigation-view-item channel-list-item">
						<div class="navigation-view-item-inner">
							<div class="navigation-view-item-icon">
								<metro-person-picture displayName="FUCKING HELL" />
							</div>
							<p class="navigation-view-item-content">
								<span class="text-label">%username%</span>
								<span class="detail-text-label">%lastmessage%</span>
							</p>
						</div>
					</div>
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="messages">
					<metro-messages ref="messageContainer" />
				</div>
			</template>
		</metro-navigation-view>
	</div>
</template>

<script>
import { NotificationDelegate } from '@/scripts/NotificationDelegate'
import { PermissionService } from '@/scripts/PermissionService'
import { SocketService } from '@/scripts/SocketService'
import PackageType from '@/scripts/PackageType'

export default {
	name: "NeoPrivateMessagesPage",
	mounted() {
		SocketService.$on("package", this.onPackage);
		this.$refs["messagesView"].navigate("messages");
	},
	methods: {
		onPackage(packageObj) {
			
		}
	}
}
</script>
