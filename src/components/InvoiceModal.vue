<script setup>

import { ref, reactive } from 'vue'
import useCollection from '../composables/useCollection'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import { useIndexStore } from '../stores/useIndexStore';
import { uid } from 'uid'
import Spinner from './Spinner.vue'
import { useRoute, useRouter } from 'vue-router';

const indexStore = useIndexStore() // pinia global state
const invoiceStore = useInvoiceStore() // invoice store

const route = useRoute()
const router = useRouter()

// close this form when click the overlay or cancel button
const closeForm = async () => {
    if(invoiceStore.isEdit) {
        router.go()
    }

    indexStore.showCreateModal = false

    invoiceStore.isEdit = false // reset just in case
    
}

// from composable
const { addDocument, updateDocument, loading } = useCollection('invoices') 


// form attributes
let form = reactive({
        billerStreetAddress: null,
        billerCity: null,
        billerZipCode: null,
        billerCountry: null,
        clientName: null,
        clientEmail: null,
        clientStreetAddress: null,
        clientCity: null,
        clientZipCode: null,
        clientCountry: null,
        invoiceDate: null,
        paymentTerms: null,
        paymentDueDate: null,
        productDescription: null,
        invoicePaid: null,
        invoicePending: null,
        invoiceDraft: null,
        invoiceItemList: [],
        invoiceTotal: 0,
})

// if is edit, populate the form
let invoiceDetails = invoiceStore.invoices.filter(invoice => invoice.invoiceId === route.params.invoiceId)[0]
if(invoiceStore.isEdit) {
    await invoiceStore.getInvoicesFromFirebase()
    
    form = invoiceDetails

    // console.log(invoiceDetails)
}

// set date in invoice date
let invoiceDateUnix = ref(null)
invoiceDateUnix = Date.now()
form.invoiceDate = new Date(invoiceDateUnix).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
})

// set date in payment due date
let paymentDueDateUnix = ref(null)
// watch changes in payment terms and update payment due date
const updatePaymentDueDate = () => {
    const date = new Date()
    paymentDueDateUnix = date.setDate(date.getDate() + parseInt(form.paymentTerms))

    form.paymentDueDate = new Date(paymentDueDateUnix).toLocaleString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

// add item to invoice list array
const addNewInvoiceItem = () => {
    form.invoiceItemList.push({
        id: uid(4),
        itemName: '',
        qty: '',
        price: 0,
        total: 0
    })
}

// remove inoice item from invoice list
const removeInvoiceItem = (id) => {
    form.invoiceItemList = form.invoiceItemList.filter(item => item.id !== id)
}


// save as draft 
const saveDraft = async() => {
    form.invoiceDraft = true
    form.invoiceTotal = 0

    form.invoiceItemList.forEach(item => form.invoiceTotal += item.total) // calculate invoice total

    // add document to firestore
    await addDocument({ invoiceId: uid(6), ...form })

    // close form
    closeForm()
    router.go()
}



// submit from
const handleSubmit = async () => {

    if(!form.invoiceItemList.length) {
        alert('Invoice items cannot be empty!')
        return
    }

    form.invoiceTotal = 0

    form.invoiceItemList.forEach(item => form.invoiceTotal += item.total) // calculate invoice total
    
    form.invoicePending = true // set invoice pending to true

    if(invoiceStore.isEdit) {
        form.invoiceDraft = null
        await updateDocument(invoiceDetails.id, { invoiceId: invoiceDetails.invoiceId, ...form})

        // reset state and refetch data
        invoiceStore.isEdit = false
        indexStore.showCreateModal = false
       
        return;
    }else {
        await addDocument({ invoiceId: uid(6), ...form }) // add document to firestore collection
        // reload to update data
        closeForm()
        router.go()
    }

}



</script>


<template>
    <div 
        @click.self="closeForm"
        class="fixed z-10 top-0 left-0 w-full min-h-screen flex flex-col"
    >
    
    
    <Spinner v-if="loading" />      
    <form 
    @submit.prevent="handleSubmit" 
    class="absolute bg-slate-800 p-5 rounded-md space-y-12 h-full overflow-y-auto shadow-lg"
    >

    <h1 class="text-xl border-b border-gray-400 pb-6" v-if="!invoiceStore.isEdit">New Invoice</h1>
    <h1 class="text-xl border-b border-gray-400 pb-6" v-else>Edit Invoice</h1>
    
    
            <!-- bill from -->
            <div class="flex flex-col space-y-3 border-b border-gray-200 pb-6">
                <h4 class="font-bold">Bill From</h4>
                <div class="flex flex-col">
                    <label 
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
                        for="billerStreetAddress"
                    >
                        Billers' address
                    </label>
                    <input 
                        type="text" 
                        class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        id="billerStreetAddress" 
                        v-model="form.billerStreetAddress" 
                        required
                    >
                </div>

                <div class="grid space-x-3 grid-cols-3">
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
                            for="billerCity"
                        >
                            Biller's City
                        </label>
                        <input 
                            type="text"
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            id="billerCity" 
                            v-model="form.billerCity" 
                            required
                        >
                    </div>
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
                            for="billerZipCode"
                        >
                            Biller's ZipCode
                        </label>
                        <input 
                            type="text"
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            id="billerZipCode" 
                            v-model="form.billerZipCode" 
                            required
                        >
                    </div>
                    <div class="flex flex-col">
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="billerCountry">Biller's Country</label>
                        <input 
                            type="text"
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            id="billerCountry" 
                            v-model="form.billerCountry" 
                            required
                        >
                    </div>
                </div>
            </div>

            <!-- bill to -->
            <div class="flex flex-col space-y-3 border-b border-gray-200 pb-6">
                <h4 class="font-bold text-gray-300">Bill to</h4>

                <div class="flex flex-col">
                    <label 
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        for="clientName">Client's name</label>
                    <input 
                        class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        type="text" 
                        id="clientName" 
                        v-model="form.clientName" required>
                </div>
                <div class="flex flex-col">
                    <label 
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        for="clientEmail">Client's email</label>
                    <input 
                        type="text"
                        class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        id="clientEmail" 
                        v-model="form.clientEmail" required>
                </div>
                <div class="flex flex-col">
                    <label 
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        for="clientStreetAddress">Client's Street Address</label>
                    <input 
                        class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        type="text" 
                        id="clientStreetAddress" 
                        v-model="form.clientStreetAddress" required>
                </div>
                <div class="grid grid-cols-3 space-x-3">
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            for="clientCity">Client's City</label>
                        <input 
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text" 
                            id="clientCity" 
                            v-model="form.clientCity" required>
                    </div>
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            for="clientZipCode">Client's ZipCode</label>
                        <input 
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text" 
                            id="clientZipCode" 
                            v-model="form.clientZipCode" required>
                    </div>
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            for="clientCountry">Client's Country</label>
                        <input 
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text" 
                            id="clientCountry" 
                            v-model="form.clientCountry" required>
                    </div>
                </div>
            </div>

            <!-- invoice work details -->
            <div class="flex flex-col border-b space-y-3 border-gray-200 pb-6">
                <div class="grid grid-cols-2 space-x-3">
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
                            for="invoiceDate">Invoice Date</label>
                        <input 
                            class=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text" id="invoiceDate" v-model="form.invoiceDate" disabled />
                    </div>
                    <div class="flex flex-col">
                        <label 
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
                            for="paymentDueDate">Payment due date</label>
                        <input 
                            
                            class=" text-sm rounded
                            d-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text" id="paymentDueDate" v-model="form.paymentDueDate" disabled />
                    </div>
                </div>

                <div class="flex flex-col">
                    <label 
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Payment's terms</label>

                    <select 
                        @change="updatePaymentDueDate"
                        class=" 
                        text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block 
                        w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        v-model="form.paymentTerms" 
                        required
                    >
                        <option value="30" :selected="form.paymentTerms == '30'" selected>Net 30 Days</option>
                        <option value="60" :selected="form.paymentTerms == '60'">Net 60 Days</option>
                    </select>
                </div>
                <div class="flex flex-col border-b border-gray-200 pb-5">
                    <label 
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
                        for="productDescription">Product Description</label>
                    <input 
                        class="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        type="text" 
                        id="productDescription" 
                        v-model="form.productDescription" 
                        required 
                    />
                </div>
                <div>
                    <h3 class="text-lg px-3 mt-4">Item List</h3>
                    <table class="table w-full">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-2 py-2">Item Name</th>
                                <th class="px-2 py-2">Quantity</th>
                                <th class="px-2 py-2">Price</th>
                                <th class="px-2 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in form.invoiceItemList" :key="index" class="space-x-6">
                                <td class="px-2 py-2">
                                    <input class="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="text" v-model="item.itemName">
                                </td>                                
                                <td class="px-2 py-2">
                                    <input class="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="text" v-model="item.qty">
                                </td>
                                <td class="px-2 py-2">
                                    <input class="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="text" v-model="item.price">
                                </td>
                                <td class="px-2 py-2">
                                    ${{ item.total = item.price * item.qty }}
                                </td>
                                <td class="px-2 py-2">
                                    <img 
                                        @click="removeInvoiceItem(item.id)" 
                                        class="cursor-pointer p-2 bg-gray-200 hover:bg-gray-500 rounded-md duration-150"
                                        src="../assets/icons/icon-delete.svg" 
                                        alt="delete icon"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div 
                        @click="addNewInvoiceItem" 
                        class="flex justify-center items-center bg-slate-900 p-2 rounded-md space-x-1 cursor-pointer hover:bg-slate-700 duration-150 mt-6"
                    >
                        <!-- <img src="../assets/icons/icon-plus.svg" alt="plus icon" class=""> -->
                        <i class="bi bi-plus-circle"></i>
                        <span class="text-xs">Add new item</span>
                    </div>
                </div>
            </div>

            <!-- Save /Cancel btns -->
            <div class="flex justify-between">
                <div class="space-x-3">
                    <button 
                        :disabled="loading"
                        @click="publishInvoice"
                        class="bg-purple-700 w-28 p-2 rounded-full space-x-1 cursor-pointer hover:bg-purple-600 duration-300"
                    >
                        Save
                    </button>
                    <button 
                        v-if="!invoiceStore.isEdit"
                        type="button"
                        @click="saveDraft"
                        class="bg-slate-700 w-28 p-2 rounded-full space-x-1 cursor-pointer hover:bg-slate-600 duration-300"
                    >
                        Draft
                    </button>
                </div>

                <button 
                    type="button"
                    @click="closeForm"
                    class="bg-red-400 w-28 p-2 rounded-full space-x-1 cursor-pointer hover:bg-red-600 duration-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
</template>


<style scoped></style>