<template>
  <q-page class="q-pa-md">
    <h4 class="text-center">User Profile</h4>

    <q-card class="q-mt-md q-pa-sm">
      <q-card-section class="text-center">
        <q-avatar size="120px">
          <img :src="previewImage || userProfileImage || defaultProfileImage" />
        </q-avatar>
        <q-btn round dense flat icon="edit" class="q-ml-sm" @click="fileInput.$el.click()" />
        <q-file ref="fileInput" class="hidden" accept="image/*" @update:modelValue="previewSelectedImage" />
      </q-card-section>

      <q-card-section v-if="previewImage">
        <q-btn color="primary" label="Save" @click="uploadProfileImage" />
        <q-btn color="negative" label="Discard" class="q-ml-sm" @click="discardChanges" />
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

          <q-item>
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Date of Birth:</q-item-label>
              <q-item-label caption>{{ user?.dob || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="location_on" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Address</q-item-label>
              <q-item-label caption>{{ user?.address || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="card_membership" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Membership ID</q-item-label>
              <q-item-label caption>{{ user?.membershipId || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="remember_me" />
            </q-item-section>
            <q-item-section>
              <q-item-label>National ID</q-item-label>
              <q-item-label caption>{{ user?.nationalId || "N/A" }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Mobile Number -->
          <q-item class="q-mb-md">
            <!-- Avatar Section -->
            <q-item-section avatar>
              <q-icon name="phone" color="secondary"/>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">Mobile Number</q-item-label>
              <q-input v-model="mobileNumber" filled type="tel" label="Enter mobile number" class="q-mt-xs"
                :readonly="!isEditingPhone" :dense="!isEditingPhone" outlined color="primary" hide-bottom-space />
            </q-item-section>

            <!-- Action Buttons -->
            <q-item-section side class="row items-center">
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
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

const user = ref(null);
const mobileNumber = ref("");
const userProfileImage = ref("");
const previewImage = ref(null);
const selectedFile = ref(null);
const fileInput = ref(null);
const isEditingPhone = ref(false);
const defaultProfileImage = "https://cdn.quasar.dev/img/avatar5.png";

onMounted(async () => {
  if (auth.currentUser) {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists()) {
      user.value = userDoc.data();
      mobileNumber.value = user.value.phone || "";
      userProfileImage.value = user.value.profileImage || defaultProfileImage;
    }
  }
});

// Update mobile number in Firestore
const updateMobileNumber = async () => {
  if (!mobileNumber.value.trim()) return;

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    phone: mobileNumber.value
  });

  isEditingPhone.value = false;
  alert("Mobile number updated successfully!");
};

// Function to preview selected image before uploading
const previewSelectedImage = (file) => {
  if (!file) return;

  selectedFile.value = file;

  // Create a temporary URL for preview
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    previewImage.value = reader.result;
  };
};

// Function to discard changes (cancel preview)
const discardChanges = () => {
  selectedFile.value = null;
  previewImage.value = null;
};

// Function to upload profile image
const uploadProfileImage = async () => {
  if (!selectedFile.value) {
    console.log("No file selected.");
    return;
  }

  try {
    console.log("Uploading file...");
    const file = selectedFile.value;
    const fileRef = storageRef(storage, `profileImages/${auth.currentUser.uid}`);

    await uploadBytes(fileRef, file);
    console.log("Upload successful!");

    const downloadURL = await getDownloadURL(fileRef);
    console.log("Download URL:", downloadURL);

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      profileImage: downloadURL
    });

    console.log("Firestore updated successfully!");

    userProfileImage.value = downloadURL;
    previewImage.value = null;
    selectedFile.value = null;

    alert("Profile image updated successfully!");
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Failed to upload profile image.");
  }
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