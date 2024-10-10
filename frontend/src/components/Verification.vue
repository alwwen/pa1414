<template>
    <div>
      <h1>Verify Your Account</h1>
      <form @submit.prevent="verifyToken">
        <div>
          <label for="token">Verification Token</label>
          <input v-model="token" type="text" id="token" required />
        </div>
        <button type="submit">Verify</button>
      </form>
  
      <div v-if="message">
        <p>{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: this.$route.query.email || '', // Use query here instead of params
        token: '',
        message: ''
      };
    },
    methods: {
      async verifyToken() {
        try {
          console.log("Email", this.email);
          const response = await fetch('http://localhost:3001/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.email,
              token: this.token
            })
          });
  
          if (response.ok) {
            const data = await response.json();
            this.message = 'Verification successful! You can now log in.';
          } else {
            const errorData = await response.json();
            this.message = errorData.message || 'Error verifying token. Please try again.';
          }
        } catch (error) {
          this.message = 'Error verifying token. Please try again.';
        }
      }
    }
  };
  </script>