<template>
  <v-container>
    <v-form @submit.prevent="handleSubmit" ref="formRef">
      <v-card>
        <v-card-title>Create New Box</v-card-title>

        <!-- Title Input Field -->
        <v-card-text>
          <v-text-field
            v-model="boxTitle"
            label="Box Title"
            placeholder="Enter the title of the box"
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

        <!-- Selection for Input Type -->
        <v-card-text>
          <v-select
            v-model="selectedOption"
            :items="options"
            label="Choose type of input"
            outlined
            required
          ></v-select>
        </v-card-text>

        <!-- Conditional Rendering Based on Selected Option -->
        <v-card-text v-if="selectedOption === 'list'">
          <h3>Input List</h3>
          <v-text-field
            v-for="(item, index) in listItems"
            :key="index"
            v-model="listItems[index]"
            label="List item"
            @keydown.enter.prevent="addNewItem"
          ></v-text-field>
          <v-btn @click="addNewItem" color="primary">Add Another Item</v-btn>
        </v-card-text>

        <v-card-text v-if="selectedOption === 'audio'">
          <h3>Upload Audio File</h3>
          <v-file-input
            v-model="audioFile"
            label="Select audio file"
            accept="audio/*"
            outlined
            required
          ></v-file-input>
        </v-card-text>

        <v-card-text v-if="selectedOption === 'image'">
          <h3>Upload Image File</h3>
          <v-file-input
            v-model="imageFile"
            label="Select image file"
            accept="image/jpeg,image/png"
            outlined
            required
          ></v-file-input>
        </v-card-text>

        <!-- Submit Button -->
        <v-card-actions>
          <v-btn type="submit" color="success">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
// Helper function to generate random string
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default {
  data() {
    return {
      boxTitle: '', // For box title input
      selectedOption: '', // For input type selection
      options: [
        { title: 'List', value: 'list' },
        { title: 'Audio File', value: 'audio' },
        { title: 'Image File', value: 'image' },
      ],
      listItems: [], // For list input
      audioFile: null, // For audio file upload
      imageFile: null, // For image file upload
      isPublic: false, // To track whether the box is public or not
      email: localStorage.getItem('email') || '', // Email of logged in user
    };
  },
  methods: {
    addNewItem() {
      this.listItems.push(''); // Add a new blank input field for the list
    },
    async handleSubmit() {
      const formData = new FormData();
      console.log(this.selectedOption);
      if (this.selectedOption === 'list') {
        console.log("HERE????!?!?!?!??!?")
        const fileContent = this.listItems.join('\n'); // Join list items with a new line

        formData.append('title', this.boxTitle);
        formData.append('email', this.email);
        formData.append('type', this.selectedOption);
        formData.append('filename', generateRandomString(20) + '.txt');
        formData.append('fileContent', new Blob([fileContent], { type: 'text/plain' }));
        formData.append('public', this.isPublic);

      } else if (this.selectedOption === 'image') {
        console.log("YES 1");
        if (this.imageFile) {
          console.log("YES 2");
          formData.append('title', this.boxTitle);
          formData.append('email', this.email);
          formData.append('type', this.selectedOption);
          formData.append('filename', generateRandomString(20) + '.png'); // Random filename for the image
          formData.append('fileContent', this.imageFile); // Append the image file to the form data
          formData.append('public', this.isPublic);
        } else {
          console.error('No image file selected');
          return; // Exit if no image is selected
        }
      } else if (this.selectedOption === 'audio') {
        if (this.audioFile) {
          formData.append('title', this.boxTitle);
          formData.append('email', this.email);
          formData.append('type', this.selectedOption);
          formData.append('filename', generateRandomString(20) + '.mp3'); // Random filename for audio
          formData.append('fileContent', this.audioFile); // Append the audio file to the form data
          formData.append('public', this.isPublic);
        } else {
          console.error('No audio file selected');
          return; // Exit if no audio is selected
        }
      }
      console.log("FILE DATA:", formData.get('filename'));
      try {
        const response = await fetch('http://localhost:3001/api/boxes', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Box created successfully:', result);
        } else {
          console.error('Error submitting form:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>
