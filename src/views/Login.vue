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
							<label>Benutzername oder E-Mail-Adresse</label>
							<input type="text" placeholder="Max Mustermann" v-model="user.username" :disabled="!socket" @input="$v.user.username.$touch()" @keyup.13="login">
						</div>
						<div class="form-group">
							<label for="login-password">Passwort</label>
							<input type="password" placeholder="Benötigt" v-model="user.password" :disabled="!socket" @input="$v.user.password.$touch()" @keyup.13="login">
						</div>
					</form>
					
					<div class="row mt-3 d-none d-md-flex">
						<div class="col col-6 text-left">
							<button class="btn btn-primary d-inline-block" @click="login()" :disabled="$v.user.$invalid || isWorking">Anmelden</button>
						</div>
						
						<div class="col col-6 text-right">
							<button class="btn btn-primary d-inline-block" @click="connectAsGuest()" :disabled="$v.user.username.$invalid || isWorking || !guestsAllowed">Als Gast anmelden</button>
						</div>
						
						<div class="col text-right" v-show="!isWorking">
							<router-link class="d-inline-block mt-2 p-0" to="/register" :disabled="!socket || registrationAllowed">Noch kein Account?</router-link>
						</div>
						<div class="col text-right" v-show="isWorking">
							<div class="loading-indicator" />
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
            guestsAllowed: false,
            registrationAllowed: false
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
		onClose() {
			this.socket = null;
			this.$router.replace("/");
		},
		onPackage(packageObj) {
            console.debug(Object.keys(PackageType).find(t => PackageType[t] === packageObj.type));
            console.debug(packageObj.content);

			switch (packageObj.type) {
                case PackageType.MetaResponse:
                    this.guestsAllowed = packageObj.content.guestsAllowed;
                    this.registrationAllowed = packageObj.content.registrationAllowed;

                    this.$store.commit("setServerName", packageObj.content.name);
                    break;
				case PackageType.LoginResponse:
                    this.isWorking = false;
                    
					if (packageObj.content.status == 0) {                        
						// Login successful
						this.$store.commit("setIdentity", packageObj.content.identity);
						this.$router.replace("/");
					} else if (packageObj.content.status == 1) {
                        // Unknown user
                        var unknowUserDialog = new metroUI.ContentDialog("Anmeldefehler", (() => {
                            return (
                                <div>
                                    <p>Der angegebene Benutzer existiert nicht.</p>
                                </div>
                            );
                        })(), [{ text: "Ok" }]);
                        
                        unknowUserDialog.show();
                    } else if (packageObj.content.status == 2) {
                        // Incorrect password
                        var incorrectPasswordDialog = new metroUI.ContentDialog("Anmeldefehler", (() => {
                            return (
                                <div>
                                    <p>Das Passwort ist falsch.</p>
                                </div>
                            );
                        })(), [{ text: "Ok" }]);
                        
                        incorrectPasswordDialog.show();
                    } else if (packageObj.content.status == 3) {
                        // Unauthorized
                        var unauthorizedDialog = new metroUI.ContentDialog("Anmeldefehler", (() => {
                            return (
                                <div>
                                    <p>Du bist nicht berechtigt dich anzumelden.</p>
                                </div>
                            );
                        })(), [{ text: "Ok" }]);
                        
                        unauthorizedDialog.show();
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