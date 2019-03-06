<template>
	<div class="list-view-item double-line" v-if="user">
		<div class="list-view-item-icon">
			<metro-person-picture :displayName="user.identity.name" />
		</div>
		<p class="list-view-item-content">
			<span class="text-label">{{user.identity.name}}</span>
			<span class="detail-text-label">@{{user.identity.id}}</span>
		</p>
	</div>
</template>

<style lang="less">
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
	data() {
		return {
			user: null
		}
	},
	mounted() {
		this.user = this.userList.find(_ => _.internalId === this.memberId);
		//console.log(this.user);
	},
	updated() {

	},
	computed: {
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
