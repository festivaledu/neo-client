<template>
	<div class="views">
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="navigation-view">
					<metro-navigation-view title="This is header text" :history="false" ref="navView">
						<template slot="navigation-items">
							<metro-navigation-view-menu-item page="test1" icon="play">Menu Item 1</metro-navigation-view-menu-item>

							<div class="navigation-view-item-separator">
								<p>Actions</p>
							</div>

							<metro-navigation-view-menu-item page="test2" icon="save">Menu Item 2</metro-navigation-view-menu-item>
							<metro-navigation-view-menu-item page="test3" icon="refresh">Menu Item 3</metro-navigation-view-menu-item>
						</template>
						<template slot="pages">
							<div class="page" data-page-id="test1" data-page-title="Example page 1">
								<p>Example page 1</p>
							</div>
							<div class="page" data-page-id="test2" data-page-title="Example page 2">
								<p>Example page 2</p>
							</div>
							<div class="page" data-page-id="test3" data-page-title="Example page 3">
								<p>Example page 3</p>
							</div>
						</template>
					</metro-navigation-view>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "NavigationView",
	mounted() {
		this.$refs["navView"].navigate("test1")
	}
}
</script>