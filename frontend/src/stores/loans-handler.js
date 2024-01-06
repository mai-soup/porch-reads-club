import { defineStore } from 'pinia'
import axios from 'axios'

export const useLoansHandler = defineStore('loans-handler', {
  actions: {
    // TODO: make params objects consistently
    async borrowBook(libraryId, bookId) {
      try {
        await axios.patch(`/libraries/${libraryId}/books/${bookId}`, {
          action: 'borrow'
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async returnBook(libraryId, bookId) {
      try {
        await axios.patch(`/libraries/${libraryId}/books/${bookId}`, {
          action: 'return'
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async extendLoan(libraryId, bookId) {
      try {
        await axios.patch(`/libraries/${libraryId}/books/${bookId}`, {
          action: 'extend'
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
