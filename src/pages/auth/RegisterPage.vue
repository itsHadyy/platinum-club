<template>
    <q-page class="row items-center justify-center q-mt-lg q-mb-lg">
        <q-card style="width: 600px; max-width: 90vw;" class="q-pa-md">
            <q-card-section>
                <div class="text-h6 text-center">Register</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit="register" class="q-gutter-md">

                    <!-- Personal Information -->
                    <div class="text-subtitle1 text-bold">Personal Information</div>
                    <q-space />
                    <div class="row q-col-gutter-md q-ml-xs">
                        <q-input class="col-6" v-model="formData.firstName" label="First Name" outlined
                            :rules="[requiredRule]" />
                        <q-input class="col-6" v-model="formData.middleName" label="Middle Name (Optional)" outlined />
                    </div>
                    <q-input class="col-6" v-model="formData.lastName" label="Last Name" outlined
                        :rules="[requiredRule]" />

                    <q-input v-model="formData.email" label="Email" type="email" outlined
                        :rules="[requiredRule, emailRule]" />
                    <q-input v-model="formData.phone" label="Phone Number" outlined :rules="[requiredRule]" />
                    <q-input v-model="formData.dob" label="Date of Birth" type="date" outlined
                        :rules="[requiredRule]" />

                    <!-- Account Information -->
                    <div class="text-subtitle1 text-bold">Account Information</div>
                    <q-separator />
                    <q-input v-model="formData.membershipId" label="Membership ID" outlined :rules="[requiredRule]" />
                    <q-input v-model="formData.nationalId" label="National ID" type="text" outlined
                        :rules="[requiredRule, nationalIdRule]" />

                    <q-input v-model="formData.password" label="Password" type="password" outlined
                        :rules="[requiredRule, passwordRule]" />
                    <q-input v-model="formData.confirmPassword" label="Confirm Password" type="password" outlined
                        :rules="[requiredRule, confirmPasswordRule]" />

                    <!-- Image Upload -->
                    <div class="text-subtitle1 text-bold">Profile Picture</div>
                    <q-separator />
                    <q-file v-model="formData.image" label="Upload Profile Picture" accept="image/*" outlined
                        @update:model-value="previewImage">
                        <template v-slot:prepend>
                            <q-icon name="cloud_upload" />
                        </template>
                    </q-file>
                    
                    <div align="center">
                        <q-img v-if="imagePreview" :src="imagePreview" class="q-mt-md"
                            style="height: 100px; width: 100px; border-radius: 50%;" />
                    </div>

                    <div align="center">
                        <q-btn type="submit" label="Register" color="secondary" class="q-ma-auto" />
                    </div>

                    <!-- Error Message -->
                    <q-banner v-if="errorMessage" class="bg-red text-white">{{ errorMessage }}</q-banner>

                    <!-- Login Link -->
                    <div class="text-center q-mt-md">
                        <q-btn flat label="Already have an account? Login" color="secondary" @click="openLoginDialog" />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>

        <LoginFormDialog ref="loginDialogRef" />
    </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from 'src/boot/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoginFormDialog from 'src/components/dialogs/LoginFormDialog.vue';

const router = useRouter();
const loginDialogRef = ref(null);
const loading = ref(false);
const imagePreview = ref(null);

const formData = reactive({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    membershipId: '',
    nationalId: '',
    password: '',
    confirmPassword: '',
    image: null
});

// Validation Rules
const requiredRule = (val) => !!val || 'Field is required';
const emailRule = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email';
const passwordRule = (val) => val.length >= 8 || 'Password must be at least 8 characters';
const confirmPasswordRule = (val) => val === formData.password || 'Passwords do not match';
const nationalIdRule = (val) => /^\d{14}$/.test(val) || 'National ID must be exactly 14 numbers';

// Error message state
const errorMessage = ref('');

const previewImage = () => {
    if (formData.image) {
        const reader = new FileReader();
        reader.onload = (e) => imagePreview.value = e.target.result;
        reader.readAsDataURL(formData.image);
    }
};

const register = async () => {
    if (formData.password !== formData.confirmPassword) {
        errorMessage.value = "Passwords do not match!";
        return;
    }

    loading.value = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Upload Image to Firebase Storage
        let imageUrl = null;
        if (formData.image) {
            const fileRef = storageRef(storage, `profile_pictures/${user.uid}`);
            const snapshot = await uploadBytes(fileRef, formData.image);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Save User Data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            membershipId: formData.membershipId,
            nationalId: formData.nationalId,
            role: "pending",
            imageUrl: imageUrl, // Now the image URL will be saved here
            createdAt: new Date()
        });

        console.log("User data saved successfully!");

        // Reset form
        Object.assign(formData, { firstName: '', middleName: '', lastName: '', email: '', phone: '', dob: '', membershipId: '', nationalId: '', password: '', confirmPassword: '', image: null });
        imagePreview.value = null;

        router.push('/auth/pending');
    } catch (error) {
        console.error("Error during registration:", error);
        errorMessage.value = firebaseErrorHandler(error.code);
    } finally {
        loading.value = false;
    }
};

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