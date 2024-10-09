<template>
    <div>
      <h2>User Profile</h2>
      <button @click="login">Log in</button>
      <pre v-if="isAuthenticated">
          <code>{{ user }}</code>
        </pre>
        <code>{{ isAuthenticated }}</code>
        <div>
            <button @click="logout">Log out</button>
        </div>
    </div>
  </template>
  <script>
    import { useAuth0 } from '@auth0/auth0-vue';
    
    export default {
      setup() {
        const { loginWithRedirect, user, isAuthenticated, logout } = useAuth0();
  
        return {
          login: () => {
            loginWithRedirect();
          },
          logout: () => {
            logout({ logoutParams: { returnTo: window.location.origin } });
        },
          user,
          isAuthenticated
        };
      }
    };
  </script>