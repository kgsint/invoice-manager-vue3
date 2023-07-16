import { defineStore } from "pinia"

export const useIndexStore = defineStore('app', {
    state: function() {
        return {
            showCreateModal: false,
        }
    },
})