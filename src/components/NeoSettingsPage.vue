<template>
	<div class="page" data-page-id="settings">
		<metro-list-view class="fixed-width" acrylic="acrylic-80" menuTitle="Settings" ref="settingsView">
			<template slot="actions">
				<metro-list-view-action icon="more" @click.native="moreButtonClicked" />
			</template>
			
			<template slot="list-items">
				<metro-list-view-menu-separator title="General" />
				<metro-list-view-menu-item class="single-line" title="Info" page="info" />
				<metro-list-view-menu-item class="single-line" title="Server" page="server_settings" />
				
				<metro-list-view-menu-separator title="Groups" />
				<metro-list-view-menu-item class="single-line" title="%group_name%" page="group_settings" />
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="info" data-page-title="Info">
					<p class="metro-ui-version-string" />
				</div>
				
				<div class="page" data-page-id="server_settings" data-page-title="Server">
					<metro-toggle-switch itemHeader="%setting_name%" />
				</div>
				
				<div class="page" data-page-id="group_settings" data-page-title="%group_name%">
					<h3>Actions</h3>
					<button>Delete Group</button>
					
					<h3>Permissions</h3>
					<div class="row">
						<div class="col col-6"></div>
						<div class="col col-2 text-center">
							<h5>Granted</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Inherited</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Denied</h5>
						</div>
					</div>
					
					<div class="row">
						<div class="col col-6">
							<p class="text-label">Read Messages</p>
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
					
					<h3>Plugin Permissions</h3>
					<div class="row">
						<div class="col col-6"></div>
						<div class="col col-2 text-center">
							<h5>Granted</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Inherited</h5>
						</div>
						<div class="col col-2 text-center">
							<h5>Denied</h5>
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
	
	h3:not(:first-of-type) {
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

export default {
	name: "NeoSettingsPage",
	data() {
		return {
			demoPermission: "inherit",
			demoPermission2: "deny"
		}
	},
	mounted() {
		this.$refs["settingsView"].navigate("info");
	},
	methods: {
		async addGroup() {
			var addGroupDialog = new metroUI.ContentDialog("Add a new Group",
			(() => {
				return (
					<div>
						<p>Enter the name of the new group:</p>
						<input type="text" />
						
						<p>Select a group to inherit from:</p>
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
			[{text: "Create Group", primary: true},{text: "Cancel"}]);
			var result = await addGroupDialog.showAsync();
			
			if (result == 1) {
				console.log(addGroupDialog.text);
			}
		},
		moreButtonClicked(event) {
			var flyout = new metroUI.MenuFlyout(event.target, [
				{
					title: "Add Group",
					icon: "add",
					action: this.addGroup
				}
			]);
			flyout.show();
		}
	}
}
</script>
