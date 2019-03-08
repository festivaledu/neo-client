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
					<metro-person-picture :displayName="currentIdentity.name" />
					<button :disabled="!currentAccount">Profilbild wählen</button>

					<h4>Account-Informationen</h4>
					<p>Benutzername: {{currentIdentity.name}}</p>
					<p>Benutzer-ID: {{currentIdentity.id}}</p>
					<p v-if="currentAccount">E-Mail-Adresse: {{currentAccount.email}}</p>

					<div class="control-group">
						<button @click="this.showEditAccountFlyout">Account bearbeiten</button>
					</div>
				</div>

				<div class="page" data-page-id="profile_colors" data-page-title="Farben">
					<p>Deine Farbeinstellungen werden mit dem Server synchronisiert und stehen dir beim Anmelden wieder zur Verfügung.</p>
					<br />
					<h4>Akzentfarbe</h4>
					<metro-accent-color-selector @accent-select="setColors($event, null)" />

					<h4>App-Modus</h4>
					<metro-background-theme-selector @theme-select="setColors(null, $event)" lightName="Hell" darkName="Dunkel"/>
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
import { SocketService } from "@/scripts/SocketService";
import PackageType from '@/scripts/PackageType';
import CryptoJS from "crypto-js";

export default {
	name: "NeoProfilePage",
	mounted() {
        this.$refs["profileSettingsView"].navigate("profile_general");
        
        SocketService.$on("package", this.onPackage);
	},
	methods: {
        onPackage(packageObj) {
            switch (packageObj.type) {                
                case PackageType.EditProfileResponse:

                    if (!packageObj.content.account && !packageObj.content.identity && packageObj.content.request.key !== "password") {
                        new metroUI.ContentDialog({
							title: "Fehler beim Ändern deines Profils",
							content: `"${packageObj.content.request.value}" ist kein erlaubter Wert oder wird bereits verwendet.`,
							commands: [{ text: "Ok", primary: true }]
						}).show();
						return;
                    }

                    if (!packageObj.content.account && !packageObj.content.identity && packageObj.content.request.key === "password") {
                        new metroUI.ContentDialog({
							title: "Fehler beim Ändern deines Profils",
							content: "Das aktuelle Passwort ist falsch.",
							commands: [{ text: "Ok", primary: true }]
						}).show();
						return;
					}
					
					if (packageObj.content.account) {
                        this.$store.commit("setCurrentAccount", packageObj.content.account);
                    }

                    if (packageObj.content.identity) {
                        this.$store.commit("setIdentity", packageObj.content.identity);
					}
					
					new metroUI.ContentDialog({
						title: "Profil geändert",
						content: "Dein Profil wurde erfolgreich geändert",
						commands: [{ text: "Ok", primary: true }]
					}).show();
                    break;
            }
        },
		setColors(accentEvent, themeEvent) {
			let account = this.$store.state.currentAccount;

			if (!account) {
				return;
			}

			if (accentEvent) {
				account.attributes["neo.client.accent"] = accentEvent;
			}

			if (themeEvent) {
				account.attributes["neo.client.theme"] = themeEvent;
			}

			this.$store.commit("setCurrentAccount", account);

			SocketService.send({
				type: PackageType.EditSettings,
				content: {
					scope: "account",
					model: account
				}
			});
		},
		showEditAccountFlyout(event) {
			new metroUI.MenuFlyout(event.target, [
				{
					title: "Benutzernamen ändern",
					action: this.changeUsername
				},
				{
					title: "Benutzer-ID ändern",
					action: this.changeUserId,
					disabled: this.currentAccount === null
				},
				{
					title: "E-Mail-Adresse ändern",
					action: this.changeEmail,
					disabled: this.currentAccount === null
				},
				{
					title: "Passwort ändern",
					action: this.changePassword,
					disabled: this.currentAccount === null
				},
			]).show();
		},
		async changeUsername() {
			var changeUsernameDialog = new metroUI.ContentDialog({
				title: "Benutzernamen ändern",
				content: (() => {
					return (
						<div>
							<input type="Text" placeholder="Neuer Benutzername" data-required="true" />
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
			});
			var result = await changeUsernameDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
                SocketService.send({
                    type: PackageType.EditProfile,
                    content: {
                        key: "name",
                        value: changeUsernameDialog.text
                    }
                });
			}
		},
		async changeUserId() {
			var changeUserIdDialog = new metroUI.ContentDialog({
				title: "Benutzer-ID ändern",
				content: (() => {
					return (
						<div>
							<input type="Text" placeholder="Neue Benutzer-ID (min. 3 Zeichen)" data-minlength="3" />
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
			});
			var result = await changeUserIdDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
				SocketService.send({
                    type: PackageType.EditProfile,
                    content: {
                        key: "id",
                        value: changeUserIdDialog.text
                    }
                });
			}
		},
		async changeEmail() {
			var changeEmailDialog = new metroUI.ContentDialog({
				title: "E-Mail-Adresse ändern", 
				content: (() => {
					return (
						<div>
							<input type="email" placeholder="Neue E-Mail-Adresse" data-required="true" />
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen"}, { text: "Ok", primary: true }]
			});
			var result = await changeEmailDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
				SocketService.send({
                    type: PackageType.EditProfile,
                    content: {
                        key: "email",
                        value: changeEmailDialog.text
                    }
                });
			}
		},
		async changePassword() {
			var changePasswordDialog = new metroUI.ContentDialog({
				title: "Passwort ändern",
				content: (() => {
					return (
						<div>
							<input type="password" placeholder="Derzeitiges Passwort" data-required="true" />
							<input type="password" placeholder="Neues Passwort (min. 8 Zeichen)" data-minlength="8" />
							<input type="password" placeholder="Passwort bestätigen" data-required="true" />
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
			});
			var result = await changePasswordDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
                let passwords = changePasswordDialog.text;

                if (passwords[1].localeCompare(passwords[2]) != 0) {
                    new metroUI.ContentDialog({
						title: "Fehler beim Ändern deines Profils",
						content: "Die angegeben Passwörter stimmen nicht überein.",
						commands: [{ text: "Ok", primary: true }]
					}).show();
                    return;
                }

                for (let i = 0; i < 3; i++) {
                    passwords[i] = CryptoJS.enc.Base64.stringify(CryptoJS.SHA512(passwords[i]));
                }

				SocketService.send({
                    type: PackageType.EditProfile,
                    content: {
                        key: "password",
                        value: passwords
                    }
                });
			}
		}
	},
	computed: {
		currentAccount() {
			return this.$store.state.currentAccount;
		},
		currentIdentity() {
			return this.$store.state.identity;
		}
	}
}
</script>
