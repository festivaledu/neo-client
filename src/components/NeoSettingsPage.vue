<template>
	<div class="page" data-page-id="settings">
		<metro-list-view class="fixed-width" acrylic="acrylic-80" menuTitle="Einstellungen" ref="settingsView">
			<template slot="actions">
				<metro-list-view-action icon="more" @click.native="moreButtonClicked" />
			</template>
			
			<template slot="list-items">
				<metro-list-view-menu-separator title="Allgemein" />
				<metro-list-view-menu-item class="single-line" title="Über" page="info" />
				<metro-list-view-menu-item @click.native="openSettings('server')" class="single-line" title="Server-Einstellungen" page="server_settings" />
				
				<metro-list-view-menu-separator title="Gruppen" />
                
                <template v-for="group in this.sortedGroupList">
				    <metro-list-view-menu-item :key="group.internalId + '-item'" class="single-line" :title="group.name" :page="'group_settings-' + group.internalId" />
                </template>
				
                <metro-list-view-menu-item class="single-line" title="Testgruppe" page="group_settings" />
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="info" data-page-title="Über">
					<p class="metro-ui-version-string" />
				</div>
				
				<div class="page" data-page-id="server_settings" data-page-title="Server-Einstellungen">
                    
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
					
                    <button @click="saveSettings('server')">Einstellungen speichern</button>
				</div>

                <template v-for="group in this.sortedGroupList">
                    <div class="page" :key="group.internalId + '-page'" :data-page-id="'group_settings-' + group.internalId" :data-page-title="group.name">
                        {{ group }}
                    </div>
                </template>
				
				<div class="page" data-page-id="group_settings" data-page-title="%group_name%">
					<!-- Insert label to show which group this group inherits from -->
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
				</div>
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
            settingsModel: {},
            settingsTitles: {}
		}
	},
	mounted() {
        this.$refs["settingsView"].navigate("info");        
        
		SocketService.$on("package", this.onPackage);
	},
	methods: {
		async addGroup() {
			var addGroupDialog = new metroUI.ContentDialog("Neue Gruppe erstellen",
			(() => {
				return (
					<div>
						<input type="text" placeholder="Name der neuen Gruppe"/>
						
						<p>Wähle die Gruppe, von der die neue Gruppe erben soll:</p>
						<metro-combo-box>
							<select>
								{[{id:"id",name:"%group_name%"}].map(item => {
									return (
										<option value={item.id}>{item.name}</option>
									)
								})}
							</select>
						</metro-combo-box>
					</div>
				)
			})(),
			[
				{
					text: "Abbrechen"
				},
				{
					text: "Gruppe erstellen",
					primary: true
				}
			]);
			var result = await addGroupDialog.showAsync();
			
			if (result == metroUI.ContentDialogResult.Primary) {
				console.log(addGroupDialog.text);
			}
		},
		moreButtonClicked(event) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Neue Gruppe",
					icon: "add",
					action: this.addGroup
				}
			]);
			flyout.show();
        },
        onPackage(packageObj) {
            console.debug(Object.keys(PackageType).find(t => PackageType[t] === packageObj.type));
            console.debug(packageObj.content);
            
			switch (packageObj.type) {
                case PackageType.OpenSettingsResponse:
                    this.settingsModel = packageObj.content.model;
                    this.settingsTitles = packageObj.content.titles;
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
		saveSettings(settings) {
            SocketService.send({
                type: PackageType.EditSettings,
                content: {
                    scope: settings,
                    model: this.settingsModel
                }
            });

			new metroUI.ContentDialog("Einstellungen", "Die Einstellungen wurden gespeichert.", [
				{
					text: "Ok",
					primary: true
				}
			]).show();
		},
		async deleteGroup() {
			var deleteGroupDialog = new metroUI.ContentDialog("Gruppe löschen", 
			(() => {
				return (
					<div>
						<p>Bist du sicher, dass du diese Gruppe löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
						<br />
						<p>Benutzer in dieser Gruppe werden in die voherige Gruppe verschoben.</p>
					</div>
				)
			})(), 
			[
				{
					text: "Abbrechen"
				},
				{
					text: "Löschen",
					primary: true
				}
			]);
			
			var result = await deleteGroupDialog.showAsync();
		}
    },
    computed: {
        sortedGroupList() {
            return this.$store.state.groupList.slice(0).sort((a, b) => b.sortValue - a.sortValue);
        }
    }
}
</script>
