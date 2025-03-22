<template>
    <q-page class="q-pa-md">

        <q-card-section class="header flex">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-toolbar-title> Confirm Your Booking </q-toolbar-title>
        </q-card-section>

        <q-card>

            <q-card-section class="q-pa-md">
                <q-list separator class="q-gutter-md">
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="event" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-weight-bold">Date</q-item-label>
                            <q-item-label caption>{{ formattedDay }}</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="sports_tennis" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-weight-bold">Court</q-item-label>
                            <q-item-label caption>{{ court }}</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="sports" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-weight-bold">Sport</q-item-label>
                            <q-item-label caption>{{ sport }}</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="schedule" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-weight-bold">Time Slots</q-item-label>
                            <q-item-label caption>
                                <q-badge v-for="slot in slots" :key="slot" class="q-mr-sm q-mb-xs" color="secondary"
                                    rounded>
                                    {{ slot }}
                                </q-badge>
                            </q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="attach_money" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-weight-bold">Total Price</q-item-label>
                            <q-item-label caption class="text-h6 text-green">{{ price }} EGP</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <div class="row justify-center q-mt-lg">
                    <q-btn :loading="loading" :disable="loading" color="secondary" class=" text-h6 text-white"
                        icon="check_circle" label="Confirm Booking" @click="confirmBooking" />
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { getAuth } from 'firebase/auth';
import { computed, ref } from 'vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const auth = getAuth();

const day = route.query.day;
const court = route.query.court;
const slots = JSON.parse(route.query.slots);
const price = route.query.price;
const sport = route.query.sport;

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

    if (loading.value) return;
    loading.value = true;

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
            date: new Date(day).toISOString().split('T')[0],
            court,
            slots,
            price: parseInt(price),
            sport,
        });

        alert('Booking Confirmed ✅');
        router.push('/');
    } catch (error) {
        console.error('Error adding booking:', error);
        alert('Failed to confirm booking. Please try again.');
    } finally {
        loading.value = false;
    }
};
</script>