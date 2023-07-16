import { defineStore } from "pinia"
import useCollection from "../composables/useCollection"
import { onUnmounted, ref } from "vue"
import { collection, doc, getDocs, limit, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../firebase/firebase"

export const useInvoiceStore = defineStore('invoices', {
    state: function() {
        return {
            invoices: [],
            isEdit: false,
            invoiceDetails: null
        }
    },

    getters: {

    },

    actions: {
        async getInvoicesFromFirebase() {
            const { getDocuments } = useCollection('invoices')
            
            this.invoices = await getDocuments()
        },
        async addInvoice() {
        },
        async getSingleInvoice(invoiceId) {
            const invoiceCollectionRef = collection(db, 'invoices')
            const q = query(invoiceCollectionRef, where("invoiceId", "=", invoiceId), limit(1))

            try {
                const querySnapshot = await getDocs(q)
                const doc = querySnapshot.docs[0]
                console.log(doc.data())
                return
                this.invoideDetails = doc.data()
            }catch(e) {
                throw new Error(e)
            }
        }
    }
})