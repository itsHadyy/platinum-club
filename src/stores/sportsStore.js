import { defineStore } from "pinia";
import { ref } from "vue";

export const useSportsStore = defineStore("sportsStore", () => {
    const sportsOptions = ref(["Tennis", "Basketball", "Football", "Volleyball"]);

    const addSport = (sport) => {
        if (!sportsOptions.value.includes(sport)) {
            sportsOptions.value.push(sport);
        }
    };

    const removeSport = (sport) => {
        sportsOptions.value = sportsOptions.value.filter((s) => s !== sport);
    };

    return { sportsOptions, addSport, removeSport };
});