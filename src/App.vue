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
		// background: url(https://images.pexels.com/photos/443446/pexels-photo-443446.jpeg?cs=srgb&dl=baume-berge-draussen-443446.jpg&fm=jpg) no-repeat center center fixed;
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
</style>