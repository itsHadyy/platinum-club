<template>
    <q-page class="q-pa-md">

        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-subtitle1 text-bold q-mb-lg">Confirm Your Booking</div>

        <q-card-section>
            <div class="text-subtitle1">Court Type:</div>
            <p>{{ courtType }}</p>

            <div class="text-subtitle1">Date:</div>
            <p>{{ formattedDay }}</p>

            <div class="text-subtitle1">Court:</div>
            <p>Court {{ court }}</p>

            <div class="text-subtitle1">Time Slots:</div>
            <ul>
                <li v-for="slot in slots" :key="slot">{{ slot }}</li>
            </ul>

            <div class="text-subtitle1">Total Price:</div>
            <p>{{ price }} EGP</p>

            <div class="row justify-center q-mt-lg">
                <q-btn color="secondary" class="" label="Confirm Booking" @click="confirmBooking" />
            </div>
        </q-card-section>
    </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { getAuth } from 'firebase/auth';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();

const auth = getAuth();

const courtType = route.query.courtType;
const day = route.query.day;
const court = route.query.court;
const slots = JSON.parse(route.query.slots);
const price = route.query.price;

// ✅ Correctly format the date
const formattedDay = computed(() => {
    return new Date(day).toLocaleDateString('en-GB'); // DD/MM/YYYY format
});


const confirmBooking = async () => {
    const user = auth.currentUser;

    if (!user) {
        alert('User not authenticated');
        return;
    }

    try {
        // Fetch the user's data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            alert('User data not found');
            return;
        }

        const userData = userDocSnap.data();

        await addDoc(collection(db, 'courtBookings'), {
            userId: user.uid,
            userName: `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`,
            phone: userData.phone || 'N/A',
            courtType,
            date: new Date(day).toISOString().split('T')[0],
            court: parseInt(court),
            slots,
            price: parseInt(price),
        });

        alert('Booking Confirmed ✅');
        router.push('/');
    } catch (error) {
        console.error('Error adding booking:', error);
        alert('Failed to confirm booking. Please try again.');
    }
};
</script>