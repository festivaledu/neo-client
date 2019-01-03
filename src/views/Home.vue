<script>
    import { SocketService } from "@/socketservice";

    export default {
        name: "home",
        components: { },
        data: function() {
            return {
                inputMessage: "",
                receivedMessage: "",
            };
        },
        methods: {
            onPackage(p) {
                this.receivedMessage = p.Content;
            },
            sendMessage() {
                SocketService.send({ Content: this.inputMessage, Type: 0 });
            },
        },
        mounted: function() {
            SocketService.connect("ws://localhost:42420/neo");
            SocketService.$on("onPackage", this.onPackage);
        },
    }

</script>

<template>

    <div class="home">
        <input v-model="inputMessage" type="text" />
        <button @click="sendMessage()">Absenden</button>
        <p>{{ receivedMessage }}</p>
    </div>

</template>
