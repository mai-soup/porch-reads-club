<template lang="pug">
.container
  div(v-if="book")
    h1 {{ book.title }}
    img(:src="book.imageUrl" :alt="book.title")
    div by {{ book.authors }}

    p Found in: #[RouterLink(:to="{ name: 'single-library', params: { id: book.library._id } }") {{ book.library.name }}]
  div(v-else) Loading...
</template>

<script>
import { useBooksHandler } from '../stores/books-handler'
import { mapActions } from 'pinia'

export default {
  name: 'SingleBookView',
  data() {
    return {
      book: null
    }
  },
  methods: {
    ...mapActions(useBooksHandler, ['fetchBook'])
  },
  async mounted() {
    this.book = await this.fetchBook(this.$route.params.id)
  }
}
</script>
