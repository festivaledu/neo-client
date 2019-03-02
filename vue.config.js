module.exports = {
	baseUrl:process.env.NODE_ENV === 'production' ? './' : '/',
	css: {
		loaderOptions: {
			less: {
				javascriptEnabled: true
			}
		}
	}
}