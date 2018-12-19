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

            this.$store.state.socket.addEventListener("open", (ws, ev) => {
                this.$store.state.socket.send("4D303DA2-6A01-483E-89DF-BA01E919FF99");
                this.$store.state.socket.addEventListener("message", (ws, ev) => {
                    if (!this.$store.state.officialServer && ev.data !== "7FDB1C16-F94A-4A6C-90C9-47404EC44594") {
                        this.$store.state.socket.close();
                    } else {
                        this.$store.commit("isOfficialServer");
                    }
                });
            });
        },
    }

</script>

<template>

    <div class="home">
        <input v-model="inputMessage" type="text" />
        <button @click="sendMessage()">Absenden</button>
    </div>

</template>
