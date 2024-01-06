<template lang="pug">
.container
  h1 Books
  // render table if books are loaded, otherwise show loading message. if no books exist, show message that no books exist.
  div(v-if="books?.length")
    table
      thead
        tr
          th Title
          th Authors
          th Actions
      tbody
        tr(v-for="book in books" :key="book._id")
          td {{ book.title }}
          td {{ book.authors }}
          td
            RouterLink(:to="{ name: 'single-book', params: { id: book._id } }") View
  div(v-else)
    div(v-if="books === null") Loading...
    div(v-else) No books exist.
</template>

<script>
import { RouterLink } from 'vue-router'
import { useBooksHandler } from '../stores/books-handler'
import { mapActions } from 'pinia'

export default {
  name: 'AllBooksView',
  components: {
    RouterLink
  },
  data() {
    return {
      books: null
    }
  },
  methods: {
    ...mapActions(useBooksHandler, ['fetchAllBooks'])
  },
  async mounted() {
    this.books = await this.fetchAllBooks()
  }
}
</script>
