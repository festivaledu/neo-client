<script>
    import { SocketService } from "@/socketservice";

    export default {
        name: "home",
        components: { },
        data: function() {
            return {
                inputMessage: "",
                receivedMessage: "",
                status: "",
            };
        },
        methods: {
            onOpen() {
                this.status = "Connected";
            },
            onPackage(p) {
                this.receivedMessage = p.content;
            },
            sendMessage() {
                SocketService.send({ content: this.inputMessage, type: 0 });
            },
        },
        mounted: function() {
            SocketService.connect("ws://localhost:42420/neo");
            SocketService.$on("onOpen", this.onOpen);
            SocketService.$on("onPackage", this.onPackage);
        },
    }

</script>

<template>

    <div class="home">
        <p>{{ status }}</p>
        <input v-model="inputMessage" type="text" />
        <button @click="sendMessage()">Absenden</button>
        <p>{{ receivedMessage }}</p>
    </div>

</template>
