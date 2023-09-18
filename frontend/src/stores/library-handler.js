import { defineStore } from 'pinia'
import axios from 'axios'

export const useLibraryHandler = defineStore('library-handler', {
  actions: {
    async fetchAllLibraries() {
      try {
        const response = await axios.get('/libraries')
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async fetchLibrary(libraryId) {
      try {
        const response = await axios.get(`/libraries/${libraryId}`)
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async removeCopy(libraryId, bookCopyId) {
      try {
        const response = await axios.delete(
          `/libraries/${libraryId}/copies/${bookCopyId}`
        )
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
