import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationsStore = defineStore("notificationsStore", () => {
    const notifications = ref([]);

    // Add a notification
    const addNotification = (message, type = "info") => {
        const newNotification = {
            id: Date.now(),
            message,
            type,
            read: false, // Unread by default
            timestamp: new Date()
        };
        notifications.value.unshift(newNotification); // Add to the beginning
    };

    // Mark as read
    const markAsRead = (id) => {
        const notification = notifications.value.find((n) => n.id === id);
        if (notification) notification.read = true;
    };

    // Remove a notification
    const removeNotification = (id) => {
        notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    // Clear all notifications
    const clearNotifications = () => {
        notifications.value = [];
    };

    return { notifications, addNotification, markAsRead, removeNotification, clearNotifications };
});