<template lang="pug">
.container
  h1 Add Book to Library
  // TODO: refactor to be same as other forms
  form(v-on:submit.prevent="onSubmit")
    // books have a title, author(s), and optional image to upload
    input(type="text" v-model="title" placeholder="Title")
    input(type="text" v-model="authors" placeholder="Authors")
    //- TODO: add image upload
    //- small(v-if="queryError") {{ queryError }}
    button(type="submit" :disabled="shouldPreventSubmission") Submit
</template>

<script>
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'

export default {
  name: 'AddBookView',
  data() {
    return {
      title: '',
      authors: ''
    }
  },
  computed: {
    // TODO: the name of this method should prob be consistent across components
    shouldPreventSubmission() {
      return !this.title || !this.authors
    }
  },
  methods: {
    ...mapActions(useLibrarianHandler, ['createBook']),
    async onSubmit() {
      if (this.shouldPreventSubmission) return

      await this.createBook({
        library: this.$route.params.id,
        title: this.title,
        authors: this.authors
      })

      this.$router.push({
        name: 'single-library',
        params: { id: this.$route.params.id }
      })
    }
  },
  watch: {
    query(value) {
      this.query = value
      this.validateQuery(value)
    }
  }
}
</script>
