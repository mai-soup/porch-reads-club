<template lang="pug">
// TODO: loading indicator
.fixed-grid.has-1-cols-mobile.has-2-cols(v-if='library')
  .grid
    section.cell
      article.card
        .card-image(v-if='imgSrc')
          figure.image.is-5by3(aria-label='library image')
            img.library-card-image(:src='imgSrc', :alt='library.name')
        .card-content
          h1.title {{ library.name }}
          p.subtitle.is-6 by
            |
            RouterLink(
              :to='{ name: "profile", params: { username: ownerUsername } }'
            ) {{ ownerUsername }}
            |
            | at {{ library.location }}
          p {{ library.description }}
        .card-footer(v-if='isLoggedIn') 
          //- if logged in user is the owner, show management buttons
          template(v-if='isOwner')
            RouterLink.card-footer-item(
              :to='{ name: "add-book", params: { id: this.$route.params.id } }'
            ) Add New Book
            RouterLink.card-footer-item(
              :to='{ name: "edit-library", params: { id: this.$route.params.id } }'
            ) Edit Library
            a.card-footer-item.button.is-danger.is-inverted.is-radiusless(
              @click='handleDeletion',
              tabindex='0'
            ) Delete Library
          //- otherwise, if is not the owner
          template(v-else)
            //- if user is a member, show the leave button
            button.card-footer-item(v-if='isUserMember', @click='leave') Leave
            //- else, show the join button
            button.card-footer-item(v-else, @click='join') Join
    section.cell
      //- screen readers and tab navigation should skip it
      SingleLibraryMap(
        v-if='library.geometry',
        :coordinates='library.geometry.coordinates',
        :libraryName='library.name',
        aria-hidden='true',
        tabindex='-1'
      )
    section.cell
      h2.title.is-4 Books
      //- table to show the books in the library
      BookTable(
        :bookData='library.books',
        :isOwner='isOwner',
        :isMember='isUserMember'
      ) 
    section.cell
      h2.title.is-4 Comments
      //- form for adding comments
      article.media(v-if='isUserMember')
        .media-content
          form(@submit.prevent='doAddComment')
            .field
              label.label(for='commentText') Write a comment
              .control
                textarea#commentText.textarea(
                  v-model='commentText',
                  placeholder='Write your comment here'
                )
            .field
              .control
                button.button(type='submit') Submit
      //- if there are no comments, show a message
      small(v-if='!comments || comments.length === 0') No comments yet.
      //- otherwise, show the comments
      article.media(v-for='comment in comments', :key='comment._id')
        .media-content
          .content
            p
              strong {{ comment.author.username }}
              br
              | {{ comment.content }}
              br
              //- only members can delete their own comments, library owners can delete any comment
              button.button.is-danger.is-small.mt-2(
                v-if='isOwner || (isLoggedIn && comment.author.username === this.username)',
                @click='doDeleteComment(comment._id)'
              ) Delete
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'
import { useLoansHandler } from '../stores/loans-handler'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions, mapState } from 'pinia'
import SingleLibraryMap from '../components/SingleLibraryMap.vue'
import BookTable from '../components/BookTable.vue'
import useApiRequests from '../composables/useApiRequests'
import useDateFormatter from '../composables/useDateFormatter'

export default {
  name: 'SingleLibraryView',
  components: {
    RouterLink,
    SingleLibraryMap,
    BookTable
  },
  setup() {
    const { del } = useApiRequests()
    const { toReturnDateFormat } = useDateFormatter()
    return { del, toReturnDateFormat }
  },
  data() {
    return {
      library: null, // init with null for clearer conditional checks
      comments: null,
      imgSrc: null,
      commentText: ''
    }
  },
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn', 'username']),
    ownerUsername() {
      return this.library.owner ? this.library.owner.username : null
    },
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
    const { library, comments } = await this.fetchLibrary(this.$route.params.id)
    this.library = library
    this.comments = comments
    this.imgSrc = this.library.image
      ? `data:${this.library.image.filetype};base64,${this.library.image.data}`
      : null
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibraryHandler, [
      'fetchLibrary',
      'joinLibrary',
      'leaveLibrary',
      'addComment',
      'deleteComment'
    ]),
    ...mapActions(useLoansHandler, ['borrowBook', 'returnBook']),
    ...mapActions(useAccountStore, ['isOwnerOfLibrary']),
    ...mapActions(useLibrarianHandler, ['removeBook', 'deleteLibrary']),
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
      const { library, comments } = await this.fetchLibrary(
        this.$route.params.id
      )
      this.library = library
      this.comments = comments
    },
    async doRemoveBook(book) {
      await this.removeBook({
        libraryId: this.$route.params.id,
        bookId: book._id
      })

      this.library.books = this.library.books.filter((b) => b._id !== book._id)
    },
    async doAddComment() {
      await this.addComment(this.$route.params.id, this.commentText)
      this.commentText = ''
      const { library, comments } = await this.fetchLibrary(
        this.$route.params.id
      )
      this.library = library
      this.comments = comments
    },
    async doDeleteComment(commentId) {
      await this.deleteComment(this.$route.params.id, commentId)
      const { library, comments } = await this.fetchLibrary(
        this.$route.params.id
      )
      this.library = library
      this.comments = comments
    },
    async handleDeletion() {
      if (confirm('Are you sure you want to delete this library?')) {
        await this.del(`/libraries/${this.$route.params.id}`)
        this.$router.push({ name: 'all-libraries' })
      }
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
