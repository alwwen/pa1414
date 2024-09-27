<template>
  <div class="box-detail">
    <AppNavbar />
    <v-card class="box-detail-card" outlined>
      <v-card-title>{{ box.title }}</v-card-title>
      <v-card-subtitle>Type: {{ box.type }}</v-card-subtitle>
      <v-card-text>
        <p>Email: {{ box.email }}</p>
        <p>File link: <a :href="fileLink" target="_blank">{{ box.link }}</a></p>
        
        <!-- Display the content based on file type -->
        <div v-if="box.type === 'image'">
          <h3>Image:</h3>
          <h3>{{ fileLink }}</h3>
          <img :src='fileLink' alt="Uploaded Image" class="uploaded-image"/>
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

// Fetch a single box based on the ID in the route
async function fetchBox(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/boxes/${id}`);
    box.value = await response.json();
    console.log("Fetched box details:", box.value);
    fileLink.value = `/src/form_data/${box.value.filePath}`;
    // After fetching the box, read the file content
    if (box.value.filePath) {
      await fetchFileContent(box.value.filePath);
    }
    
    console.log("File link:", fileLink.value);
  } catch (error) {
    console.error('Error fetching box:', error);
  }
}

// Function to fetch the file content
async function fetchFileContent(filePath) {
  try {
    if (box.value.type !== 'list') {
      return; // Exit if the box is not a list
    }
    const response = await fetch(`http://localhost:3001/api/list?path=/home/alexanderw/pa1414/frontend/src/form_data/${box.value.filePath}`);
    const text = await response.text();
    fileContent.value = text.split('\n'); // Split the text into lines
    console.log("Fetched file content:", fileContent.value);
  } catch (error) {
    console.error('Error fetching file content:', error);
  }
}

// Fetch box data when component mounts
onMounted(() => {
  const id = route.params.id;
  fetchBox(id);
});
</script>

<style scoped>
.box-detail-card {
  max-width: 600px;
  margin: auto;
}
</style>