<template>
	<div class="page" data-page-id="settings">
		<metro-list-view class="fixed-width" acrylic="acrylic-80" menuTitle="Einstellungen" ref="settingsView">
			<template slot="actions">
				<metro-list-view-action icon="more" @click.native="moreButtonClicked" />
			</template>

			<template slot="list-items">
				<metro-list-view-menu-separator title="Allgemein" />
				<metro-list-view-menu-item class="single-line" title="Über" page="info" />
				<metro-list-view-menu-item @click.native="openSettings('server')" class="single-line" title="Server-Einstellungen" page="server_settings_general" />

				<metro-list-view-menu-separator title="Gruppen" />

				<template v-for="group in this.sortedGroupList">
					<metro-list-view-menu-item :key="group.internalId + '-item'" class="single-line" :title="group.name" :page="'group_settings-' + group.internalId" />
				</template>

				<!-- <metro-list-view-menu-item class="single-line" title="Testgruppe" page="group_settings" /> -->
			</template>

			<template slot="pages">
				<div class="page" data-page-id="info" data-page-title="Über">
					<p class="metro-ui-version-string" />
				</div>

				<div class="page" data-page-id="server_settings_general" data-page-title="Server-Einstellungen">

					<template v-for="(value, key, index) in settingsModel">
						<div v-if="settingsTitles[key.toLowerCase()]" :key="'setting-' + index">
							<template v-if="typeof(value) == 'boolean'">
								<metro-toggle-switch v-model="settingsModel[key]" :key="index + key" :item-header="settingsTitles[key.toLowerCase()]" :value="value" on-content="An" off-content="Aus" />
							</template>

							<template v-if="typeof(value) == 'string' || typeof(value) == 'number'">
								<p :key="index + key + '-title'">{{ settingsTitles[key.toLowerCase()]}}</p>
								<input type="text" v-model="settingsModel[key]" :key="index + key" />
							</template>
						</div>
					</template>

					<button @click="saveSettings('server', settingsModel)">Einstellungen speichern</button>
				</div>

				<template v-for="group in this.sortedGroupList">
					<div class="page" :key="group.internalId + '-page'" :data-page-id="'group_settings-' + group.internalId" :data-page-title="group.name">
                        <template v-if="group.attributes['neo.grouptype']">
                            <h4 style="margin-top: 0">Gruppentyp</h4>
                            <div style="align-items: center; display: flex">
                                <template v-if="group.attributes['neo.grouptype'] == 'admin'">
                                    <i class="icon party-leader" style="display: inline-block; font-size: 20px; margin: 12px"></i>
                                    <div>
                                        <p class="text-label">Administratoren</p>
                                        <p>Dies ist die Standardgruppe für Administratoren. Du kannst sie bearbeiten, aber nicht entfernen.</p>
                                    </div>
                                </template>
                                <template v-if="group.attributes['neo.grouptype'] == 'user'">
                                    <i class="icon contact" style="display: inline-block; font-size: 20px; margin: 12px"></i>
                                    <div>
                                        <p class="text-label">Benutzer</p>
                                        <p>Dies ist die Standardgruppe für Benutzer. Du kannst sie bearbeiten, aber nicht entfernen.</p>
                                    </div>
                                </template>
                                <template v-if="group.attributes['neo.grouptype'] == 'guest'">
                                    <i class="icon guest-user" style="display: inline-block; font-size: 20px; margin: 12px"></i>
                                    <div>
                                        <p class="text-label">Gäste</p>
                                        <p>Dies ist die Standardgruppe für Gäste. Du kannst sie bearbeiten, aber nicht entfernen.</p>
                                    </div>
                                </template>
                            </div>
                        </template>

                        <h4>Allgemein</h4>
                        <p class="text-label">Gruppen-ID</p>
                        <input type="text" v-model="group.id" />
						
                        <p class="text-label">Name</p>
                        <input type="text" v-model="group.name" />
						
                        <p class="text-label">Wertigkeit</p>
                        <p class="detail-text-label">Die Wertigkeit bestimmt, in welcher Reihenfolge die Gruppen sortiert und die Rechte vererbt werden.<br />Eine Gruppe erbt immer von allen Gruppen mit niedrigerer Wertigkeit.</p>
                        <input type="text" v-model="group.sortValue" />
                        
                        <h4>Mitglieder</h4>
                        <template v-if="userList.length && group.memberIds.length">
                            <div v-for="(memberId, index) in group.memberIds" :key="group.internalId + '-member-' + index">
								<div class="row" style="margin-bottom: 12px; margin-right: 5px" v-if="_userById(memberId)">
									<div class="col col-5">
										<metro-person-picture :displayName="_userById(memberId).identity.name" />
										<p class="text-label">{{ _userById(memberId).identity.name }}</p>
										<p class="detail-text-label">{{ _userById(memberId).identity.id }}</p>
									</div>
								</div>
							</div>
                        </template>

                        <div class="row" style="margin-right: 5px">
                            <div class="col col-5">
                                <h4>Berechtigungen</h4>
                            </div>
                            <div class="col col-2" style="align-items: flex-end; display: flex; justify-content: center">
                                <h5>Erlauben</h5>
                            </div>
                            <div class="col col-2" style="align-items: flex-end; display: flex; justify-content: center">
                                <h5>Übernehmen</h5>
                            </div>
                            <div class="col col-2" style="align-items: flex-end; display: flex; justify-content: center">
                                <h5>Verweigern</h5>
                            </div>
                            <div class="col col-1"></div>
                        </div>

                        <template v-for="(value, key, index) in group.permissions">
                            <div class="row" style="margin-bottom: 12px; margin-right: 5px" :key="key">
                                <div class="col col-5">
                                    <p class="text-label">{{ knownPermissions[key] ? knownPermissions[key] : key }}</p>
                                    <p class="detail-text-label">{{ key }}</p>
                                </div>
                                <div class="col col-2 text-center">
                                    <div class="radio">
                                        <input type="radio" :id="group.internalId + '-permission-' + index + '-allow'" :name="group.internalId + '-permission-' + index" value="Allow" v-model="group.permissions[key]">
                                        <label :for="group.internalId + '-permission-' + index + '-allow'" />
                                    </div>
                                </div>
                                <div class="col col-2 text-center">
                                    <div class="radio">
                                        <input type="radio" :id="group.internalId + '-permission-' + index + '-inherit'" :name="group.internalId + '-permission-' + index" value="Inherit" v-model="group.permissions[key]">
                                        <label :for="group.internalId + '-permission-' + index + '-inherit'" />
                                    </div>
                                </div>
                                <div class="col col-2 text-center">
                                    <div class="radio">
                                        <input type="radio" :id="group.internalId + '-permission-' + index + '-deny'" :name="group.internalId + '-permission-' + index" value="Deny" v-model="group.permissions[key]">
                                        <label :for="group.internalId + '-permission-' + index + '-deny'" />
                                    </div>
                                </div>
                                <div class="col col-1" style="align-items: center; display: flex; justify-content: flex-end">
                                    <button @click="deletePermission(group, key)" style="margin: 0"><i class="icon delete"></i></button>
                                </div>
                            </div>
                        </template>

                        <p class="text-label" style="margin-top: 24px">Neue Berechtigung hinzufügen</p>
                        <p class="detail-text-label">Berechtigungen einer Gruppe, die nicht explizit definiert wurden, werden automatisch von Gruppen mit niedrigerer Wertigkeit übernommen.<br />Wenn keine Gruppe mit niedrigerer Wertigkeit die Berechtigung definiert, gilt sie in diesen Gruppen als verweigert.</p>
                        <metro-auto-suggest v-model="permissionToAdd" placeholder="Berechtigungs-ID" :data="knownPermissionsKeys" /><button @click="addPermission(group)">Hinzufügen</button>
                                                
					    <button @click="saveSettings('group', group)" style="margin-top: 48px">Einstellungen speichern</button>
					</div>
				</template>

				<!-- <div class="page" data-page-id="group_settings" data-page-title="%group_name%">
					<button @click="deleteGroup">Gruppe löschen</button>

					<h3>Berechtigungen</h3>
					<div class="row">
						<div class="col col-6"></div>
						<div class="col col-2 text-center">
							<h5>Gestattet</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Geerbt</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Verweigert</h5>
						</div>
					</div>

					<div class="row">
						<div class="col col-6">
							<p class="text-label">Nachrichten lesen</p>
							<p class="detail-text-label">neo.global.read</p>
						</div>
						<div class="col col-2 text-center">
							<div class="radio">
								<input type="radio" id="demo1_radio1" name="demo1_radio" value="permit" v-model="demoPermission">
								<label for="demo1_radio1" />
							</div>
						</div>
						<div class="col col-2 text-center">
							<div class="radio">
								<input type="radio" id="demo1_radio2" name="demo1_radio" value="inherit" v-model="demoPermission">
								<label for="demo1_radio2" />
							</div>
						</div>
						<div class="col col-2 text-center">
							<div class="radio">
								<input type="radio" id="demo1_radio3" name="demo1_radio" value="deny" v-model="demoPermission">
								<label for="demo1_radio3" />
							</div>
						</div>
					</div>

					<p>{{demoPermission}}</p>

					<h3>Plugin-Berechtigungen</h3>
					<div class="row">
						<div class="col col-6"></div>
						<div class="col col-2 text-center">
							<h5>Gestattet</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Geerbt</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Verweigert</h5>
						</div>
					</div>

					<div class="row">
						<div class="col col-6">
							<p class="text-label">Plugin 1: %permission%</p>
							<p class="detail-text-label">neo.plugin1.permission</p>
						</div>
						<div class="col col-2 text-center">
							<div class="radio">
								<input type="radio" id="demo2_radio1" name="demo2_radio" value="permit" v-model="demoPermission2">
								<label for="demo2_radio1" />
							</div>
						</div>
						<div class="col col-2 text-center">
							<div class="radio">
								<input type="radio" id="demo2_radio2" name="demo2_radio" value="inherit" v-model="demoPermission2">
								<label for="demo2_radio2" />
							</div>
						</div>
						<div class="col col-2 text-center">
							<div class="radio">
								<input type="radio" id="demo2_radio3" name="demo2_radio" value="deny" v-model="demoPermission2">
								<label for="demo2_radio3" />
							</div>
						</div>
					</div>

					<p>{{demoPermission2}}</p>
				</div> -->
			</template>
		</metro-list-view>
	</div>
</template>

<style lang="less">
.page[data-page-id="settings"] {
	.frame-header {
		right: 320px;

		p.title {
			font-size: 32px;
			height: 64px;
		}
	}

	h3:not(:first-child) {
		margin-top: 30px;
	}

	.col .radio {
		margin: 11px 0;

		label {
			padding-left: 20px;
		}
	}

	.text-label {
		font-weight: 600;
	}

	.detail-text-label {
		color: var(--base-medium)
	}
	
	.row .col .person-picture {
		float: left;
		width: 42px;
		height: 42px;
		margin-right: 8px;
		
		&:before {
			width: 42px;
			height: 42px;
		}
		
		.initials {
			font-size: 22px !important;
			padding: 1px 0 !important;
		}
	}
}

.list-view-item.single-line {
	span.text-label {
		font-weight: 400 !important;
	}
}
</style>

<script>
import Vue from "vue";

import { SocketService } from "@/scripts/SocketService";
import PackageType from '@/scripts/PackageType';

export default {
	name: "NeoSettingsPage",
	data() {
		return {
			demoPermission: "inherit",
            demoPermission2: "deny",
            permissionToAdd: "",
			settingsModel: {},
			settingsTitles: {}
		}
	},
	mounted() {
		this.$refs["settingsView"].navigate("info");

		SocketService.$on("package", this.onPackage);
	},
	methods: {
		_userById(userId) {
			return this.userList.find(_ => _.internalId === userId);
		},
		
		async addGroup() {
			var addGroupDialog = new metroUI.ContentDialog({
				title: "Gruppe hinzufügen",
				content: (() => {
					return (
						<div>
							<input type="text" data-required="true" placeholder="Name der Gruppe (z.B. Mitarbeiter)"/>

							<p>Wähle die Gruppe, von der die neue Gruppe erben soll:</p>
							<metro-combo-box>
								<select>
									{this.sortedGroupList.reverse().map(group => {
										return (
											<option value={group.internalId}>{group.name}</option>
										)
									})}
								</select>
							</metro-combo-box>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Gruppe erstellen", primary: true }]
			});
			
			var result = await addGroupDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
				console.log(addGroupDialog.text);
			}
        },
        addPermission(group) {
            let index = this.sortedGroupList.indexOf(group);

            this.$set(group.permissions, this.permissionToAdd, "Inherit");
            this.$set(this.sortedGroupList, index, group);

            this.permissionToAdd = "";
        },
        deletePermission(group, permission) {
            let index = this.sortedGroupList.indexOf(group);

            this.$delete(group.permissions, permission);
            this.$set(this.sortedGroupList, index, group);
        },
		moreButtonClicked(event) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Gruppe hinzufügen",
					icon: "add",
					action: this.addGroup
				}
			]);
			flyout.show();
        },
        onPackage(packageObj) {            
			switch (packageObj.type) {
				case PackageType.OpenSettingsResponse:
					this.settingsModel = packageObj.content.model;
					this.settingsTitles = packageObj.content.titles;
					break;
				case PackageType.EditSettingsResponse:
					new metroUI.Notification({
						payload: {},
						title: "Einstellungen",
						icon: "settings",
						content: "Die Einstellungen wurden gespeichert",
						inputs: "",
						buttons: [],
                    }).show();
                    break;
				default: break;
			}
		},
		openSettings(settings) {
			SocketService.send({
				type: PackageType.OpenSettings,
				content: settings
			});
		},
		saveSettings(settings, model) {
			SocketService.send({
				type: PackageType.EditSettings,
				content: {
					scope: settings,
					model: model
				}
			});
		},
		async deleteGroup() {
			var deleteGroupDialog = new metroUI.ContentDialog({
				title: "Gruppe löschen",
				content: (() => {
					return (
						<div>
							<p>Bist du sicher, dass du diese Gruppe löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
							<br />
							<p>Benutzer in dieser Gruppe werden in die voherige Gruppe verschoben.</p>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Löschen", primary: true }]
			});

			var result = await deleteGroupDialog.showAsync();
		}
	},
	computed: {
        knownPermissions() {
            return this.$store.state.knownPermissions;
        },
        knownPermissionsKeys() {
            return Object.keys(this.knownPermissions);
        },
		sortedGroupList() {
			return this.$store.state.groupList.slice(0).sort((a, b) => b.sortValue - a.sortValue);
		},
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
