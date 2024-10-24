<template>
  <header class="main-header">
    <h1>MoveOut</h1>
    <div>
      <button @click="goToHome">Home</button>
      <button v-if="isAdmin" @click="goToUserList">User List</button>
      <button v-if="isLoggedIn" @click="goToUserAccount">Account</button>
      <button v-if="isLoggedIn" @click="logoutUser">Logout</button>
    </div>
  </header>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      isAdmin: false,
      isLoggedIn: false,
    };
  },
  mounted() {
    this.checkIfLoggedIn();
    this.checkAdminRole();
    
    
    this.intervalId = setInterval(() => {
      this.checkAdminRole();
      this.checkIfLoggedIn();
    }, 1000); 
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
  methods: {
    checkAdminRole() {
      const role = localStorage.getItem('role');
      this.isAdmin = role === 'admin'; 
    },
    checkIfLoggedIn() {
      const email = localStorage.getItem('email'); 
      this.isLoggedIn = !!email; 
    },
    goToUserAccount() {
      this.$router.push('/user-account');
    },
    goToUserList() {
      this.$router.push('/user-list'); 
    },
    goToHome() {
      this.$router.push('/home'); 
    },
    logoutUser() {
      localStorage.removeItem('token'); 
      localStorage.removeItem('email');
      localStorage.removeItem('role');  
      if (this.isAuthenticated) {
        this.logout({ logoutParams: { returnTo: window.location.origin } });
      } else {
        this.$router.push('/');
      }
    },
  },
  setup() {
    const { logout, isAuthenticated } = useAuth0();
    const router = useRouter();

    return {
      logout,
      isAuthenticated,
    };
  },
};
</script>

<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #2196F3; 
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

button {
  padding: 10px 15px;
  background-color: #4CAF50; 
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #388E3C; 
}

button:active {
  background-color: #2E7D32; 
}
</style>