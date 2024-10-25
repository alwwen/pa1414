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
          <v-card-text>
            <v-switch
              v-model="isPublic"
              color="primary"
              label="Make Box Public?"
              inset
            ></v-switch>
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
import { useRoute, useRouter } from 'vue-router';
import { ro } from 'vuetify/locale';


const box = ref({}); 
const boxTitle = ref(''); 
const listItems = ref([]); 
const fileLink = ref(''); 
const audioFile = ref(null); 
const imageFile = ref(null); 
const originalType = ref(''); 
const isPublic = ref(false);

const route = useRoute(); 
const router = useRouter();
const id = route.params.id; 


async function fetchBox(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/boxes/${id}`);
    box.value = await response.json();

    
    boxTitle.value = box.value.title;
    originalType.value = box.value.type;
    isPublic.value = box.value.public;
    if (box.value.type === 'list') {
      
      await fetchFileContent(box.value.filePath);
    } else {
      
      fileLink.value = `/src/form_data/${box.value.filePath}`;
    }
  } catch (error) {
    console.error('Error fetching box:', error);
  }
}


function changeType(newType) {
  box.value.type = newType;
}


async function fetchFileContent(filePath) {
  try {
    const response = await fetch(`http://localhost:3001/api/list?path=${filePath}`);
    const text = await response.text();
    listItems.value = text.split('\n'); 
    
  } catch (error) {
    console.error('Error fetching file content:', error);
  }
}


async function handleSubmit() {
  const formData = new FormData();

  
  formData.append('title', boxTitle.value);
  formData.append('type', box.value.type);
  formData.append('public', isPublic.value);
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
    formData.append('filename', box.value.filePath); 
  }
  

  
  
  
  
  
  if (box.value.type === 'list') {
    const fileContent = listItems.value.join('\n'); 
    formData.append('fileContent', new Blob([fileContent], { type: 'text/plain' }));
  } else if (box.value.type === 'image' && imageFile.value) {
    formData.append('fileContent', imageFile.value);
  } else if (box.value.type === 'audio' && audioFile.value) {
    formData.append('fileContent', audioFile.value);
  }
  
  
  
  
  try {
    const response = await fetch(`http://localhost:3001/api/boxes-update/${id}`, {
      method: 'POST', 
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, 
      },
    });

    if (response.ok) {
      router.push(`/my-boxes/${id}`);
    } else {
      console.error('Error updating box:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


function addNewItem() {
  listItems.value.push(''); 
}


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
  