<template lang="pug">
.container
  h1 Create Library
  // TODO: prevent form submission altogether if validation fails, not just through button
  LibraryInfoForm(action="create")
</template>

<script>
import LibraryInfoForm from '../components/LibraryInfoForm.vue'

export default {
  name: 'CreateLibraryView',
  components: { LibraryInfoForm },
}
</script>
