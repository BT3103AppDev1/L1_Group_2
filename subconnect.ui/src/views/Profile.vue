<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2 class="profile-title">Profile Settings</h2>
      
      <form @submit.prevent="updateUserProfile" class="profile-form">
        
        <div class="avatar-section">
          <div class="avatar-preview">
            <img v-if="previewUrl" :src="previewUrl" alt="Profile Preview" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              <span>{{ displayName ? displayName.charAt(0) : '?' }}</span>
            </div>
          </div>
          <div class="upload-controls">
            <label for="avatar-upload" class="upload-btn">Choose New Photo</label>
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/png, image/jpeg, image/jpg" 
              @change="handleFileChange" 
              class="hidden-input" 
            />
            <p class="upload-help">JPG or PNG, max 2MB.</p>
          </div>
        </div>

        <div class="form-group">
          <label>Display Name</label>
          <input 
            v-model="displayName" 
            type="text" 
            placeholder="e.g. Wei Young" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            :value="userEmail"
            type="email"
            disabled
            class="disabled-input"
          />
        </div>

        <button type="submit" class="save-btn" :disabled="isLoading">
          {{ isLoading ? 'Saving...' : 'Save Changes' }}
        </button>

        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, updateProfile } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
const auth = getAuth();
const userEmail = ref('');
const displayName = ref('');
const previewUrl = ref(null);
const selectedFile = ref(null);

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Load existing data when the page opens
onMounted(() => {
  const user = auth.currentUser;
  if (user) {
    userEmail.value = user.email;
    displayName.value = user.displayName || '';
    previewUrl.value = user.photoURL || null;
  }
});

// Handle file selection and generate a temporary preview
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file); // Instant preview!
  }
};

const updateUserProfile = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    
    const user = auth.currentUser;
    let newPhotoUrl = user.photoURL;

    // 1. If they selected a new photo, upload it to Firebase Storage first
    if (selectedFile.value) {
      // Create a unique file path for this user
      const fileRef = storageRef(storage, `avatars/${user.uid}/${selectedFile.value.name}`);
      await uploadBytes(fileRef, selectedFile.value);
      newPhotoUrl = await getDownloadURL(fileRef);
    }

    // 2. Update their Auth Profile with the name and new photo URL
    await updateProfile(user, {
      displayName: displayName.value,
      photoURL: newPhotoUrl
    });

    successMessage.value = 'Profile updated successfully!';
    
    // Quick reload to make sure the header updates globally
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (error) {
    console.error("Error updating profile:", error);
    errorMessage.value = "Failed to update profile. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.profile-card {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #eaeaea;
}

.profile-title {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #1a1a2e;
  font-size: 1.5rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0d9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #6c47ff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 2rem;
  color: #6c47ff;
  font-weight: bold;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #f4f4f8;
  color: #1a1a2e;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #ddd;
}

.upload-btn:hover {
  background-color: #e2e2e8;
}

.hidden-input {
  display: none;
}

.upload-help {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #888;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #6c47ff;
  box-shadow: 0 0 0 2px rgba(108, 71, 255, 0.2);
}

.disabled-input {
  background-color: #f8f9fa;
  color: #888;
  cursor: not-allowed;
}

.save-btn {
  width: 100%;
  padding: 0.85rem;
  background-color: #6c47ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #5a3bc2;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.success-msg {
  color: #28a745;
  text-align: center;
  margin-top: 1rem;
  font-weight: 500;
}

.error-msg {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
}
</style>