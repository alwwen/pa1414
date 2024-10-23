<template>
  <div class="cards-container">
    <!-- Create New Box Card -->
    <v-card class="card-box" @click="goToCreateBox" outlined>
      <v-card-title>Create New Box</v-card-title>
      <v-card-text>Start by creating a new box for your collection.</v-card-text>
    </v-card>

    <!-- View My Boxes Card -->
    <v-card class="card-box" @click="goToMyBoxes" outlined>
      <v-card-title>View My Boxes</v-card-title>
      <v-card-text>View and manage all your existing boxes.</v-card-text>
    </v-card>

  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue'; // Import Auth0

export default {
  setup() {
    const { user, isAuthenticated } = useAuth0(); // Get user info from Auth0
    const router = useRouter(); // Import router to navigate pages

    // Check if the user exists, if not, create one
    const checkUser = async (email) => {
      const response = await fetch('http://localhost:3001/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log("data", data);
          // Store the JWT token in localStorage
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      localStorage.setItem('token', data.token);
    };

    // onMounted lifecycle hook to check if user is authenticated
    onMounted(async () => {
      const storedUser = localStorage.getItem('email');
      if (!storedUser && isAuthenticated.value) {
        console.log("HÄR SKA DU VARA!");
        // If user is authenticated and no email is in localStorage, get email from Auth0
        const email = user.value.email;
        await checkUser(email);
      }
    });

    // Methods inside setup()
    const goToCreateBox = () => {
      router.push('/create-box');
    };

    const goToMyBoxes = () => {
      router.push('/my-boxes');
    };

    const mail = async () => {
      const response = await fetch('http://localhost:3001/mail/test');
      console.log(response);
    };

    return {
      goToCreateBox,
      goToMyBoxes,
      mail,
    };
  },
};
</script>

<style scoped>
.cards-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 50px;
}

.card-box {
  width: 300px;
  height: 200px;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.card-box:hover {
  background-color: #f0f0f0;
}
</style>