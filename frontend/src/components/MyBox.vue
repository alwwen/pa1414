<template>
  <div class="box-detail">
    <AppNavbar />
    <v-container class="box-detail-container">
      <v-card class="box-detail-card" outlined>
        <v-card-title>{{ box.title }}</v-card-title>

        <v-card-text>
          <div v-if="isOwner" class="edit-section">
            <v-btn color="primary" @click="goToEditView" class="edit-btn">Edit Box</v-btn>
          </div>
          <div class="edit-section">
            <v-btn color="indigo" @click="printQRCode" class="print-btn">Print Label</v-btn>
          </div>
          <div v-if="box.qrCode && hasAccess" class="qr-share-section">
            <h3>Printable Label:</h3>
            <img :src="qrCodeLink" alt="QR Code" class="qr-code-image" />
            
            
            <div v-if="isOwner" class="share-section">
              <h3>Share this Box:</h3>
              <v-text-field
                v-model="shareEmail"
                label="Email Address"
                type="email"
                :rules="[v => !!v || 'Email is required']"
                class="share-input"
              ></v-text-field>
              <v-btn color="primary" @click="shareBox" class="share-btn">Share</v-btn>
            </div>
          </div>

          <div v-if="!hasAccess && !isOwner" class="access-section">
            <h3>This box is private. Enter access code:</h3>
            <v-text-field
              v-model="inputAccessCode"
              label="Access Code"
              type="password"
            ></v-text-field>
            <v-btn color="primary" @click="checkAccessCode" class="submit-btn">Submit</v-btn>
            <v-alert v-if="accessError" type="error">Incorrect Access Code</v-alert>
          </div>

          <div v-if="hasAccess || isOwner" class="content-section">
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
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const box = ref({});
const fileContent = ref([]);
const route = useRoute();
const router = useRouter();
const fileLink = ref('');
const qrCodeLink = ref('');
const hasAccess = ref(false);
const inputAccessCode = ref('');
const accessError = ref(false);
const isOwner = ref(false);
const shareEmail = ref('');
const id = route.params.id;

async function fetchBox(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/boxes/${id}`);
    box.value = await response.json();
    const loggedInEmail = localStorage.getItem('email');
    isOwner.value = (loggedInEmail === box.value.email);
    if (box.value.public || isOwner.value) hasAccess.value = true;
    fileLink.value = `/src/form_data/${box.value.filePath}`;
    qrCodeLink.value = `/src/qr_codes/${box.value.id}_label.png`;
    if (hasAccess.value && box.value.filePath && box.value.type === 'list') {
      await fetchFileContent(box.value.filePath);
    }
  } catch (error) {
    console.error('Error fetching box:', error);
  }
}

function goToEditView() {
  router.push(`/edit-box/${box.value.id}`);
}

async function fetchFileContent(filePath) {
  try {
    const response = await fetch(`http://localhost:3001/api/list?path=${filePath}`);
    const text = await response.text();
    fileContent.value = text.split('\n');
  } catch (error) {
    console.error('Error fetching file content:', error);
  }
}

function checkAccessCode() {
  if (inputAccessCode.value === box.value.access_code) {
    hasAccess.value = true;
    accessError.value = false;
    if (box.value.type === 'list') fetchFileContent(box.value.filePath);
  } else {
    accessError.value = true;
  }
}

async function shareBox() {
  try {
    if (!shareEmail.value) return alert('Please enter an email address to share the box.');
    const shareData = { access_code: box.value.access_code, email: shareEmail.value, url: window.location.href };
    const response = await fetch('http://localhost:3001/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shareData)
    });
    if (response.ok) {
      alert('Box shared successfully!');
      shareEmail.value = '';
    }
  } catch (error) {
    console.error('Error sharing box:', error);
  }
}

function printQRCode() {
  const qrCodeImage = document.querySelector('.qr-code-image');
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
  printWindow.document.write(`<img src="${qrCodeImage.src}" style="width: 100%;"/>`);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

onMounted(() => {
  fetchBox(id);
});
</script>

<style scoped>
.box-detail-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.box-detail-card {
  max-width: 800px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.box-subtitle {
  margin-bottom: 20px;
  color: #666;
}

.qr-code-image {
  width: 100%;
  max-width: 300px;
  margin: 20px 0;
}

.edit-section, .qr-share-section, .share-section {
  margin-bottom: 30px;
}

.uploaded-image {
  width: 100%;
  margin: 20px 0;
}

.v-btn {
  margin-top: 10px;
}

.access-section, .content-section {
  margin-top: 20px;
}
</style>