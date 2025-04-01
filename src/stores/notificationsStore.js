import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationsStore = defineStore("notificationsStore", () => {
    const notifications = ref([]);

    
    const addNotification = (message, type = "info") => {
        const newNotification = {
            id: Date.now(),
            message,
            type,
            read: false, 
            timestamp: new Date()
        };
        notifications.value.unshift(newNotification); 
    };

    
    const markAsRead = (id) => {
        const notification = notifications.value.find((n) => n.id === id);
        if (notification) notification.read = true;
    };

    
    const removeNotification = (id) => {
        notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    
    const clearNotifications = () => {
        notifications.value = [];
    };

    return { notifications, addNotification, markAsRead, removeNotification, clearNotifications };
});