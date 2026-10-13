<template>
    <v-footer class="bg-grey-lighten-1">
      <v-row justify="center" no-gutters>
        <v-btn
          v-for="link in links"
          :key="link"
          color="white"
          variant="text"
          class="mx-2"
          rounded="xl"
        >
          {{ link }}
        </v-btn>
        <v-col class="text-center mt-4" cols="12">
          {{ new Date().getFullYear() }} — <strong>Superalgos Social Trading</strong>
          <p>© Superalgos.org 2024 | All Rights Reserved </p>

           <p> Superalgos is an open-source project run and governed by a decentralized community of contributors. 
                There is no legal entity behind the project. Our body of work lives on the Internet.</p>
        </v-col>
      </v-row>
    </v-footer>
  </template>

<script>
export default {
    name: 'Footer',
    data: () => ({
      links: [
        'Home',
        'About Us',
        'Team',
        'Services',
        'Blog',
        'Contact Us',
      ],
    }),
  }
</script>

<style>

</style>
