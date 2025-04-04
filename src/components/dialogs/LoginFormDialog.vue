<template>
    <transition name="fade">
        <q-page v-if="dialogVisible" class="fixed-full bg-grey-2">
            <div class="fixed-full bg-black/50"></div>
            <div class="absolute-center q-pa-md" style="width: 400px; max-width: 90%;">
                <q-card class="q-pa-md">
                    <q-card-section class="row items-center justify-between">
                        <div class="text-h6">Login</div>
                        <q-btn icon="close" flat round dense @click="closeDialog" />
                    </q-card-section>

                    <q-card-section v-if="errorMessage">
                        <q-banner class="bg-red text-white">{{ errorMessage }}</q-banner>
                    </q-card-section>

                    <q-card-section>
                        <q-form class="q-gutter-md" @submit.prevent="login">
                            <q-input label="Email" v-model="email" type="email" outlined
                                :rules="[(val) => val.includes('@') && val.includes('.') || 'Invalid E-mail']"
                                hide-bottom-space lazy-rules />
                            <q-input type="password" label="Password" v-model="password" outlined
                                :rules="[(val) => val.length > 7 || 'Invalid Password']" hide-bottom-space lazy-rules />

                            <div class="row justify-center q-mt-md">
                                <q-btn :loading="loading" :disable="loading" label="Login" color="secondary"
                                    class="q-px-xl full-width" @click="login">
                                    <template v-slot:loading>
                                        <q-spinner size="20px" color="white" />
                                    </template>
                                </q-btn>
                            </div>
                        </q-form>
                    </q-card-section>
                    <q-card-section class="text-center">
                        <q-btn label="Don't have an account? Signup" color="primary" @click="openRegister" flat
                            class="text-secondary" />
                    </q-card-section>
                </q-card>
            </div>
        </q-page>
    </transition>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "src/stores/useAuthStore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref("");
const loading = ref(false); 

const login = async () => {
    if (loading.value) return; 
    loading.value = true; 

    const auth = getAuth();
    const db = getFirestore();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            authStore.login({
                ...user,
                name: userData.name,
                role: userData.role
            });

            
            if (userData.role === "admin") {
                router.push("/admin");
            } else if (userData.role === "pending") {
                await auth.signOut(); 
                errorMessage.value = "Your account is pending approval. Please wait.";
                router.push("/auth/login"); 
            } else {
                router.push("/");
            }
        } else {
            console.error("User document not found in Firestore.");
            errorMessage.value = "User not found. Please try again.";
        }
    } catch (error) {
        console.error("Login failed:", error.message);
        errorMessage.value = "Invalid credentials. Please try again.";
    } finally {
        loading.value = false; 
    }
};

const dialogVisible = ref(false);
const open = () => {
    dialogVisible.value = true;
    errorMessage.value = ""; 
};

const closeDialog = () => {
    dialogVisible.value = false;
};

const openRegister = () => {
    closeDialog();
    router.push("/auth/register");
};

defineExpose({
    open,
    close: closeDialog,
});
</script>