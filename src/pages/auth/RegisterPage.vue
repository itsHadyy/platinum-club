<template>
    <q-page class="row items-center justify-center">
        <q-card style="width: 500px; max-width: 90vw;" class="q-pa-md">
            <q-card-section>
                <div class="text-h6 text-center">Register</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit="register" class="q-gutter-xsm">
                    <q-input v-model="formData.name" label="Name" outlined :rules="[requiredRule]" />
                    <q-input v-model="formData.email" label="Email" type="email" outlined :rules="[requiredRule, emailRule]" />
                    <q-input v-model="formData.phone" label="Phone Number" outlined :rules="[requiredRule]" />
                    <q-input v-model="formData.membershipId" label="Membership ID" outlined :rules="[requiredRule]" />
                    <q-input v-model="formData.nationalId" label="National ID" type="text" outlined 
                        :rules="[requiredRule, nationalIdRule]" />
                    <q-input v-model="formData.dob" label="Date of Birth" type="date" outlined :rules="[requiredRule]" />
                    <q-input v-model="formData.password" label="Password" type="password" outlined :rules="[requiredRule, passwordRule]" />
                    <q-input v-model="formData.confirmPassword" label="Confirm Password" type="password" outlined 
                        :rules="[requiredRule, confirmPasswordRule]" />

                    <q-btn type="submit" label="Register" color="secondary" class="full-width" />
                </q-form>
            </q-card-section>

            <q-card-section v-if="errorMessage">
                <q-banner class="bg-red text-white">{{ errorMessage }}</q-banner>
            </q-card-section>

            <q-card-section class="text-center">
                <q-btn flat label="Already have an account? Login" color="primary" @click="openLoginDialog"
                    class="text-secondary" />
            </q-card-section>
        </q-card>

        <LoginFormDialog ref="loginDialogRef" />
    </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from 'src/boot/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import LoginFormDialog from 'src/components/dialogs/LoginFormDialog.vue';

const router = useRouter();
const loginDialogRef = ref(null);
const loading = ref(false);

const formData = reactive({
    name: '',
    email: '',
    membershipId: '',
    nationalId: '',
    dob: '',
    phone: '',
    password: '',
    confirmPassword: '',
});

// Validation Rules
const requiredRule = (val) => !!val || 'Field is required';
const emailRule = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email';
const passwordRule = (val) => val.length >= 8 || 'Password must be at least 8 characters';
const confirmPasswordRule = (val) => val === formData.password || 'Passwords do not match';
const nationalIdRule = (val) => /^\d{14}$/.test(val) || 'National ID must be exactly 14 numbers';

// Error message state
const errorMessage = ref('');

const register = async () => {
    if (formData.password !== formData.confirmPassword) {
        errorMessage.value = "Passwords do not match!";
        return;
    }

    loading.value = true; // Start loading

    try {
        // Register user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Save user info in Firestore with role "pending"
        await setDoc(doc(db, "users", user.uid), {
            name: formData.name,
            email: formData.email,
            membershipId: formData.membershipId,
            nationalId: formData.nationalId,
            dob: formData.dob,
            role: "pending",// Users cannot assign themselves as admins
            phone: formData.phone,  
            createdAt: new Date()
        });

        Object.assign(formData, { name: '', email: '', membershipId: '', nationalId: '', phone: '', dob: '', password: '', confirmPassword: '' });

        router.push('/pending');
    } catch (error) {
        errorMessage.value = firebaseErrorHandler(error.code);
    } finally {
        loading.value = false; // Stop loading
    }
};

// Firebase Error Handling Function
const firebaseErrorHandler = (code) => {
    const errors = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Invalid email format.",
        "auth/weak-password": "Password should be at least 8 characters.",
        "auth/network-request-failed": "Network error. Please check your connection.",
    };
    return errors[code] || "An unexpected error occurred. Please try again.";
};

const openLoginDialog = () => {
    loginDialogRef.value.open();
};
</script>

<style scoped>
/* Add any custom styles here */
</style>