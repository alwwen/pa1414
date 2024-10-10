<template>
  <div class="register">
    <h2>Register</h2>
    <form @submit.prevent="registerUser">
      <div>
        <label for="username">Email:</label>
        <input type="text" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      successMessage: '',
    };
  },
  methods: {
    async registerUser() {
      try {
        const response = await fetch('http://localhost:3001/register', {
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
          throw new Error('Registration failed');
        }

        const data = await response.json();
        this.successMessage = 'Registration successful!';
        this.errorMessage = '';

        // Redirect to the verification page with the email as a parameter
        this.$router.push({ path: '/verify', query: { email: this.email } });
      } catch (error) {
        this.errorMessage = 'Registration failed. Try again.';
        console.log(error);
        this.successMessage = '';
      }
    },
  },
};
</script>

<style>
/* Add basic styling */
.error {
  color: red;
}

.success {
  color: green;
}
</style>
