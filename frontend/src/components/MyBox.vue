<template>
  <div class="box-detail">
    <AppNavbar />
    <v-card class="box-detail-card" outlined>
      <v-card-title>{{ box.title }}</v-card-title>
      <v-card-subtitle>Type: {{ box.type }}</v-card-subtitle>
      
      <!-- Display QR code if available -->
      <div v-if="box.qrCode && hasAccess">
        <h3>QR Code:</h3>
        <img :src="qrCodeLink" alt="QR Code" class="qr-code-image" />
        <v-btn color="indigo-darken-3" @click="printQRCode">Print QR Code</v-btn>
        
        <!-- Share Section -->
        <div v-if="isOwner">
          <h3>Share this box:</h3>
          <v-text-field
            v-model="shareEmail"
            label="Email Address"
            type="email"
            :rules="[v => !!v || 'Email is required']"
          ></v-text-field>
          <v-btn color="primary" @click="shareBox">Share</v-btn> <!-- Updated Share Button -->
        </div>
      </div>
      
      <v-card-text>
        <!-- If no access, show the password input -->
        <div v-if="!hasAccess && !isOwner">
          <h3>This box is private. Enter access code:</h3>
          <v-text-field
            v-model="inputAccessCode"
            label="Access Code"
            type="password"
          ></v-text-field>
          <v-btn @click="checkAccessCode">Submit</v-btn>
          <v-alert v-if="accessError" type="error">Incorrect Access Code</v-alert>
        </div>

        <!-- If user has access, show box contents -->
        <div v-if="hasAccess || isOwner">
          <p>Email: {{ box.email }}</p>
          
          <!-- Display the content based on file type -->
          <div v-if="box.type === 'image'">
            <h3>Image:</h3>
            <img :src="fileLink" alt="Uploaded Image" class="uploaded-image" />
          </div>

          <div v-if="box.type === 'audio'">
            <h3>Audio:</h3>
            <audio controls>
              <source :src="fileLink" type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
          </div>

          <div v-if="fileContent.length > 0 && box.type === 'list'">
            <h3>File Content:</h3>
            <ul>
              <li v-for="(line, index) in fileContent" :key="index">{{ line }}</li>
            </ul>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const box = ref({});
const fileContent = ref([]); // Array to hold the file lines
const route = useRoute();
const fileLink = ref('');
const qrCodeLink = ref('');
const hasAccess = ref(false); // Tracks if the user has access to the box
const inputAccessCode = ref(''); // Input value for the access code
const accessError = ref(false); // Tracks if the access code is incorrect
const isOwner = ref(false); // Tracks if the logged-in user is the owner
const shareEmail = ref(''); // Input value for the email to share

// Fetch a single box based on the ID in the route
async function fetchBox(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/boxes/${id}`);
    box.value = await response.json();
    console.log("Fetched box details:", box.value);
    
    // Check if user is the owner of the box
    const loggedInEmail = localStorage.getItem('email');
    isOwner.value = (loggedInEmail === box.value.email);

    // If box is public or the user is the owner, grant access
    if (box.value.public || isOwner.value) {
      hasAccess.value = true;
    }

    // Set file and QR code links
    fileLink.value = `/src/form_data/${box.value.filePath}`;
    qrCodeLink.value = `/src/qr_codes/${box.value.id}_qr.png`;

    // Fetch the file content if the box is a list and access is granted
    if (hasAccess.value && box.value.filePath && box.value.type === 'list') {
      await fetchFileContent(box.value.filePath);
    }
  } catch (error) {
    console.error('Error fetching box:', error);
  }
}

// Function to fetch the file content
async function fetchFileContent(filePath) {
  try {
    const response = await fetch(`http://localhost:3001/api/list?path=/home/alexanderw/pa1414/frontend/src/form_data/${filePath}`);
    const text = await response.text();
    fileContent.value = text.split('\n'); // Split the text into lines
    console.log("Fetched file content:", fileContent.value);
  } catch (error) {
    console.error('Error fetching file content:', error);
  }
}

// Function to check if the entered access code matches the box access code
function checkAccessCode() {
  if (inputAccessCode.value === box.value.access_code) {
    hasAccess.value = true;
    accessError.value = false;
    
    // Fetch file content if needed after access is granted
    if (box.value.type === 'list') {
      fetchFileContent(box.value.filePath);
    }
  } else {
    accessError.value = true;
  }
}

// Function to share the box
async function shareBox() {
  try {
    // Validate email input
    if (!shareEmail.value) {
      alert('Please enter an email address to share the box.');
      return;
    }
    console.log("BOX VALUE:", box.value);
    const shareData = {
      access_code: box.value.access_code, // Send access code in the request
      email: shareEmail.value, // Send email in the request
      url: window.location.href // Current page URL
    };

    const response = await fetch('http://localhost:3001/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shareData)
    });

    if (response.ok) {
      alert('Box shared successfully!');
      shareEmail.value = ''; // Clear email input after successful share
    } else {
      console.error('Failed to share box');
    }
  } catch (error) {
    console.error('Error sharing box:', error);
  }
}

function printQRCode() {
  const qrCodeImage = document.querySelector('.qr-code-image'); // Select the QR code image
  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
  printWindow.document.write(`<img src="${qrCodeImage.src}" style="width: 100%;"/>`); // Use the QR code image
  printWindow.document.write('</body></html>');
  printWindow.document.close(); // Close the document
  printWindow.print(); // Open the print dialog
}

// Fetch box data when component mounts
onMounted(() => {
  const id = route.params.id;
  console.log("Box ID:", id);
  fetchBox(id);
});
</script>

<style scoped>
.box-detail-card {
  max-width: 600px;
  margin: auto;
}
</style>
