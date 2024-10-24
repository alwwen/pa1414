<template>
  <v-container>
    <v-form @submit.prevent="handleSubmit" ref="formRef">
      <v-card>
        <v-card-title>Create New Box</v-card-title>

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


        <v-card-text>
          <v-select
            v-model="selectedOption"
            :items="options"
            label="Choose type of input"
            outlined
            required
          ></v-select>
        </v-card-text>

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

        <v-card-text>
          <h3>Select Label Style</h3>
          <v-row>
            <v-col cols="4" v-for="label in labelOptions" :key="label.value">
              <div
                :class="{'selected-label': selectedLabel === label.value}"
                class="label-image-container"
                @click="selectLabel(label.value)"
              >
                <img :src="getLabelImagePath(label.value)" alt="Label Image" class="label-image">
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <h3>Select Content type:</h3>
          <v-row>
            <v-col cols="4" v-for="content in contentOptions" :key="content.value">
              <div
                :class="{'selected-content': selectedContent === content.value}"
                class="content-image-container"
                @click="selectContent(content.value)"
              >
                <img :src="getContentImagePath(content.value)" alt="Content Image" class="content-image">
              </div>
            </v-col>
          </v-row>
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
      boxTitle: '',
      selectedOption: '',
      options: [
        { title: 'List', value: 'list' },
        { title: 'Audio File', value: 'audio' },
        { title: 'Image File', value: 'image' },
      ],
      selectedLabel: '',
      selectedContent: '',
      listItems: [],
      audioFile: null,
      imageFile: null,
      isPublic: false,
      email: localStorage.getItem('email') || '', 
      labelOptions: [
        { text: 'Label 1', value: 'label1.png' },
        { text: 'Label 2', value: 'label2.png' },
        { text: 'Label 3', value: 'label3.png' },
      ],
      contentOptions: [
        { text: 'Flameable', value: 'flameable.png' },
        { text: 'Fragile', value: 'fragile.png' },
        { text: 'Radioactive', value: 'radioactive.png' },
      ],
    };
  },
  methods: {
    addNewItem() {
      this.listItems.push(''); 
    },
    getLabelImagePath(label) {
      return `/src/assets/${label}`; 
    },
    selectLabel(label) {
      this.selectedLabel = label; 
    },
    getContentImagePath(content) {
      return `/src/assets/${content}`; 
    },
    selectContent(content) {
      this.selectedContent = content; 
    },
    async handleSubmit() {
      const formData = new FormData();
      
      if (this.selectedOption === 'list') {
        
        const fileContent = this.listItems.join('\n'); 

        formData.append('title', this.boxTitle);
        formData.append('email', this.email);
        formData.append('type', this.selectedOption);
        formData.append('filename', generateRandomString(20) + '.txt');
        formData.append('fileContent', new Blob([fileContent], { type: 'text/plain' }));
        formData.append('public', this.isPublic);

      } else if (this.selectedOption === 'image') {
        
        if (this.imageFile) {
          
          formData.append('title', this.boxTitle);
          formData.append('email', this.email);
          formData.append('type', this.selectedOption);
          formData.append('filename', generateRandomString(20) + '.png'); 
          formData.append('fileContent', this.imageFile); 
          formData.append('public', this.isPublic);
        } else {
          console.error('No image file selected');
          return; 
        }
      } else if (this.selectedOption === 'audio') {
        if (this.audioFile) {
          formData.append('title', this.boxTitle);
          formData.append('email', this.email);
          formData.append('type', this.selectedOption);
          formData.append('filename', generateRandomString(20) + '.mp3'); 
          formData.append('fileContent', this.audioFile); 
          formData.append('public', this.isPublic);
        } else {
          console.error('No audio file selected');
          return; 
        }
      }
      formData.append('label', this.selectedLabel);
      formData.append('content', this.selectedContent);
      
      try {
        const response = await fetch('http://localhost:3001/api/boxes', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (response.ok) {
          const result = await response.json();
          this.$router.push(`/my-boxes`);
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
  .label-image {
  max-width: 300px;
  cursor: pointer;
}

.label-image-container {
  text-align: center;
}

.selected-label {
  border: 4px solid green;
  border-radius: 8px;
  padding: 10px;
}

.content-image {
  max-width: 300px;
  cursor: pointer;
}

.content-image-container {
  text-align: center;
}

.selected-content {
  border: 4px solid green;
  border-radius: 8px;
  padding: 10px;
}

.v-row {
  margin: 0;
  justify-content: center;
}
</style>
