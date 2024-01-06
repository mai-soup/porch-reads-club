<template lang="pug">
.container
  h1 Loans
  // if logged in user has any loans, show them
  div(v-if="loans?.length > 0")
    ul
      // if the loan is about to expire, add the .expiring class.
      li(v-for="loan in loans" :key="loan._id" :class="{ expiring: loan.isExpiringSoon }")
        div
          RouterLink(:to="{ name: 'single-book', params: { id: loan._id } }") {{ loan.title }}
          span Borrowed until {{ loan.returnDate }}
          button(@click="doReturn(loan)") Return
          // if the loan is due in 7 days or less, show a button to extend the loan
          button(v-if="loan.isExpiringInAWeek" @click="doExtend(loan)") Extend
  // else, if length 0, show a message. if null, show loading
  div(v-else-if="loans?.length === 0") You have no loans.
  div(v-else) Loading...
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { useLoansHandler } from '../stores/loans-handler'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'LoansView',
  components: {
    RouterLink
  },
  mounted() {
    this.fetchUser()
  },
  computed: {
    ...mapState(useAccountStore, ['loans'])
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLoansHandler, ['returnBook', 'extendLoan']),
    async doReturn(loan) {
      await this.returnBook(loan.library._id, loan._id)
      this.fetchUser()
    },
    async doExtend(loan) {
      await this.extendLoan(loan.library._id, loan._id)
      this.fetchUser()
    }
  }
}
</script>

<style scoped>
.expiring {
  color: red;
}
</style>
