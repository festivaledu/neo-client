<script>

    export default {
        name: "home",
        components: { },
        data: function() {
            return {
                inputMessage: "",
            };
        },
        methods: {
            sendMessage: function() {
                this.$store.state.socket.send(this.inputMessage);
            },
        },
        mounted: function() {
            this.$store.commit("connectSocket", "ws://localhost:42421/neo");
        },
    }

</script>

<template>

    <div class="home">
        <input v-model="inputMessage" type="text" />
        <button @click="sendMessage()">Absenden</button>
    </div>

</template>
