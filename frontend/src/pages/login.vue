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

          // Check if the response has a 400 status code
          if (response.status === 400) {
            const errorData = await response.json();
            
            // Check if it's a specific error related to verification
            if (errorData.message === 'Account not verified') {
              // Redirect the user to the verification page with the email as a query parameter
              this.$router.push({ path: '/verify', query: { email: this.email } });
            } else {
              // Show the generic error message for 400 status
              this.errorMessage = errorData.message || 'Invalid credentials, please try again.';
            }
          } else if (!response.ok) {
            // Handle other errors (like 500 or unknown errors)
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
          this.errorMessage = error.message || 'Invalid credentials, please try again.';
        }
      },
    },
  };
  </script>
  
  <style>
  /* Add basic styling */
  .error { color: red; }
  </style>