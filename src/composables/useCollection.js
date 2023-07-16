import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { ref } from "vue"

const useCollection = (collectionName) => {
    const error = ref('')
    const loading = ref(false)
    const docs = ref([])

    // add document to firestore
    const addDocument = async (doc) => {
        error.value = null  // reset
        loading.value = true

        try {
            await addDoc(collection(db, collectionName), doc)
        }catch(e) {
            error.value = e.message
        }

        loading.value = false

    }

    // get documents from firestore
    const getDocuments = async() => {
        error.value = null // reset
        
        try {
            const querySnapshot = await getDocs(collection(db, collectionName))

            querySnapshot.forEach(doc => {
                docs.value.push({...doc.data(), id: doc.id})
            })

            return docs

        }catch(e) {
            error.value = e.message
        }
    }

    // update
    const updateDocument = async (id, data) => {
        error.value = null
        loading.value = true

        const docRef = doc(db, collectionName, id)

        try {
            const res = await updateDoc(docRef, data)

            loading.value = false
            return res
        }catch(e) {
            error.value = e.message
            throw new Error(e)
        }
    }

    // delete
    const deleteDocument = async (id) => {
        error.value = null
        loading.value = true

        const docRef = doc(db, collectionName, id)

        try {
            const res = deleteDoc(docRef)

            return res
        }catch(e) {
            error.value = e

            throw new Error(e)
        }
    }

    return { addDocument, getDocuments, updateDocument, deleteDocument, loading, error }
}

export default useCollection