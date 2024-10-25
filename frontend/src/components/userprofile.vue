<template>
    <v-container>
      <v-card>
        <v-card-title>
          <h2>User Account Details</h2>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Email:</v-list-item-title>
              <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Last Login:</v-list-item-title>
              <v-list-item-subtitle>{{ lastLogin }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Role:</v-list-item-title>
              <v-list-item-subtitle>{{ role }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="deleteAccount">Delete Account</v-btn>
          <v-btn color="orange" @click="setInactive">Set Inactive</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: localStorage.getItem('email'), 
        lastLogin: '2024-10-10 12:00:00',
        role: localStorage.getItem('role'), 
      };
    },
    methods: {
        async deleteAccount() {
            const email = localStorage.getItem('email');
            try {
                const response = await fetch('http://localhost:3001/delete-account', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }) 
                });
                if (response.ok) {
                    
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                }
            } catch (error) {
                console.error(error);
            }
        },
        async setInactive() {
            const email = localStorage.getItem('email');
            try {
                const response = await fetch('http://localhost:3001/set-inactive', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }) 
                });
                if (response.ok) {
                    
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                }
            } catch (error) {
                console.error(error);
            }
        }
    },
  };
</script>

<style scoped>
.v-card {
max-width: 600px;
margin: auto;
}
</style>