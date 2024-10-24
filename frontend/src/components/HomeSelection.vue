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
import { useAuth0 } from '@auth0/auth0-vue'; 
import { useRouter } from 'vue-router'; 

export default {
  setup() {
    const { user, isAuthenticated } = useAuth0(); 
    const router = useRouter(); 

    
    const checkUser = async (email) => {
      const response = await fetch('http://localhost:3001/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      localStorage.setItem('token', data.token);
    };

    onMounted(async () => {
      const storedUser = localStorage.getItem('email');
      if (!storedUser && isAuthenticated.value) {
        const email = user.value.email;
        await checkUser(email);
      }
    });

    
    const goToCreateBox = () => {
      router.push('/create-box');
    };

    const goToMyBoxes = () => {
      router.push('/my-boxes');
    };

    return {
      goToCreateBox,
      goToMyBoxes,
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
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.card-box:hover {
  background-color: #f0f0f0;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

v-card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

v-card-text {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.cards-container .v-card {
  border: 1px solid #ddd;
}

.cards-container .v-card:hover {
  background-color: #e8f4f8;
}
</style>