<template lang="pug">
.bg
  .container
    header
      span.title Porch Reads Club
      nav
        RouterLink.active(to='/') Home
        RouterLink(to='/libraries') Libraries
        RouterLink(v-if='isLoggedIn' to='/books') Books
        RouterLink(v-if='!isLoggedIn' to='/login') Login
        RouterLink(v-if='!isLoggedIn' to='/signup') Sign Up
        a(v-if='isLoggedIn' @click='doLogout') Logout
    main
      h1 Porch Reads Club
      p Welcome to your online library hub!
      p
        | Simplify book management, connect with members,
        br
        | and enhance your book lending experience.
      p Dive in and explore libraries now!
      RouterLink.action-btn(to='/libraries') View Libraries
    footer Maijs Garais, 2023
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'HomeView',
  components: {
    RouterLink
  },
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn'])
  },
  methods: {
    ...mapActions(useAccountStore, ['logout']),
    async doLogout(e) {
      console.log('doLogout')
      e.preventDefault()
      await this.logout()
    }
  }
}
</script>

<style scoped lang="scss">
$text-color: rgba(255, 255, 255, 0.75);
.bg {
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url('/src/assets/landing-bg.webp');
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.5);

  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
    text-shadow: 0 0.05rem 0.1rem rgba(0, 0, 0, 0.5);

    .action-btn {
      font-weight: 700;
      transition: transform 0.4s;
      text-shadow: none;
      margin-top: 1rem;
      color: black;
      background-color: white;
      padding: 1rem;
      border-radius: 5px;
      margin-top: 1rem;
      text-decoration: none;
      display: inline-block;

      &:hover {
        transform: translate(0, -5px);
      }
    }

    header {
      margin-bottom: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 80%;

      .title {
        font-size: 1.2rem;
        font-weight: 700;
        color: $text-color;
      }

      nav {
        a,
        button {
          color: rgba(255, 255, 255, 0.5);
          padding: 0.25rem;
          text-decoration: none;
          transition: border-bottom-color 0.4s;
          border-bottom: 0.15rem solid transparent;
          border-radius: 0;
          margin-left: 1rem;
          font-weight: 700;

          &:hover {
            border-bottom-color: rgba(255, 255, 255, 0.5);
          }

          &.active {
            color: white;
            border-bottom-color: white;
          }

          &:focus {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    footer {
      margin-top: auto;
      color: $text-color;
    }

    p {
      margin-bottom: 0.7rem;
      color: $text-color;
    }

    h1 {
      margin-bottom: 1rem;
    }
  }
}
</style>
