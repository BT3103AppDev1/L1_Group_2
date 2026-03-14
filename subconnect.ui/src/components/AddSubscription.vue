<template>
  <div class="add-sub-container">
    <h2>Add a Subscription</h2>
    
    <div class="form-group">
      <label>Service Name:</label>
      <input v-model="newSub.serviceName" placeholder="e.g., Netflix" />
    </div>

    <div class="form-group">
      <label>Monthly Cost ($):</label>
      <input v-model="newSub.cost" type="number" placeholder="15.99" />
    </div>

    <button @click="runDummyTest">Save to Database</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { addSubscription } from '../services/db.js'; // Adjust the path if needed

const newSub = ref({
  serviceName: 'Netflix',
  category: 'Entertainment',
  cost: 15.99,
  billingCycle: 'monthly',
  nextBillingDate: new Date().toISOString() // Grabs today's date for the test
});

const runDummyTest = async () => {
  try {
    console.log("Attempting to send data to Firebase...");
    
    const dummyUserId = "test_user_999"; 
    
    const docId = await addSubscription(dummyUserId, newSub.value);
    
    alert(`Success! Data saved with ID: ${docId}`);
  } catch (error) {
    console.error(error);
    alert("Test failed! Check the console.");
  }
};
</script>

<style scoped>
.add-sub-container {
  border: 1px solid #ccc;
  padding: 20px;
  max-width: 400px;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
input {
  margin-left: 10px;
}
</style>