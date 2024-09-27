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
          <!-- Clickable Card -->
          <v-card @click="goToBox(box.id)" class="box-card" outlined>
            <v-card-title>{{ box.title }}</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const boxes = ref([]);
const router = useRouter();

// Fetch boxes from the backend
async function fetchBoxes() {
  try {
    const response = await fetch('http://localhost:3001/api/boxes');
    boxes.value = await response.json();
    console.log("Fetched boxes:", boxes.value);
  } catch (error) {
    console.error('Error fetching boxes:', error);
  }
}

// Redirect to the individual box page
function goToBox(id) {
  router.push(`/my-boxes/${id}`);
}

// Fetch boxes on component mount
onMounted(() => {
  fetchBoxes();
});
</script>

<style scoped>
.box-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.box-card:hover {
  transform: scale(1.05);
}
</style>