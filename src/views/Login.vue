<template>
	<div class="acrylic acrylic-80">
		<vue-headful title="neo – Login" />
		<div class="container">
			<div class="row justify-content-around">
				<div class="col-md-4">
					<nav class="mb-5">
						<div class="nav-logo pb-0">
							<div class="nav-link">
								<h1 class="text-center">neo</h1>
							</div>
						</div>
					</nav>
					<hr>

					<div class="row mt-3 d-flex">
						<div class="col progress-indicator-container" >
							<div class="progress indeterminate" v-show="isConnecting || isWorking" />
						</div>
					</div>

					<form novalidate class="mb-5">
						<div class="form-group">
							<label>Server-Adresse</label>
							<metro-auto-suggest v-model="serverAddress" placeholder="127.0.0.1" :data="knownServers" :disabled="isConnecting || socket" @keyup.13="connect" />
						</div>

						<div class="row mt-3 d-flex">
							<div class="col col-auto">
								<button class="btn btn-primary d-block" @click.prevent="connect()" :disabled="$v.serverAddress.$invalid || isConnecting || socket">Verbinden</button>
							</div>
							<div class="col col-auto" v-if="isConnecting">
								<p class="block-text">Verbinden...</p>
							</div>
						</div>
						<!-- <div class="row mt-3 d-md-none">
							<div class="col col-12">
								<button class="btn btn-primary d-block col-12" @click.prevent="connect()" :disabled="$v.serverAddress.$invalid || socket">Connect</button>
							</div>
						</div> -->
					</form>

					<form novalidate>
						<div class="form-group">
							<label>Benutzer-ID oder E-Mail-Adresse</label>
							<input type="text" placeholder="Max Mustermann" v-model="user.username" :disabled="!socket" @input="$v.user.username.$touch()" @keyup.13="login">
						</div>
						<div class="form-group">
							<label for="login-password">Passwort</label>
							<input type="password" placeholder="Benötigt" v-model="user.password" :disabled="!socket" @input="$v.user.password.$touch()" @keyup.13="login">
						</div>
					</form>

					<div class="row mt-3 d-flex">
						<div class="col col-6 text-left">
							<button class="btn btn-primary d-inline-block" @click="connectAsGuest()" :disabled="$v.user.username.$invalid || isWorking || !serverMetadata.guestsAllowed">Als Gast anmelden</button>
						</div>

						<div class="col col-6 text-right">
							<button class="btn btn-primary d-inline-block colored" @click="login()" :disabled="$v.user.$invalid || isWorking">Anmelden</button>
						</div>

						<div class="col text-left" v-show="!isWorking">
							<a href="#" class="d-inline-block mt-2 p-0" @click.prevent="register" :disabled="!socket || !serverMetadata.registrationAllowed">Noch kein Account?</a>
						</div>
						</div>

					<!-- <div class="row mt-3 d-md-none">
						<div class="col col-12" v-show="!isWorking">
							<button class="col-12" @click="login()" :disabled="$v.user.$invalid || isWorking">Sign In</button>
						</div>

						<div class="col col-12" v-show="!isWorking">
							<button class="col-12" @click="connectAsGuest()" :disabled="$v.user.username.$invalid || isWorking || !guestsAllowed">Connect as guest</button>
						</div>

						<div class="col col-12 mt-3 text-center" v-show="!isWorking">
							<router-link class="d-block mt-2 p-0" to="/register" :disabled="!socket || !registrationAllowed">Don't have an account yet?</router-link>
						</div>
						<div class="col col-12 text-center" v-show="isWorking">
							<div class="loading-indicator" />
						</div>
					</div> -->
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less">
.progress-indicator-container {
	position: relative;
	height: 24px;

	.progress.indeterminate {
		position: absolute;
		left: 0;
	}
}

.form-group {
	input[type="email"],
	input[type="number"],
	input[type="password"],
	input[type="search"],
	input[type="tel"],
	input[type="text"],
	input[type="url"],
	.auto-suggest .items {
		max-width: initial;
	}
}

p.block-text {
	line-height: 32px;
}

@media all and (max-width: 576px) {
	.container, .container > .row {
		min-height: 100vh;
	}
}
@media all and (min-width: 576px) {
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;

		& > .row {
			flex: 1;

			& > .acrylic-background {
				border-radius: 56px;
			}
		}
	}
}
</style>

<script>
import { SocketService } from "@/scripts/SocketService";
import PackageType from '@/scripts/PackageType';
import { required } from 'vuelidate/lib/validators';
import CryptoJS from "crypto-js";

export default {
	name: 'Login',
	data() {
		return {
			serverAddress: location.hostname,
			// serverAddress: "192.168.0.16",
			socket: null,
			knownServers: JSON.parse(localStorage.getItem("known-servers")) || [],

			user: {
				username: "",
				password: ""
			},
			isConnecting: false,
			isWorking: false,
			authData: null,
			registerData: {
				username: "",
				userId: "",
				email: "",
				password: "",
				passwordConfirm: ""
			},
			serverMetadata: {
				guestsAllowed: false,
				registrationAllowed: false
			}
		}
	},
	validations: {
		serverAddress: { required },
		user: {
			username: { required },
			password: { required }
		}
	},
	mounted() {
		SocketService.$on("open", this.onOpen);
		SocketService.$on("close", this.onClose);
		SocketService.$on("package", this.onPackage);
	},
	beforeDestroy() {
		SocketService.$off("package", this.onPackage);
	},
	methods: {
		onOpen() {
			this.socket = SocketService.socket;

			if (this.knownServers.indexOf(this.serverAddress) < 0) {
				this.knownServers.push(this.serverAddress);
				localStorage.setItem("known-servers", JSON.stringify(this.knownServers));
			}

			SocketService.send({
				type: PackageType.Meta
			});

			this.isConnecting = false;
		},
		onClose(event) {
			SocketService.$off("open");
			SocketService.$off("close");
			SocketService.$off("package");
			
			this.socket = null;
			this.$router.replace("/login");
		},
		onPackage(packageObj) {
			console.debug(Object.keys(PackageType).find(t => PackageType[t] === packageObj.type));
			console.debug(packageObj.content);

			switch (packageObj.type) {
				case PackageType.MetaResponse:
					Object.assign(this.serverMetadata, {
						guestsAllowed: packageObj.content.guestsAllowed,
						registrationAllowed: packageObj.content.registrationAllowed
					});

					this.$store.commit("setServerName", packageObj.content.name);
					break;
				case PackageType.LoginResponse:
					this.isWorking = false;

					switch (packageObj.content.status) {
						case 0:
							this.$store.commit("setCurrentAccount", packageObj.content.account);

							if (packageObj.content.account) {
								if (packageObj.content.account.attributes["neo.client.accent"]) {
									document.body.setAttribute("data-accent", packageObj.content.account.attributes["neo.client.accent"]);
								}
								if (packageObj.content.account.attributes["neo.client.theme"]) {
									document.body.setAttribute("data-theme", packageObj.content.account.attributes["neo.client.theme"]);
								}
							}

							this.$store.commit("setIdentity", packageObj.content.identity);
							this.$router.replace("/");
							break;
						case 1:
						case 2:
						case 3:
							new metroUI.ContentDialog({
								title: "Anmeldefehler",
								content: (() => {
								return (
									<div>
										{(() => {
											switch (packageObj.content.status) {
												case 1:
													return <p>Der angegebene Benutzer existiert nicht.</p>;
												case 2:
													return <p>Das Passwort ist falsch.</p>;
												case 3:
													return <p>Du bist nicht berechtigt dich anzumelden.</p>;
												default: return null
											}
										})()}
									</div>
								)
								})(),
								commands: [{ text: "Ok" }]
							}).show();
							break;
						case 4:
						case 5:
							new metroUI.ContentDialog({
								title: "Anmeldefehler",
								content: (() => {
								return (
									<div>
										{(() => {
											switch (packageObj.content.status) {
												case 4:
													return <p>Die angegebene Benutzer-ID wird bereits verwendet.</p>;
												case 5:
													return <p>Der angegebene Benutzername wird bereits verwendet.</p>;
												default: return null
											}
										})()}
									</div>
								)
								})(),
								commands: [{ text: "Ok" }]
							}).show();
							break;
						default: break;
					}
					break;
				default: break;
			}
		},

		connect() {
			this.isConnecting = true;
			SocketService.connect(`ws://${this.serverAddress}:42420/neo`);
		},

		login() {
			this.isWorking = true;
			SocketService.send({
				type: PackageType.MemberLogin,
				content: {
					user: this.user.username,
					password: CryptoJS.enc.Base64.stringify(CryptoJS.SHA512(this.user.password))
				}
			});
		},
		async register() {
			var registerDialog = new metroUI.ContentDialog({
				title: "Registrieren",
				content: (() => {
				return (
					<div>
						<input type="text" placeholder="Benutzername" data-required="true" />
						<input type="text" placeholder="Benutzer-ID" data-minlength="3" />
						<input type="email" placeholder="E-Mail-Adresse" data-minlength="6" />
						<input type="password" placeholder="Passwort (min. 8 Zeichen)" data-minlength="8" />
						<input type="password" placeholder="Passwort bestätigen" data-minlength="8" />
					</div>
				)
			})(),
				commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
			});

			var result = await registerDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
				let texts = registerDialog.text;
				for (var i = 0; i < texts.length; i++) {
					if (!texts[i].length) {
						new metroUI.ContentDialog({
							title: "Fehler", 
							content: "Du musst alle Felder ausfüllen, um dich zu registieren.",
							commands: [{ text: "Ok", primary: true }]
						}).show();
						return;
					}
				}

				if (texts[3].length < 8) {
					new metroUI.ContentDialog({
						title: "Fehler", 
						content: "Das Passwort muss mindestens 8 Zeichen lang sein.",
						commands: [{ text: "Ok", primary: true }]
					}).show();
					return;
				} else if (texts[3].localeCompare(texts[4]) != 0) {
					new metroUI.ContentDialog({
						title: "Fehler", 
						content: "Die angegeben Passwörter stimmen nicht überein.",
						commands: [{ text: "Ok", primary: true }]
					}).show();
					return;
				}

				this.isWorking = true;
				SocketService.send({
					type: PackageType.Register,
					content: {
						name: texts[0],
						id: texts[1],
						email: texts[2],
						password: CryptoJS.enc.Base64.stringify(CryptoJS.SHA512(texts[3]))
					}
				});
			}
		},
		connectAsGuest() {
			this.isWorking = true;
			SocketService.send({
				type: PackageType.GuestLogin,
				content: {
					name: this.user.username
				}
			});
		}
	}
}
</script>