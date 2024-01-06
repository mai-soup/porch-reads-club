<template lang="pug">
div(v-if="this.action !== 'edit' || library")
  form(@submit.prevent="doSubmit")
    div.form-group
      label(for="name") Name
      input#name(type="text" v-model="name")
      small(v-if="nameError") {{ nameError }}
    div.form-group
      label(for="location") Location
      input#location(type="text" v-model="location")
    button(type="submit" :disabled="shouldDisableSubmit") Submit
div(v-else aria-busy="true") Loading...
</template>

<script>
import axios from 'axios'
import { useAccountStore } from '../stores/account'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'

export default {
  name: 'LibraryInfoForm',
  data() {
    return {
      name: '',
      location: '',
      nameError: null,
      library: null
    }
  },
  props: ['action', 'libraryId'],
  computed: {
    shouldDisableSubmit() {
      return !this.name || this.nameError || !this.location
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibrarianHandler, ['updateLibrary', 'createLibrary']),
    async doSubmit() {
      let id

      if (this.action === 'edit') {
        id = this.$route.params.id
        await this.updateLibrary(id, this.name, this.location)
      } else {
        const { _id } = await this.createLibrary(this.name, this.location)
        id = _id
      }

      await this.fetchUser()
      this.$router.push({ name: 'single-library', params: { id } })
    },
    validateName(name) {
      if (!name) {
        this.nameError = 'Name is required'
        return
      }
      if (name.length < 5) {
        this.nameError = 'Name must be at least 5 characters'
        return
      }
      if (name.length > 40) {
        this.nameError = 'Name cannot exceed 40 characters'
        return
      }

      this.nameError = null
    }
  },
  async mounted() {
    if (this.action === 'edit') {
      this.library = (await axios.get(`/libraries/${this.libraryId}`)).data
      this.name = this.library.name
      this.location = this.library.location
    }
  },
  watch: {
    name(value) {
      this.name = value
      this.validateName(value)
    }
  }
}
</script>
