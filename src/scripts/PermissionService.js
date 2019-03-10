import Vue from "vue";

export const PermissionService = new Vue({
	methods: {
        hasPermission(permission, granted) {
            console.log("Checking permission: " + permission);
            console.debug(granted);

			let permissionLayers = permission.split('.');
            let validPermissions = ["*"];

            let valid = "";
            for (let l = 0; l < permissionLayers.length - 1; l++) {
                let layer = permissionLayers[l];
                valid += `${layer}.`;
                validPermissions.push(`${valid}*`);
            }
            validPermissions.push(permission);

            // Define the default permission if none of the sets contained any of the valid permissions
            let p = "Inherit";

            // Loop through the valid permissions and overwrite p everytime a new value other than Inherit was found.
            // This needs to be done, because explicit permissions are stronger than implicit ones. So neo.server.edit.name counts higher than neo.server.edit.*.
            for (let validPermission of validPermissions) {
                if (!granted[validPermission] || granted[validPermission] == "Inherit") {
                    continue;
                }

                p = granted[validPermission];
            }

            console.log(p);
            return p == "Allow";
		},
	},
})