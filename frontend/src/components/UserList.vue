<template>
  <div class="user-list">
    <h2>All Users</h2>
    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-1"
      @click:row="selectUser"
    >
      <template v-slot:item.email="{ item }">
        <span>{{ item.email }}</span>
      </template>
      <template v-slot:item.last_login="{ item }">
        <span>{{ formatDate(item.lastLogin) }}</span>
      </template>
      <template v-slot:item.role="{ item }">
        <span>{{ item.role }}</span>
      </template>
        <template v-slot:item.inactive="{ item }">
            <span>{{ formateAccountStatus(item.inactive) }}</span>
        </template>
        <template v-slot:item.storageUsed="{ item }">
            <span>{{ item.storageUsed }}</span>
        </template>
    </v-data-table>
    <h2>Send an email to all users!</h2>
    <div class="send-email-section">
      <v-textarea
        v-model="emailContent"
        label="Email Content"
        rows="5"
        placeholder="Enter the content of the email you want to send to all users"
      ></v-textarea>
      <v-btn color="primary" @click="sendEmails">Send Email to All Users</v-btn>
    </div>
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Account Details</v-card-title>
        <v-card-text>
          <p>Email: {{ selectedUser?.email }}</p>
          <p>Last Login: {{ formatDate(selectedUser?.lastLogin) }}</p>
          <p>Role: {{ selectedUser?.role }}</p>
          <p>Account Status: {{ formateAccountStatus(selectedUser?.inactive) }}</p>
          <p>Size: {{ selectedUser?.storageUsed }}</p>
        </v-card-text>
        <v-card-actions>
          <!-- Deactivate Account Button -->
          <v-btn color="orange" @click="deactivateAccount" v-if="selectedUser">
            Deactivate Account
          </v-btn>
          <v-btn color="primary" @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      emailContent: '',
      headers: [
        { text: 'Email', value: 'email' },
        { text: 'Last Login', value: 'last_login' },
        { text: 'Role', value: 'role' },
        { text: 'Account Status', value: 'inactive' },
        { text: 'Size', value: 'storageUsed' },
      ],
      selectedUser: null,
      dialog: false,
    };
  },
  methods: {
    async fetchUsers() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        this.users = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    formateAccountStatus(status) {
      return status ? 'Inactive' : 'Active';
    },
    selectUser(event, user) {
      this.selectedUser = user.item;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    async deactivateAccount() {
      if (this.selectedUser && this.selectedUser.email) {
        try {
          const response = await fetch('http://localhost:3001/set-inactive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.selectedUser.email, // Send the selected user's email
            }),
          });
          if (response.ok) {
            alert('Account deactivated successfully!');
            this.dialog = false; // Close the dialog after deactivation
          } else {
            alert('Failed to deactivate account.');
          }
        } catch (error) {
          console.error('Error deactivating account:', error);
        }
      }
    },
    async sendEmails() {
      const token = localStorage.getItem('token');
      const emails = this.users.map(user => user.email);
      const currentUserEmail = localStorage.getItem('email');
      const filteredEmails = emails.filter(email => email !== currentUserEmail);
      console.log(emails);
      try {
        const response = await fetch('http://localhost:3001/mail/all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            emailContent: this.emailContent,
            emails: filteredEmails,
          }),
        });

        if (response.ok) {
          alert('Emails sent successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error sending emails:', error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.user-list {
  margin: 20px;
}
</style>
