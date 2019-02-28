<template>
	<div class="page" data-page-id="settings">
		<metro-list-view class="fixed-width" acrylic="acrylic-80" menuTitle="Settings" ref="settingsView">
			<template slot="actions">
				<metro-list-view-action icon="more" />
			</template>
			
			<template slot="list-items">
				<metro-list-view-menu-separator title="General" />
				<metro-list-view-menu-item class="single-line" title="Server" page="server_settings" />
				
				<metro-list-view-menu-separator title="Groups" />
				<metro-list-view-menu-item class="single-line" title="%group_name%" />
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="server_settings" data-page-title="Server">
					<p>test</p>
				</div>
			</template>
		</metro-list-view>
	</div>
</template>

<style lang="less">
.list-view-item.single-line {
	span.text-label {
		font-weight: 400 !important;
	}
}
</style>

<script>
export default {
	name: "NeoSettingsPage",
	mounted() {
		this.$refs["settingsView"].navigate("server_settings");
	}
}
</script>
