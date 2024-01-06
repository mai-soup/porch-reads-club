import { defineStore } from 'pinia'
import axios from 'axios'

export const useBooksHandler = defineStore('books-handler', {
  actions: {
    async fetchAllBooks() {
      try {
        const response = await axios.get('/books')
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async fetchBook(bookId) {
      try {
        const response = await axios.get(`/books/${bookId}`)
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
