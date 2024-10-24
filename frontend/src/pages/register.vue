<template>
  <div class="register">
    <div class="card">
      <h2>Register</h2>
      <form @submit.prevent="registerUser">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="text" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
          <p v-if="!isPasswordValid" class="error">Password must be at least 6 characters long and contain at least one number.</p>
        </div>
        <button type="submit" class="btn primary" :disabled="!isPasswordValid">Register</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
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
      const passwordRegex = /^(?=.*[0-9]).{6,}$/;
      return passwordRegex.test(this.password);
    },
  },
  methods: {
    async registerUser() {
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

        this.successMessage = 'Registration successful!';
        this.errorMessage = '';

        this.$router.push({ path: '/verify', query: { email: this.email } });
      } catch (error) {
        this.errorMessage = 'Registration failed. Try again.';
        this.successMessage = '';
      }
    },
  },
};
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn {
  padding: 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-family: Arial, sans-serif;
  transition: background-color 0.3s ease;
  width: 100%;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.primary:hover {
  background-color: #45a049;
}

.error {
  color: red;
  margin-top: 15px;
}

.success {
  color: green;
  margin-top: 15px;
}
</style>