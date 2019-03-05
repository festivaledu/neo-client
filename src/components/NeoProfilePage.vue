<template>
	<div class="page" data-page-id="profile">
		<metro-navigation-view menuTitle="Profil" :history="false" acrylic="acrylic-80" ref="profileSettingsView">
			<template slot="navigation-items">
				<metro-navigation-view-menu-item page="profile_general" icon="contact" title="Allgemein" />
				<metro-navigation-view-menu-item page="profile_colors" icon="color" title="Farben" />
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="profile_general" data-page-title="Allgemein">
					<h4>Profilbild</h4>
					<metro-person-picture displayName="Sniper_GER" />
					<button disabled>Profilbild wählen</button>
					
					<h4>Account-Informationen</h4>
					<p>Benutzername: %username%</p>
					<p>Benutzer-ID: %userId%</p>
					<p>E-Mail-Adresse: %userId%</p>
					
					<div class="control-group">
						<button @click="this.changeUsername">Benutzernamen ändern</button>
						<button @click="this.changeEmail">E-Mail-Adresse ändern</button>
						<button @click="this.changePassword">Passwort ändern</button>
					</div>
				</div>
				
				<div class="page" data-page-id="profile_colors" data-page-title="Farben">
					<p>Deine Farbeinstellungen werden mit dem Server synchronisiert und stehen dir beim Anmelden wieder zur Verfügung.</p>
					<br />
					<h4>Akzentfarbe</h4>
					<metro-accent-color-selector />
					
					<h4>App-Modus</h4>
					<metro-background-theme-selector lightName="Hell" darkName="Dunkel"/>
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
	
	.control-group {
		margin-top: 30px;
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
		async changeUsername() {
			var changeUsernameDialog = new metroUI.ContentDialog("Benutzernamen ändern", (() => {
				return (
					<div>
						<p>Hier kannst du deinen Benutzernamen ändern.</p>
						<br />
						<p>Bitte beachte, dass du dich nach erfolgreichem Ändern deines Benutzernamens erneut anmelden musst.</p>
						<br />
						<input type="Text" placeholder="Neuer Benutzername" />
					</div>
				)
			})(),
			[
				{
					text: "Ok",
					primary: true
				},
				{
					text: "Abbrechen"
				}
			]);
			var result = await changeUsernameDialog.showAsync();
			
			if (result == metroUI.ContentDialogResult.Primary) {
				console.log(changeUsernameDialog.text);
			}
		},
		async changeEmail() {
			var changeEmailDialog = new metroUI.ContentDialog("E-Mail-Adresse ändern", (() => {
				return (
					<div>
						<p>Hier kannst du deine E-Mail-Adresse ändern.</p>
						<br />
						<input type="email" placeholder="Neue E-Mail-Adresse" />
					</div>
				)
			})(),
			[
				{
					text: "Ok",
					primary: true
				},
				{
					text: "Abbrechen"
				}
			]);
			var result = await changeEmailDialog.showAsync();
			
			if (result == metroUI.ContentDialogResult.Primary) {
				console.log(changeEmailDialog.text);
			}
		},
		async changePassword() {
			var changePasswordDialog = new metroUI.ContentDialog("Passwort ändern", (() => {
				return (
					<div>
						<p>Hier kannst du dein Passwort ändern.</p>
						<br />
						<input type="password" placeholder="Derzeitiges Passwort" />
						<input type="password" placeholder="Neues Passwort (min. 8 Zeichen)" />
						<input type="password" placeholder="Passwort bestätigen" />
					</div>
				)
			})(),
			[
				{
					text: "Ok",
					primary: true
				},
				{
					text: "Abbrechen"
				}
			]);
			var result = await changePasswordDialog.showAsync();
			
			if (result == metroUI.ContentDialogResult.Primary) {
				console.log(changePasswordDialog.text);
			}
		}
	}
}
</script>
