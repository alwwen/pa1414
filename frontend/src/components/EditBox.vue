<template>
    <v-container>
      <v-form @submit.prevent="handleSubmit" ref="formRef">
        <v-card>
          <v-card-title>Edit Box</v-card-title>
  
          <!-- Title Input Field -->
          <v-card-text>
            <v-text-field
              v-model="boxTitle"
              label="Box Title"
              placeholder="Edit the title of the box"
              outlined
              required
            ></v-text-field>
          </v-card-text>
  
          <!-- Type Selection Buttons -->
          <v-card-text>
            <h3>Select Box Type</h3>
            <v-btn
              :class="box.type === 'list' ? 'selected-type' : ''"
              @click="changeType('list')"
            >
              List
            </v-btn>
            <v-btn
              :class="box.type === 'image' ? 'selected-type' : ''"
              @click="changeType('image')"
            >
              Image
            </v-btn>
            <v-btn
              :class="box.type === 'audio' ? 'selected-type' : ''"
              @click="changeType('audio')"
            >
              Audio
            </v-btn>
          </v-card-text>
  
          <!-- Conditionally Rendered Fields Based on Type -->
          <v-card-text v-if="box.type === 'list'">
            <h3>Edit List</h3>
            <v-text-field
              v-for="(item, index) in listItems"
              :key="index"
              v-model="listItems[index]"
              label="List item"
              @keydown.enter.prevent="addNewItem"
            ></v-text-field>
            <v-btn @click="addNewItem" color="primary">Add Another Item</v-btn>
          </v-card-text>
  
          <v-card-text v-if="box.type === 'image'">
            <h3>Current Image</h3>
            <img :src="fileLink" alt="Uploaded Image" class="uploaded-image" />
            <h3>Replace Image</h3>
            <v-file-input
              v-model="imageFile"
              label="Select a new image"
              accept="image/jpeg,image/png"
              outlined
            ></v-file-input>
          </v-card-text>
  
          <v-card-text v-if="box.type === 'audio'">
            <h3>Current Audio</h3>
            <audio controls>
              <source :src="fileLink" type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
            <h3>Replace Audio</h3>
            <v-file-input
              v-model="audioFile"
              label="Select a new audio file"
              accept="audio/*"
              outlined
            ></v-file-input>
          </v-card-text>
  
          <!-- Submit Button -->
          <v-card-actions>
            <v-btn type="submit" color="success">Save Changes</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-container>
  </template>
  
  
  <script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// State variables
const box = ref({}); // Stores box data
const boxTitle = ref(''); // Stores edited box title
const listItems = ref([]); // Stores list items for list-type boxes
const fileLink = ref(''); // Stores file link for image/audio
const audioFile = ref(null); // For audio file upload
const imageFile = ref(null); // For image file upload
const originalType = ref(''); // Stores the original box type

const route = useRoute(); // Get route information to fetch box data
const id = route.params.id; // Get the box ID from the URL

// Fetch box data based on box ID
async function fetchBox(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/boxes/${id}`);
    box.value = await response.json();

    // Populate the box title and content based on type
    boxTitle.value = box.value.title;
    originalType.value = box.value.type;
    if (box.value.type === 'list') {
      // Fetch list content from the API
      await fetchFileContent(box.value.filePath);
    } else {
      // Set file link for image/audio
      fileLink.value = `/src/form_data/${box.value.filePath}`;
    }
  } catch (error) {
    console.error('Error fetching box:', error);
  }
}

// Function to change the box type
function changeType(newType) {
  box.value.type = newType;
}

// Fetch the list content if the box type is 'list'
async function fetchFileContent(filePath) {
  try {
    const response = await fetch(`http://localhost:3001/api/list?path=/home/alexanderw/pa1414/frontend/src/form_data/${filePath}`);
    const text = await response.text();
    listItems.value = text.split('\n'); // Split the file content into individual list items
    console.log('Fetched file content:', listItems.value);
  } catch (error) {
    console.error('Error fetching file content:', error);
  }
}

// Function to handle form submission (edit action)
async function handleSubmit() {
  const formData = new FormData();

  // Append title and type
  formData.append('title', boxTitle.value);
  formData.append('type', box.value.type);
  let pathEnding = ""
    if (box.value.type === 'list') {
        pathEnding = '.txt';
    } else if (box.value.type === 'image' && imageFile.value) {
        pathEnding = '.png';
    } else if (box.value.type === 'audio' && audioFile.value) {
        pathEnding = '.mp3';
    }
  if (box.value.type !== originalType.value) {
    formData.append('filename', box.value.filePath.split(".")[0] + pathEnding);
  } else {
    formData.append('filename', box.value.filePath); // Reuse the original file name
  }
  

  console.log('Box type:', box.value.type);
  console.log('Box title:', boxTitle.value);
  console.log('filePath:', box.value.filePath);
  
  // Handle based on box type
  if (box.value.type === 'list') {
    const fileContent = listItems.value.join('\n'); // Join list items into a single string
    formData.append('fileContent', new Blob([fileContent], { type: 'text/plain' }));
  } else if (box.value.type === 'image' && imageFile.value) {
    formData.append('fileContent', imageFile.value);
  } else if (box.value.type === 'audio' && audioFile.value) {
    formData.append('fileContent', audioFile.value);
  }
  
  console.log("FILE DATA:", formData.get('filename'));
  
  // Send the form data to the server
  try {
    const response = await fetch(`http://localhost:3001/api/boxes-update/${id}`, {
      method: 'POST', // Use POST method for updating the box
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include auth token
      },
    });

    if (response.ok) {
      console.log('Box updated successfully');
    } else {
      console.error('Error updating box:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add a new item to the list when editing a list-type box
function addNewItem() {
  listItems.value.push(''); // Add a blank input for a new list item
}

// Fetch the box data when the component is mounted
onMounted(() => {
  fetchBox(id);
});
</script>
  
<style scoped>
.selected-type {
  border: 2px solid green;
}

.uploaded-image {
  max-width: 300px;
  margin-bottom: 10px;
}
</style>
  