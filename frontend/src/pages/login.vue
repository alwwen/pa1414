<template>
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="loginUser">
        <div>
          <label for="username">Email:</label>
          <input type="text" v-model="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: '',
        errorMessage: '',
      };
    },
    methods: {
      async loginUser() {
        try {
          const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });
  
          if (!response.ok) {
            throw new Error('Login failed');
          }
  
          const data = await response.json();
          // Store the JWT token in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('email', data.email);
  
          // Clear any error message
          this.errorMessage = '';
  
          // Redirect to home or another page
          this.$router.push('/');
        } catch (error) {
          this.errorMessage = 'Invalid credentials, please try again.';
        }
      },
    },
  };
  </script>
  
  <style>
  /* Add basic styling */
  .error { color: red; }
  </style>