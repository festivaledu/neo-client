import Vue from "vue";

export const NotificationDelegate = new Vue({
	created() {
		Notification.requestPermission();
	},
	methods: {
		sendNotification(params) {
			if (document.hasFocus() || Notification.permission != "granted") {
				
				let notification = new metroUI.Notification(params);
				notification.show();
				
				return notification;
			} else {
				let notification = new Notification(params.title, {
					body: params.content
				});
				
				notification.onclick = () => {
					params.dismissAction(params.payload);
				};
				
				return notification
			}
		}
	},
})