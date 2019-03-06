<template>
	<div class="views">
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="controls">
					<h4>ToggleSwitch</h4>
					<metro-toggle-switch v-model="switchValue" ref="test"/>
					<p>model["switchValue"] = {{ switchValue }}</p>
					
					<h4>Slider</h4>
					<metro-slider v-model="sliderValue" />
					<p>model["sliderValue"] = {{ sliderValue }}</p>
					
					<h4>Progress Bar</h4>
					<metro-progress-bar v-model="sliderValue" />
					
					<h4>ComboBox</h4>
					<metro-combo-box v-model="listValue">
						<select v-model="listValue">
							<option value="blue">Blue</option>
							<option value="green" disabled>Green</option>
							<option value="red">Red</option>
							<option value="yellow">Yellow</option>
						</select>
					</metro-combo-box>
					<p>model["listValue"] = {{ listValue }}</p>
					
					<h4>AutoSuggest</h4>
					<metro-auto-suggest v-model="autoSuggestValue" placeholder="Enter Text" @textChanged="AutoSuggest_TextChanged" />
					<p>model["autoSuggestValue"] = {{ autoSuggestValue }}</p>
					
					<!--<metro-command-bar>
						<template slot="buttons">
							<metro-app-bar-button icon="add" :disabled="true">Add</metro-app-bar-button>
							<metro-app-bar-button icon="reshare">Share</metro-app-bar-button>
							<metro-app-bar-button icon="edit">Edit</metro-app-bar-button>
						</template>
					</metro-command-bar>-->
					
					<h4>PersonPicture</h4>
					<metro-person-picture profilePicture="https://docs.microsoft.com/en-us/windows/uwp/contacts-and-calendar/images/shoulder-tap-static-payload.png" />
					
					<h4>Accent Colors</h4>
					<metro-accent-color-selector @accentSelect="AccentColor_Selected" />
					<p>This is <span class="accent-color">colored text</span>.</p>
				</div>
				<div class="page" data-page-id="example">
					<h4>Example</h4>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "controls",
	data() {
		return {
			switchValue: false,
			sliderValue: 50,
			listValue: "green",
			autoSuggestValue: "",
		}
	},
	mounted() {
	},
	methods: {
		AutoSuggest_TextChanged(e) {
			e.sender.setDataSource(e.sender._data._value ? [`${e.sender._data._value}${Math.floor(Math.random() * 1E7) + 1}`, `${e.sender._data._value}${Math.floor(Math.random() * 1E7) + 1}`] : []);
		},
		AccentColor_Selected(e) {
			console.log(e)
		}
	}
}
</script>