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
        <p v-if="!isPasswordValid" class="error">Password must be at least 6 characters long and contain at least one number.</p>
      </div>
      <button type="submit" :disabled="!isPasswordValid">Register</button>
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
  computed: {
    isPasswordValid() {
      // Check if the password is at least 6 characters long and contains at least one number
      const passwordRegex = /^(?=.*[0-9]).{6,}$/;
      return passwordRegex.test(this.password);
    },
  },
  methods: {
    async registerUser() {
      // Check if the password is valid before proceeding
      if (!this.isPasswordValid) {
        this.errorMessage = 'Please fix the errors above.';
        this.successMessage = '';
        return;
      }

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