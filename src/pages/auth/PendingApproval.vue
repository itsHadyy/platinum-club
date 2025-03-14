<template>
    <q-page class="column flex-center q-mt-lg">
        <q-card class="q-pa-md text-center">
            <q-card-section>
                <div class="text-h6">Account Pending Approval</div>
                <p>Your account is under review by the admin. You will be notified once approved.</p>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="Back to Login" color="secondary" @click="goToLogin" unelevated />
            </q-card-actions>
        </q-card>
    </q-page>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
    setup() {
        const router = useRouter();

        const goToLogin = () => {
            router.push('/auth/login'); // Redirect to login page
        };

        return { goToLogin };
    }
};
</script>