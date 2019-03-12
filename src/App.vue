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
	
	.messages-container .messages-wrapper .message .message-text {
		word-break: normal;
	}
	
	/* Electron Additions */
	html.electron {
		background-image: none;
		background-color: var(--alt-high);
		
		::-webkit-scrollbar { 
			display: none; 
		}
		
		.acrylic {
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}
	
		body[data-theme="light"] {
			.acrylic:not(.notification) {
				&.acrylic-80 {
					background-color: darken(#FFF, 5%) !important;
				}
				&.acrylic-70 {
					background-color: darken(#FFF, 10%) !important;
				}
				&.acrylic-60 {
					background-color: darken(#FFF, 15%) !important;
				}
			}
		}
		
		body[data-theme="dark"] {
			.acrylic:not(.notification) {
				&.acrylic-80 {
					background-color: lighten(#000, 5%) !important;
				}
				&.acrylic-70 {
					background-color: lighten(#000, 10%) !important;
				}
				&.acrylic-60 {
					background-color: lighten(#000, 15%) !important;
				}
			}
		}
		
		.notification-center .notification {
			background-color: var(--system-accent-color-dark-1) !important;
		}
		
		button {
			outline: none;
		}
	}
</style>

<script>
export default {
	name: "neo",
	created() {
		if (window && window.process && window.process.type) {
			document.documentElement.classList.add("electron")
		}
	}
}
</script>
