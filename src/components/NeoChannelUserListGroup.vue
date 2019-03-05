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
			//memberIds: []
		}
	},
	mounted() {
		//this.buildUserList();
	},
	updated() {
		// this.buildUserList();

	},
	methods: {
		// buildUserList() {
		// 	this.currentChannel.memberIds.forEach(memberId => {
		// 		if (this.group.memberIds.includes(memberId)) {
		// 			this.memberIds.push(memberId);
		// 		}
		// 	});
		// }
	},
	computed: {
		currentChannel() {
			return this.$store.state.currentChannel;
        },
        memberIds() {
            let ids = [];
            
            this.currentChannel.memberIds.forEach(memberId => {
				if (this.group.memberIds.includes(memberId)) {
					ids.push(memberId);
				}
            });
            
            return ids;
        },
		userList() {
			return this.$store.state.userList;
		}
	}
}
</script>
