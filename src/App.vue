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

	.navigation-view-item > *,
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
	
	.emoji-picker {
		position: absolute;
		bottom: 70px;
		left: 204px;
		width: 280px;
		height: 292px;
		background-color: var(--alt-high);
		box-shadow: 0 0 0 2px var(--system-accent-color);
		padding: 26px 14px 14px;
		z-index: 200;

		&:not(.show) {
			transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
			opacity: 0;
			visibility: hidden;
		}
		
		.emoji-container {
			width: 100%;
			height: 100%;
			display: flex;
			flex-wrap: wrap;
			align-items: flex-start;
			overflow-y: scroll;
			
			.emoji-item {
				position: relative;
				flex-basis: calc(~"100% / 7");
				padding: 6px;
				cursor: pointer;
				
				&:hover:not(:active) {
					background-color: var(--base-low);
				}
				&:active {
					background-color: var(--base-medium-low);
					transform: scale(0.98)
				}
				
				span {
					display: inline-block;
					width: 24px;
					height: 24px;
					font-size: 18px;
					text-align: center;
					pointer-events: none;
				}
			}
		}
		
		&:before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			width: 28px;
			height: 28px;
			background-color: var(--alt-high);
			
			box-shadow: 2px 0 0 0 var(--system-accent-color),
						0 2px 0 0 var(--system-accent-color),
						2px 2px 0 0 var(--system-accent-color);
			transform: translate3d(-50%, 50%, 0) rotate(45deg);
			z-index: -1
		}
	}
</style>