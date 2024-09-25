<template>
    <header class="main-header">
      <h1>My Application</h1>
      <button @click="logout">Logout</button>
    </header>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        localStorage.removeItem('token'); // Remove the token
        this.$router.push('/'); // Redirect to login page (index)
      },
    },
  };
  </script>
  
  <style scoped>
  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #42b983;
    color: white;
  }
  
  button {
    padding: 10px 20px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #d32f2f;
  }
  </style>