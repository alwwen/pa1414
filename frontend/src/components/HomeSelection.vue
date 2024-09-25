<template>
    <div class="cards-container">
      <!-- Create New Box Card -->
      <v-card class="card-box" @click="goToCreateBox" outlined>
        <v-card-title>Create New Box</v-card-title>
        <v-card-text>Start by creating a new box for your collection.</v-card-text>
      </v-card>
  
      <!-- View My Boxes Card -->
      <v-card class="card-box" @click="goToMyBoxes" outlined>
        <v-card-title>View My Boxes</v-card-title>
        <v-card-text>View and manage all your existing boxes.</v-card-text>
      </v-card>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      goToCreateBox() {
        this.$router.push('/create-box');
      },
      goToMyBoxes() {
        this.$router.push('/my-boxes');
      },
    },
  };
  </script>
  
  <style scoped>
  .cards-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 50px;
  }
  
  .card-box {
    width: 300px;
    height: 200px;
    cursor: pointer;
    transition: 0.3s;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  .card-box:hover {
    background-color: #f0f0f0;
  }
  </style>