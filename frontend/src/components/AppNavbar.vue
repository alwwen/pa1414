<template>
    <header class="main-header">
      <h1>MoveOut</h1>
      <button @click="logoutUser">Logout</button>
    </header>
  </template>
  
  <script>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { useRouter } from 'vue-router';

  // export default {
  //   methods: {
  //     logout() {
  //       const { logout, isAuthenticated } = useAuth0();
  //       localStorage.removeItem('token'); // Remove the token
  //       localStorage.removeItem('email'); // Remove the email
  //       if (isAuthenticated) {
  //         logout({ logoutParams: { returnTo: window.location.origin }});
  //       }
  //       this.$router.push('/'); // Redirect to login page (index)
  //     },
  //   },
  // };
  export default {
    setup() {
      const { logout, isAuthenticated } = useAuth0();
      const router = useRouter();
      const logoutUser = () => {
        localStorage.removeItem('token'); // Remove the token
        localStorage.removeItem('email'); // Remove the email
        if (isAuthenticated.value) {
          logout({ logoutParams: { returnTo: window.location.origin }});
        } else {
          router.push('/');
        }
      };
      return {
        logoutUser,
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
  }
  
  button:hover {
    background-color: #d32f2f;
  }
  </style>