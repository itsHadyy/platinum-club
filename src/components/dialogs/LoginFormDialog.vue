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
                        <q-form class="q-gutter-md">
                            <q-input label="Email" v-model="email" type="email" outlined
                                :rules="[(val) => val.includes('@') && val.includes('.') || 'Invalid E-mail']"
                                hide-bottom-space lazy-rules />
                            <q-input type="password" label="Password" v-model="password" outlined
                                :rules="[(val) => val.length > 7 || 'Invalid Password']" hide-bottom-space lazy-rules />
                            <div class="row justify-center q-mt-md">
                                <q-btn label="Login" color="secondary" class="q-px-xl full-width" @click="login" />
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
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from 'src/boot/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const emit = defineEmits(['login']);

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const dialogVisible = ref(false);
const username = ref('');
const open = () => {
    dialogVisible.value = true;
    errorMessage.value = ''; // Clear previous errors
};

const closeDialog = () => {
    dialogVisible.value = false;
};

const login = async () => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        localStorage.setItem('userSession', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: userData.name,
            role: userData.role
        }));

        router.push(userData.role === "admin" ? '/admin' : '/dashboard');

    } catch (error) {
        console.error("Login failed:", error); // Log the error
        errorMessage.value = "Invalid credentials.";
    }

    if (username.value && password.value) {
        const userData = { name: username.value };
        emit('login', userData);
    }
};

const openRegister = () => {
    closeDialog();
    router.push('/register');
};

defineExpose({
    open,
    close: closeDialog,
});

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>