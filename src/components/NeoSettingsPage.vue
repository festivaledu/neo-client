<template>
	<div class="page" data-page-id="settings">
		<metro-list-view class="fixed-width" acrylic="acrylic-80" menuTitle="Einstellungen" ref="settingsView">
			<template slot="actions">
				<metro-list-view-action icon="more" @click.native="moreButtonClicked" />
			</template>

			<template slot="list-items">
				<metro-list-view-menu-separator title="Server" />
				<metro-list-view-menu-item @click.native="openSettings('server')" class="single-line" title="Allgemein" page="server_settings_general" />
				<metro-list-view-menu-item class="single-line" title="Gebannte Benutzer" page="server_settings_bans" />

				<metro-list-view-menu-item class="single-line" title="Über" page="info" />

				<metro-list-view-menu-separator title="Gruppen" />
				<template v-for="group in this.sortedGroupList">
					<metro-list-view-menu-item :key="group.internalId + '-item'" class="single-line" :title="group.name" :page="'group_settings-' + group.internalId" />
				</template>
			</template>

			<template slot="pages">
				<div class="page" data-page-id="info" data-page-title="Über">
					<p class="metro-ui-version-string" />
				</div>

				<div class="page" data-page-id="server_settings_general" data-page-title="Allgemein">

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

				<div class="page" data-page-id="server_settings_bans" data-page-title="Gebannte Benutzer">
                    <!-- <h4>Aktive Banns</h4> -->
                    <p v-if="!bannedAccountList.length">Es sind derzeit keine Benutzer gebannt.</p>
                    <template v-else>
                        <div v-for="(banned, index) in bannedAccountList" :key="banned.internalId + '-banned-' + index">
                            <div class="row" style="margin-bottom: 12px; margin-right: 5px">
                                <div class="col col-4">
                                    <metro-person-picture :displayName="_userById(banned.internalId).identity.avatarFileExtension ? null : _userById(banned.internalId).identity.name" :profile-picture="_userById(banned.internalId).identity.avatarFileExtension ? `http://${serverAddress}:43430/${banned.internalId}${_userById(banned.internalId).identity.avatarFileExtension}` : null" />
                                    <p class="text-label">{{ _userById(banned.internalId).identity.name }}</p>
                                    <p class="detail-text-label">@{{ _userById(banned.internalId).identity.id }}</p>
                                </div>
                                <div class="col col-1" style="align-items: center; display: flex; justify-content: flex-end">
                                    <button @click="deleteBan(banned.internalId)" style="margin: 0"><i class="icon delete"></i></button>
                                </div>
                            </div>
                        </div>
                    </template>
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
                        <template v-else>                            
					        <button @click="deleteGroup(group)">Gruppe löschen</button>
                        </template>

						<h4>Allgemein</h4>
						<p class="text-label">Name</p>
						<input type="text" v-model="group.name" />
						
						<p class="text-label">Gruppen-ID</p>
						<input type="text" v-model="group.id" />
						
						<p class="text-label">Wertigkeit</p>
						<p class="detail-text-label">Die Wertigkeit bestimmt, in welcher Reihenfolge die Gruppen sortiert und die Rechte vererbt werden.<br />Eine Gruppe erbt immer von allen Gruppen mit niedrigerer Wertigkeit.</p>
						<input type="text" v-model="group.sortValue" />
						
                        <template v-if="!group.attributes['neo.grouptype'] || group.attributes['neo.grouptype'] != 'guest'">
                            <h4>Mitglieder</h4>
                            <p class="detail-text-label" v-if="!group.memberIds.length">Diese Gruppe enthält derzeit keine Mitglieder.</p>
                            <template v-if="accountList.length && group.memberIds.length">
                                <div v-for="(memberId, index) in group.memberIds" :key="group.internalId + '-member-' + index">
                                    <div class="row" style="margin-bottom: 12px; margin-right: 5px" v-if="_userById(memberId)">
                                        <div class="col col-4">
                                            <metro-person-picture :displayName="_userById(memberId).identity.avatarFileExtension ? null : _userById(memberId).identity.name" :profile-picture="_userById(memberId).identity.avatarFileExtension ? `http://${serverAddress}:43430/${memberId}${_userById(memberId).identity.avatarFileExtension}` : null" />
                                            <p class="text-label">{{ _userById(memberId).identity.name }}</p>
                                            <p class="detail-text-label">@{{ _userById(memberId).identity.id }}</p>
                                        </div>
                                        <div class="col col-1" style="align-items: center; display: flex; justify-content: flex-end">
                                            <button @click="deleteMember(group, memberId)" style="margin: 0"><i class="icon delete"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <button @click="addMember(group)" style="margin-top: 6px" :disabled="group.memberIds.length >= accountList.length - 1">Mitglied hinzufügen</button>
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
		this.$refs["settingsView"].navigate("server_settings_general");

		SocketService.$on("package", this.onPackage);
	},
	methods: {
		_userById(userId) {
			return this.accountList.find(_ => _.internalId === userId);
		},
		
		async addGroup() {
			var addGroupDialog = new metroUI.ContentDialog({
				title: "Gruppe hinzufügen",
				content: (() => {
					return (
						<div>
							<input type="text" data-required="true" placeholder="Gruppen-Name (z.B. Mitarbeiter)"/>
							<input type="text" data-minlength="3" placeholder="Gruppen-ID (z.B. employees)"/>

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
                SocketService.send({
                    type: PackageType.CreateGroup,
                    content: {
                        name: addGroupDialog.text[0],
                        id: addGroupDialog.text[1],
                        sortValue: this.sortedGroupList.find(g => g.internalId == addGroupDialog.text[2]).sortValue + 1
                    }
                });
			}
        },
        async addMember(group) {
			var addMemberDialog = new metroUI.ContentDialog({
				title: "Mitglied hinzufügen",
				content: (() => {
					return (
						<div>
							<p>Wählen den Benutzer, den du der Gruppe hinzufügen möchtest:</p>
							<metro-combo-box>
								<select>
									{this.accountList.filter(a => !group.memberIds.includes(a.internalId) && (!a.attributes["neo.usertype"] || a.attributes["neo.usertype"] != "root")).map(a => {
										return (
											<option value={a.internalId}>{a.identity.name} (@{a.identity.id})</option>
										)
									})}
								</select>
							</metro-combo-box>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Mitglied hinzufügen", primary: true }]
			});
			
			var result = await addMemberDialog.showAsync();

			if (result == metroUI.ContentDialogResult.Primary) {
			    let index = this.sortedGroupList.indexOf(group);
                this.$set(group.memberIds, group.memberIds.length, addMemberDialog.text);
			    this.$set(this.sortedGroupList, index, group);
			}
		},
		addPermission(group) {
			let index = this.sortedGroupList.indexOf(group);

			this.$set(group.permissions, this.permissionToAdd, "Inherit");
			this.$set(this.sortedGroupList, index, group);

			this.permissionToAdd = "";
        },
        deleteMember(group, memberId) {
            let index = this.sortedGroupList.indexOf(group);

			this.$delete(group.memberIds, group.memberIds.indexOf(memberId));
			this.$set(this.sortedGroupList, index, group);
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
                case PackageType.CreateGroupResponse:
                    if (packageObj.content === "Success") {
                        new metroUI.Notification({
                            payload: {},
                            title: "Einstellungen",
                            icon: "settings",
                            content: "Die Gruppe wurde erfolgreich erstellt",
                            inputs: "",
                            buttons: [],
                        }).show();
                    } else {
                        new metroUI.ContentDialog({
                            title: "Gruppe konnte nicht erstellt werden",
                            content: (() => {
                            return (
                                <div>
                                    {(() => {
                                        switch (packageObj.content) {
                                            case "NotAllowed":
                                                return <p>Du bist nicht berechtigt Gruppen zu erstellen.</p>;
                                            case "IdInUse":
                                                return <p>Eine Gruppe mit dieser ID existiert bereits.</p>;
                                            default: return null
                                        }
                                    })()}
                                </div>
                            )
                            })(),
                            commands: [{ text: "Ok" }]
                        }).show();
                    }
                    break;
                case PackageType.DeleteGroupResponse:
                    if (packageObj.content === "Success") {
                        new metroUI.Notification({
                            payload: {},
                            title: "Einstellungen",
                            icon: "delete",
                            content: "Die Gruppe wurde erfolgreich gelöscht",
                            inputs: "",
                            buttons: [],
                        }).show();
		                this.$refs["settingsView"].navigate("info");
                    } else {
                        new metroUI.ContentDialog({
                            title: "Gruppe konnte nicht gelöscht werden",
                            content: (() => {
                            return (
                                <div>
                                    {(() => {
                                        switch (packageObj.content) {
                                            case "NotAllowed":
                                                return <p>Du bist nicht berechtigt diese Gruppe zu löschen.</p>;
                                            case "NotFound":
                                                return <p>Eine Gruppe mit dieser ID existiert nicht.</p>;
                                            default: return null
                                        }
                                    })()}
                                </div>
                            )
                            })(),
                            commands: [{ text: "Ok" }]
                        }).show();
                    }
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
		async deleteGroup(group) {
			var deleteGroupDialog = new metroUI.ContentDialog({
				title: "Gruppe löschen",
				content: (() => {
					return (
						<div>
							<p>Bist du sicher, dass du diese Gruppe löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
							<br />
							<p>Mitglieder, die dann in keiner Gruppe mehr Mitglied sind, werden automatisch der Standardgruppe für Benutzer hinzugefügt.</p>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Löschen", primary: true }]
			});

            var result = await deleteGroupDialog.showAsync();
            
            if (result == metroUI.ContentDialogResult.Primary) {
                SocketService.send({
                    type: PackageType.DeleteGroup,
                    content: group.internalId
                });
            }
        },
        async deleteBan(bannedId) {
			let deleteBanDialog = new metroUI.ContentDialog({
				title: "Bann aufheben",
				content: (() => {
					return (
						<div>
							<p>Bist du dir sicher, dass du diesen Bann aufheben möchtest?</p>
							<br />
							<p>Der Benutzer kann dann wieder den Server betreten.</p>
						</div>
					)
				})(),
				commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
			});
			
			switch (await deleteBanDialog.showAsync()) {
				case metroUI.ContentDialogResult.Primary:
					SocketService.send({
					    type: PackageType.DeletePunishment,
					    content: bannedId
					});
					break;
				default: break;
			}
        }
	},
	computed: {
        accountList() {
            return this.$store.state.accountList;
        },
        bannedAccountList() {
            return this.$store.state.accountList.filter(a => a.attributes["neo.banned"]);
        },
		knownPermissions() {
			return this.$store.state.knownPermissions;
		},
		knownPermissionsKeys() {
			return Object.keys(this.knownPermissions);
        },
        serverAddress() {
            return this.$store.state.serverAddress;
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
