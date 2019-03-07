<template>
	<div id="app">
		<router-view/>
	</div>
</template>

<style lang="less">
	#app {
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 16px;
		line-height: 1.4;
	}

	* {
		margin: 0;
		padding: 0;

		&, &::after, &::before {
			box-sizing: border-box;
		}
	}
	
	html {
		background: url(/img/neo-background.jpg) no-repeat center center fixed;
		background-size: cover;
	}
	
	.text-left {
		text-align: left;
	}
	.text-center {
		text-align: center;
	}
	.text-right {
		text-align: right;
	}
	
	i.icon {
		pointer-events: none;
	}
	
	.list-view-item > * {
		pointer-events: none;
	}
	
	.content-dialog {
		.content {
			input[type="email"], 
			input[type="number"], 
			input[type="password"], 
			input[type="search"], 
			input[type="tel"], 
			input[type="text"], 
			input[type="url"],
			.list {
				max-width: initial;
			}
		}
	}
</style>