<template>
  <div class="my-boxes">
    <AppNavbar />
    <h1>My Boxes</h1>
    <p>Here you can see all your boxes</p>

    <v-container>
      <v-row>
        <v-col
          v-for="(box, index) in boxes"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >

          <v-card @click="goToBox(box.id)" class="box-card" outlined>
            <v-card-title class="box-title">{{ box.title }}</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const boxes = ref([]);
const router = useRouter();

async function fetchBoxes() {
  const email = localStorage.getItem('email'); 
  const role = localStorage.getItem('role');   
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('http://localhost:3001/api/boxes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Email': email,
        'User-Role': role,
      },
    });
    boxes.value = await response.json();
    
  } catch (error) {
    console.error('Error fetching boxes:', error);
  }
}


function goToBox(id) {
  router.push(`/my-boxes/${id}`);
}

onMounted(() => {
  fetchBoxes();
});
</script>

<style scoped>
.my-boxes {
  text-align: center;
}

h1 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 40px;
}

.v-container {
  display: flex;
  justify-content: center;
}

.box-card {
  cursor: pointer;
  height: 150px; 
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.box-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.box-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

</style>