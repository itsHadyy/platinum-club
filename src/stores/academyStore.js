import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAcademyStore = defineStore("academyStore", () => {
    const academies = ref([
        {
            id: 1,
            name: "Elite Sports Academy",
            location: "Downtown",
            contact: "0123456789",
            email: "info@elitesports.com",
            website: "https://elitesports.com",
            sportsOffered: ["Tennis", "Basketball", "Football"],
            programs: [
                { 
                    id: 1, 
                    name: "Beginner Tennis", 
                    price: 500, 
                    duration: "1 month", 
                    schedule: "Mon & Wed 5-7 PM", 
                    ageGroup: "8-12", 
                    coachId: 1
                },
                { 
                    id: 2, 
                    name: "Advanced Basketball", 
                    price: 700, 
                    duration: "2 months", 
                    schedule: "Tue & Thu 6-8 PM", 
                    ageGroup: "12-16", 
                    coachId: 2 
                }
            ],
            coaches: [
                { id: 1, name: "Coach A", sport: "Tennis", experience: "10 years" },
                { id: 2, name: "Coach B", sport: "Basketball", experience: "7 years" }
            ]
        },
        {
            id: 2,
            name: "Elite Sports Academy",
            location: "Downtown",
            contact: "0123456789",
            email: "info@elitesports.com",
            website: "https://elitesports.com",
            sportsOffered: ["Tennis", "Basketball", "Football"],
            programs: [
                { 
                    id: 1, 
                    name: "Beginner Tennis", 
                    price: 500, 
                    duration: "1 month", 
                    schedule: "Mon & Wed 5-7 PM", 
                    ageGroup: "8-12", 
                    coachId: 1
                },
                { 
                    id: 2, 
                    name: "Advanced Basketball", 
                    price: 700, 
                    duration: "2 months", 
                    schedule: "Tue & Thu 6-8 PM", 
                    ageGroup: "12-16", 
                    coachId: 2 
                }
            ],
            coaches: [
                { id: 1, name: "Coach A", sport: "Tennis", experience: "10 years" },
                { id: 2, name: "Coach B", sport: "Basketball", experience: "7 years" }
            ]
        },
    ]);

    // Getter: Filter academies by sport
    const getAcademiesBySport = computed(() => (sport) => {
        return academies.value.filter(a => a.sportsOffered.includes(sport));
    });

    return { academies, getAcademiesBySport };
});