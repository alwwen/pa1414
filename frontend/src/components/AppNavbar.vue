<template>
  <header class="main-header">
    <h1>MoveOut</h1>
    <div>
      <button v-if="isAdmin" @click="goToUserList">User List</button> <!-- Only show if user is admin -->
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
      isLoggedIn: false
    };
  },
  mounted() {
    this.checkAdminRole(); // Check role on mount
    this.checkIfLoggedIn();
    // Optionally, set up an interval to recheck the role periodically.
    this.intervalId = setInterval(() => {
      this.checkAdminRole();
      this.checkIfLoggedIn();
    }, 1000); // Check every second (adjust as needed)
  },
  beforeUnmount() {
    clearInterval(this.intervalId); // Clear the interval when component is unmounted
  },
  methods: {
    checkAdminRole() {
      const role = localStorage.getItem('role'); // Check role from localStorage
      this.isAdmin = role === 'admin'; // Update isAdmin if the role is 'admin'
    },
    checkIfLoggedIn() {
      const email = localStorage.getItem('email'); // Check if token exists
      this.isLoggedIn = !!email; // Update isLoggedIn based on token existence
    },
    goToUserAccount() {
      this.$router.push('/user-account'); // Navigate to the user account page
    },
    goToUserList() {
      this.$router.push('/user-list'); // Navigate to the user list page
    },
    logoutUser() {
      localStorage.removeItem('token'); // Remove the token
      localStorage.removeItem('email'); // Remove the email
      localStorage.removeItem('role');  // Remove the role
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
  padding: 10px;
  background-color: #42b983;
  color: white;
}

button {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px; /* Add some spacing between buttons */
}

button:hover {
  background-color: #d32f2f;
}
</style>
