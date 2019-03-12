<template>
	<div class="list-view-item double-line" :class="{ 'user-offline': isOffline }" v-if="user">
		<div class="list-view-item-icon">
			<metro-person-picture :display-name="user.identity.avatarFileExtension ? null : user.identity.name" :profile-picture="user.identity.avatarFileExtension ? `http://${serverAddress}:43430/${user.internalId}${user.identity.avatarFileExtension}?${new Date(user.attributes['neo.avatar.updated']).getTime()}` : null" />
		</div>
		<p class="list-view-item-content">
			<span class="text-label">{{ user.identity.name }}</span>
			<span class="detail-text-label">@{{ user.identity.id }}</span>
		</p>
	</div>
</template>

<style lang="less">
.list-view-item.user-offline {
    opacity: .5;
}

.list-view-item .person-picture p.initials {
	line-height: 15px !important;
	font-size: 24px !important;
	padding: 16px 0 !important;
}
</style>


<script>
export default {
	name: "NeoChannelUserListItem",
	props: ["memberId"],
	computed: {
        isOffline() {
            return !this.$store.state.userList.find(_ => _.internalId === this.memberId);
        },
		serverAddress() {
			return this.$store.state.serverAddress;
		},
		user() {
            let response = this.$store.state.userList.find(_ => _.internalId === this.memberId);

            if (!response) {
                response = this.$store.state.accountList.find(_ => _.internalId === this.memberId);
            }

            return response;
		},
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
