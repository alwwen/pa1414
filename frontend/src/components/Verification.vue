<template>
  <div class="verify">
    <div class="card">
      <h1>Verify Your Account</h1>
      <form @submit.prevent="verifyToken">
        <div class="form-group">
          <label for="token">Verification Token</label>
          <input v-model="token" type="text" id="token" required />
        </div>
        <button type="submit" class="btn primary">Verify</button>
      </form>

      <div v-if="message" class="message">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: this.$route.query.email || '',
      token: '',
      message: ''
    };
  },
  methods: {
    async verifyToken() {
      try {
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

<style scoped>
.verify {
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

h1 {
  margin-bottom: 20px;
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

.message {
  margin-top: 20px;
}

.message p {
  color: #333;
}
</style>