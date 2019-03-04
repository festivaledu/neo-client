<template>
	<div class="page" data-page-id="profile">
		<metro-navigation-view menuTitle="Profile Settings" :history="false" acrylic="acrylic-80" ref="profileSettingsView">
			<template slot="navigation-items">
				<metro-navigation-view-menu-item page="profile_general" icon="contact" title="General" />
				<metro-navigation-view-menu-item page="profile_colors" icon="color" title="Colors" />
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="profile_general" data-page-title="General">
					<h4>Profile Image</h4>
					<metro-person-picture displayName="Sniper_GER" />
					<button>Set Profile Image</button>
					
					<h4>Username</h4>
					<input type="text" placeholder="Username" value="Sniper_GER" />
					<div class="control-group">
					<button disabled>Save Username</button>
					<button @click="this.changePassword">Change Password</button>
					</div>
				</div>
				
				<div class="page" data-page-id="profile_colors" data-page-title="Colors">
					<h4>Accent Color</h4>
					<metro-accent-color-selector />
					
					<h4>Background Mode</h4>
					<metro-background-theme-selector/>
				</div>
			</template>
		</metro-navigation-view>
	</div>
</template>

<style lang="less">
.page[data-page-id="profile"] {
	.person-picture {
		width: 128px;
		height: 128px;
		margin-bottom: 8px;
		
		&:before {
			width: 128px;
			height: 128px;
			border-radius: 64px;
		}
		
		.initials {
			font-size: 56px;
			line-height: 78px;
			padding: 22px 0 28px;
		}
	}
}
</style>

<script>
export default {
	name: "NeoSettingsPage",
	mounted() {
		this.$refs["profileSettingsView"].navigate("profile_general");
	},
	methods: {
		async changePassword() {
			var changePasswordDialog = new metroUI.ContentDialog("Change your password",
			(() => {
				return (
					<div>
						<p>Enter your current password:</p>
						<input type="password" />
						
						<p>Enter your new password:</p>
						<input type="password" />
						
						<p>Confirm your new password:</p>
						<input type="password" />
					</div>
				)
			})(),
			[{text: "Ok", primary: true},{text: "Cancel"}]);
			var result = await changePasswordDialog.showAsync();
			
			if (result == 1) {
				console.log(changePasswordDialog.text);
			}
		}
	}
}
</script>
