<template>
	<div v-if="memberIds.length && userList.length">
		<div class="list-view-item-separator" v-if="group">
			<p>{{group.name}}</p>
		</div>
		
		<NeoChannelUserListItem v-for="(memberId, index) in memberIds" :key="index" :memberId="memberId" />
	</div>
</template>

<script>
import NeoChannelUserListItem from "@/components/NeoChannelUserListItem.vue"
export default {
	name: "NeoChannelUserListGroup",
	props: ["group"],
	components: {
		NeoChannelUserListItem
	},
	data() {
		return {
			memberIds: []
		}
	},
	mounted() {
		this.buildUserList();
	},
	updated() {
		// this.buildUserList();

	},
	methods: {
		buildUserList() {
			this.currentChannel.memberIds.forEach(memberId => {
				if (this.group.memberIds.indexOf(memberId) >= 0) {
					this.memberIds.push(memberId);
				}
			});
		}
	},
	computed: {
		currentChannel() {
			return this.$store.state.currentChannel;
		},
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
