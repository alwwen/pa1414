<template>
  <div class="home">
    <!-- Redirect to home if logged in -->
    <div v-if="!isLoggedIn">
      <h2>You are not logged in</h2>
      <button @click="goToLogin">Login</button>
      <button @click="goToRegister">Register</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLoggedIn = true;
        this.$router.push('/home'); // Redirect to home if already logged in
      } else {
        this.isLoggedIn = false;
      }
    },
    goToLogin() {
      this.$router.push('/login');
    },
    goToRegister() {
      this.$router.push('/register');
    },
  },
  mounted() {
    this.checkLoginStatus();
  },
};
</script>