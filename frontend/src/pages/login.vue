<template>
  <div class="login">
    <div class="card">
      <h2>Login</h2>
      <form @submit.prevent="loginUser">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="text" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit" class="btn primary">Login</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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

        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.message === 'Account not verified') {
            this.$router.push({ path: '/verify', query: { email: this.email } });
          } else {
            this.errorMessage = errorData.message || 'Invalid credentials, please try again.';
          }
        } else if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', data.role);

        this.errorMessage = '';
        this.$router.push('/');
      } catch (error) {
        this.errorMessage = error.message || 'Invalid credentials, please try again.';
      }
    },
  },
};
</script>

<style scoped>
.login {
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
</style>