<template lang="pug">
.container
  div(v-if="!library") Loading...
  div(v-else)
    h1 {{ library.name }}
    p Location: {{ library.location }}
    SingleLibraryMap(:coordinates="library.geometry.coordinates", :libraryName="library.name")
    p Owner:
      RouterLink(v-if="ownerUsername" :to="{ name: 'profile', params: { username: ownerUsername } }") {{ ownerUsername }}
    // if logged in user is not the owner and is not a member, show the join button
    button(v-if="isLoggedIn && !isOwner && !isUserMember" @click="join") Join
    // if not the owner and is a member, show the leave button
    button(v-if="isLoggedIn && !isOwner && isUserMember" @click="leave") Leave
    // if is the owner, show management buttons
    div(v-if="isLoggedIn && isOwner")
      RouterLink(:to="{name: 'add-book', params: {id: this.$route.params.id}}") Add New Book
      br
      RouterLink(:to="{name: 'edit-library', params: {id: this.$route.params.id}}") Edit Library
    h2 Members
    ul
      li(v-for="member in library.members" :key="member._id")
        RouterLink(:to="{ name: 'profile', params: { username: member.username } }") {{ member.username }}
    h2 Books
    table
      thead
        tr
          th Title
          th Status
          th(v-if="isLoggedIn && isUserMember") Action
      tbody
        tr(v-for="book in library.books" :key="book._id")
          td
            RouterLink(:to="{ name: 'single-book', params: { id: book._id } }") {{ book.title }}
          td
            span(v-if="book.status === 'borrowed'") Borrowed by {{ book.borrower.username }} until {{ book.returnDate }}
            span(v-else) {{ book.status }}
          td(v-if="isLoggedIn && isUserMember")
            div
              button(v-if="book.status === 'available'" @click="doBorrowOrReturn(book)") Borrow
              button(v-if="book.status === 'borrowed' && book.borrower.username === this.username" @click="doBorrowOrReturn(book)") Return
              button(v-if="isOwner" @click="doRemoveBook(book)") Remove from library
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'
import { useLoansHandler } from '../stores/loans-handler'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions, mapState } from 'pinia'
import SingleLibraryMap from '../components/SingleLibraryMap.vue'

export default {
  name: 'SingleLibraryView',
  data() {
    return {
      library: null // init with null for clearer conditional checks
    }
  },
  components: {
    RouterLink,
    SingleLibraryMap
  },
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn']),
    ownerUsername() {
      return this.library.owner ? this.library.owner.username : null
    },
    ...mapState(useAccountStore, ['isLoggedIn', 'username']),
    isUserMember() {
      return (
        this.library &&
        this.library.members.some((member) => member.username === this.username)
      )
    },
    isOwner() {
      return this.isOwnerOfLibrary(this.library._id)
    }
  },
  async mounted() {
    this.library = await this.fetchLibrary(this.$route.params.id)
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibraryHandler, [
      'fetchLibrary',
      'joinLibrary',
      'leaveLibrary'
    ]),
    ...mapActions(useLoansHandler, ['borrowBook', 'returnBook']),
    ...mapActions(useAccountStore, ['isOwnerOfLibrary']),
    ...mapActions(useLibrarianHandler, ['removeBook']),
    async join() {
      await this.joinLibrary(this.$route.params.id)
      this.library.members.push({ _id: this.username, username: this.username })
      this.fetchUser()
    },
    async leave() {
      await this.leaveLibrary(this.$route.params.id)
      this.library.members = this.library.members.filter(
        (member) => member.username !== this.username
      )
      this.fetchUser()
    },
    async doBorrowOrReturn(book) {
      if (book.status === 'borrowed') {
        await this.returnBook(this.library._id, book._id)
      } else {
        await this.borrowBook(this.library._id, book._id)
      }
      this.library = await this.fetchLibrary(this.$route.params.id)
      this.fetchUser()
    },
    async doRemoveBook(book) {
      await this.removeBook({
        libraryId: this.$route.params.id,
        bookId: book._id
      })

      this.library.books = this.library.books.filter((b) => b._id !== book._id)
    }
  }
}
</script>

<style scoped lang="scss">
.available {
  color: green;
}

.unavailable {
  color: red;
  text-decoration: line-through;
}
</style>
