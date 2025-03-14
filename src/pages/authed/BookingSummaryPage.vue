<template>
    <q-page class="q-pa-md">

        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-h6 q-mt-md">Confirm Your Booking</div>

        <q-card-section>
            <div class="text-subtitle1">Court Type:</div>
            <p>{{ courtType }}</p>

            <div class="text-subtitle1">Date:</div>
            <p>{{ day }}</p>

            <div class="text-subtitle1">Court:</div>
            <p>Court {{ court }}</p>

            <div class="text-subtitle1">Time Slots:</div>
            <ul>
                <li v-for="slot in slots" :key="slot">{{ slot }}</li>
            </ul>

            <div class="text-subtitle1">Total Price:</div>
            <p>{{ price }} EGP</p>

            <q-btn color="primary" class="full-width q-mt-md" label="Confirm Booking" @click="confirmBooking" />
        </q-card-section>
    </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

const route = useRoute();
const router = useRouter();

const courtType = route.query.courtType;
const day = route.query.day;
const court = route.query.court;
const slots = JSON.parse(route.query.slots);
const price = route.query.price;

// Save to Firestore
const confirmBooking = async () => {
    await addDoc(collection(db, 'bookings'), {
        courtType,
        day,
        court,
        slots,
        price,
        userId: 'user123' // Later with real user auth
    });

    alert('Booking Confirmed ✅');
    router.push('/dashboard');
};
</script>