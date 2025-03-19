import { defineStore } from "pinia";
import { ref } from "vue";

export const useSportsStore = defineStore("sportsStore", () => {
    // List of sports
    const sportsOptions = ref(["Tennis", "Padel", "Basketball", "Football", "Volleyball"]);

    // Courts categorized by sport
    const courtsBySport = ref({
        Tennis: [
            { id: 1, name: "Court A", price: 200, location: "Downtown", size: "24x11", surface: "Clay" },
            { id: 2, name: "Court B", price: 250, location: "City Center", size: "26x12", surface: "Grass" }
        ],
        Padel: [
            { id: 3, name: "Court C", price: 180, location: "Suburbs", size: "20x10", surface: "Synthetic" },
            { id: 4, name: "Court D", price: 190, location: "West Side", size: "22x10", surface: "Hard" }
        ],
        Basketball: [
            { id: 5, name: "Court E", price: 150, location: "Sports Complex", size: "30x20", surface: "Hardwood" },
            { id: 6, name: "Court F", price: 170, location: "East Park", size: "32x22", surface: "Concrete" }
        ],
        Football: [
            { id: 7, name: "Court G", price: 300, location: "Main Arena", size: "50x30", surface: "Artificial Turf" },
            { id: 8, name: "Court H", price: 350, location: "North Field", size: "60x40", surface: "Grass" }
        ],
        Volleyball: [
            { id: 9, name: "Court I", price: 120, location: "Beach Side", size: "18x9", surface: "Sand" },
            { id: 10, name: "Court J", price: 130, location: "Indoor Arena", size: "18x9", surface: "Hard" }
        ]
    });

    // Add a new sport
    const addSport = (sport) => {
        if (!sportsOptions.value.includes(sport)) {
            sportsOptions.value.push(sport);
            courtsBySport.value[sport] = []; // Initialize with an empty array
        }
    };

    // Remove a sport
    const removeSport = (sport) => {
        sportsOptions.value = sportsOptions.value.filter((s) => s !== sport);
        delete courtsBySport.value[sport]; // Remove courts associated with the sport
    };

    // Update court price (keeping other details unchanged)
    const updateCourtPrice = (sport, courtId, newPrice) => {
        if (!courtsBySport.value[sport]) return;

        const court = courtsBySport.value[sport].find(c => c.id === courtId);
        if (court) {
            court.price = newPrice;
        }
    };

    return { sportsOptions, courtsBySport, addSport, removeSport, updateCourtPrice };
});