<template>
	<div class="views">
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="navigation-view">
					<metro-navigation-view title="This is header text" :history="false" ref="navView">
						<template slot="navigation-items">
							<div class="navigation-view-item" data-page="test1">
								<div class="navigation-view-item-inner">
									<div class="navigation-view-item-icon"><i class="icon play"></i></div>
									<p class="navigation-view-item-content">Menu Item 1</p>
								</div>
							</div>

							<div class="navigation-view-item-separator">
								<p>Actions</p>
							</div>

							<div class="navigation-view-item" data-page="test2">
								<div class="navigation-view-item-inner">
									<div class="navigation-view-item-icon"><i class="icon save"></i></div>
									<p class="navigation-view-item-content">Menu Item 2</p>
								</div>
							</div>
							<div class="navigation-view-item" data-page="test3">
								<div class="navigation-view-item-inner">
									<div class="navigation-view-item-icon"><i class="icon refresh"></i></div>
									<p class="navigation-view-item-content">Menu Item 3</p>
								</div>
							</div>
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