<template>
  <q-page class="q-pa-md">
    <h4 class="text-center">User Profile</h4>

    <q-card class="q-mt-md q-pa-sm">
      <!-- Profile Image -->
      <q-card-section class="text-center">
        <q-avatar size="120px">
          <img :src="userProfileImage || defaultProfileImage" />
        </q-avatar>
      </q-card-section>

      <q-card-section>
        <q-list>
          <!-- Full Name (First + Middle + Last) -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Name</q-item-label>
              <q-item-label caption>
                {{ user?.firstName || "N/A" }} {{ user?.middleName || "" }} {{ user?.lastName || "N/A" }}
              </q-item-label>
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

          <!-- Date of Birth -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Date of Birth</q-item-label>
              <q-item-label caption>{{ user?.dob || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Address (Optional) -->
          <q-item v-if="user?.address">
            <q-item-section avatar>
              <q-icon name="location_on" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Address</q-item-label>
              <q-item-label caption>{{ user?.address }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Membership ID -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="card_membership" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Membership ID</q-item-label>
              <q-item-label caption>{{ user?.membershipId || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- National ID -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" />
            </q-item-section>
            <q-item-section>
              <q-item-label>National ID</q-item-label>
              <q-item-label caption>{{ user?.nationalId || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Phone Number (Editable) -->
          <q-item class="q-mb-md">
            <q-item-section avatar>
              <q-icon name="phone" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Mobile Number</q-item-label>
              <q-input v-model="mobileNumber" filled type="tel" label="Enter mobile number" class="q-mt-xs"
                :readonly="!isEditingPhone" :dense="!isEditingPhone" outlined color="primary" hide-bottom-space />
            </q-item-section>

            <q-item-section side>
              <q-btn v-if="!isEditingPhone" flat round dense icon="edit" color="primary" @click="isEditingPhone = true">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn v-else flat round dense icon="check" color="positive" @click="updateMobileNumber">
                <q-tooltip>Save</q-tooltip>
              </q-btn>
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

// Firebase Instances
const auth = getAuth();
const db = getFirestore();

// Reactive Variables
const user = ref(null);
const mobileNumber = ref("");
const userProfileImage = ref("");
const isEditingPhone = ref(false);
const defaultProfileImage = "https://cdn.quasar.dev/img/avatar5.png";

// Fetch User Data on Component Mount
onMounted(async () => {
  if (auth.currentUser) {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists()) {
      user.value = userDoc.data();
      mobileNumber.value = user.value.phone || "";
      userProfileImage.value = user.value.imageUrl || defaultProfileImage; // Ensure correct image field name
    }
  }
});

// Update Mobile Number in Firestore
const updateMobileNumber = async () => {
  if (!mobileNumber.value.trim()) return;

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    phone: mobileNumber.value
  });

  isEditingPhone.value = false;
  alert("Mobile number updated successfully!");
};
</script>

<style scoped>
.q-page {
  max-width: 400px;
  margin: auto;
}
</style>