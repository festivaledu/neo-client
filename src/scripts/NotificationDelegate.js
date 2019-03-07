import Vue from "vue";

export const NotificationDelegate = new Vue({
	data: {
		iv: [],
		key: [],
		rsaE: "",
		rsaM: "",
		socket: null,
	},
	created() {
		Notification.requestPermission(permission => {
			console.log(permission);
		});
	},
	methods: {
		sendNotification(params) {
			if (document.hasFocus()) {
				
				let notification = new metroUI.Notification(params);
				notification.show();
				
				return notification;
			} else {
				return new Notification(params.title, {
					body: params.content
				});
			}
		}
	},
})