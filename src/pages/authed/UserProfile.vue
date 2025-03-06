<template>
  <q-page class="q-pa-md">
    <h2 class="text-center">User Profile</h2>

    <q-card class="q-mt-md q-pa-md">
      <!-- Profile Image & Upload -->
      <q-card-section class="text-center">
        <q-avatar size="120px">
          <img :src="userProfileImage || defaultProfileImage" />
        </q-avatar>
        <q-btn round dense flat icon="edit" class="q-ml-sm" @click="selectImage" />
        <q-file ref="fileInput" class="hidden" v-model="selectedFile" accept="image/*" @change="uploadProfileImage" />
      </q-card-section>

      <q-card-section>
        <q-list>
          <!-- Name -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Name</q-item-label>
              <q-item-label caption>{{ user?.name || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Email -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="email" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Email</q-item-label>
              <q-item-label caption>{{ user?.email || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Membership ID (Non-Editable) -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Membership ID</q-item-label>
              <q-item-label caption>{{ user?.membershipId || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- National ID (Non-Editable) -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="credit_card" />
            </q-item-section>
            <q-item-section>
              <q-item-label>National ID</q-item-label>
              <q-item-label caption>{{ user?.nationalId || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Mobile Number (Editable) -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="phone" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Mobile Number</q-item-label>
              <q-input v-model="mobileNumber" filled type="tel" label="Enter mobile number"
                :readonly="!isEditingPhone" />
            </q-item-section>
            <q-item-section side>
              <q-btn v-if="!isEditingPhone" flat round dense icon="edit" @click="isEditingPhone = true" />
              <q-btn v-else flat round dense icon="check" color="positive" @click="updateMobileNumber" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

const user = ref(null);
const mobileNumber = ref("");
const userProfileImage = ref("");
const selectedFile = ref(null);
const fileInput = ref(null);
const isEditingPhone = ref(false);
const defaultProfileImage = "https://cdn.quasar.dev/img/avatar5.png";

onMounted(async () => {
  if (auth.currentUser) {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists()) {
      user.value = userDoc.data();
      mobileNumber.value = user.value.mobile || "";
      userProfileImage.value = user.value.profileImage || defaultProfileImage;
    }
  }
});

// Function to update mobile number
const updateMobileNumber = async () => {
  if (!mobileNumber.value.trim()) return;

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    mobile: mobileNumber.value
  });

  isEditingPhone.value = false;
  alert("Mobile number updated successfully!");
};

// Function to trigger file input
const selectImage = () => {
  fileInput.value.$el.click();
};

// Function to upload profile image
const uploadProfileImage = async () => {
  if (!selectedFile.value) return;

  const file = selectedFile.value;
  const fileRef = storageRef(storage, `profileImages/${auth.currentUser.uid}`);

  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    profileImage: downloadURL
  });

  userProfileImage.value = downloadURL;
  alert("Profile image updated successfully!");
};
</script>

<style scoped>
.hidden {
  display: none;
}

.q-page {
  max-width: 400px;
  margin: auto;
}
</style>