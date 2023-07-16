<script setup>

import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import { useIndexStore } from '../stores/useIndexStore'
import  useCollection  from '../composables/useCollection'
import Swal from 'sweetalert2'

// stores
const indexStore = useIndexStore()
const invoiceStore = useInvoiceStore()

// composable
const { updateDocument, deleteDocument } = useCollection('invoices')

const router = useRouter()
const route = useRoute()

// get invoices from firebase
await invoiceStore.getInvoicesFromFirebase()
// filter out invoice in invoices
const invoiceDetails = invoiceStore.invoices.filter(invoice => invoice.invoiceId === route.params.invoiceId)[0]


// edit invoice
const editInvoice = () => {
    indexStore.showCreateModal = true
    invoiceStore.isEdit = true
}

// delete invoice
const deleteInvoice = (id) => {
    Swal.fire({
        title: 'Are you sure you want to delete this?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDocument(id)

            router.push({ name: 'home' })
        }
    })
    
}

// mark as paid
const updateAsPaid = async (id) => {
    // update in client side
    invoiceDetails.invoiceDraft = null
    invoiceDetails.invoicePending = null
    invoiceDetails.invoicePaid = true

    // update in firebase
    await updateDocument(id, { 
        invoiceDraft: null,
        invoicePending: null,
        invoicePaid: true
     })

}

// mark as draft
const updateAsDraft = async (id) => {
    // update in client side
    invoiceDetails.invoiceDraft = true
    invoiceDetails.invoicePending = null
    invoiceDetails.invoicePaid = null

    // update in firebae
    await updateDocument(id, {
        invoiceDraft: true,
        invoicePending: null,
        invoicePaid: null,
    })

}

</script>


<template>
    <div class="container w-[799px] mx-auto ">
        <RouterLink :to="{ name: 'home' }" class="bg-purple-500 text-white rounded-md p-2 flex items-center justify-center w-16 space-x-1">
            <i class="bi bi-arrow-left-circle-fill"></i>
            <span>Back</span>
        </RouterLink>

        <!-- header -->
        <div class="flex justify-between items-center mt-10 bg-slate-800 px-2 py-4 rounded-md">
            <!-- left -->
            <div>
                <span v-if="invoiceDetails.invoicePending" :class="{ pending: invoiceDetails.invoicePending }" class="text-xs p-2 rounded-full">Pending</span>
                <span v-else-if="invoiceDetails.invoicePaid" :class="{ paid: invoiceDetails.invoicePaid }" class="text-xs p-2 rounded-full">Paid</span>
                <span v-else-if="invoiceDetails.invoiceDraft" :class="{ draft: invoiceDetails.invoiceDraft }" class="text-xs p-2 rounded-full">Draft</span>
            </div>
            <!-- right -->
            <div class="flex justify-between items-center space-x-3">
                <button 
                    @click="editInvoice"
                    class="text-xs p-2 bg-gray-700 duration-150 hover:bg-gray-800"
                >Edit</button>
                <button 
                    class="text-xs p-2 bg-red-500 duration-150 hover:bg-red-700"
                    @click="deleteInvoice(invoiceDetails.id)">Delete</button>
                <button
                    v-if="invoiceDetails.invoicePending"
                    @click="updateAsPaid(invoiceDetails.id)" class="text-xs p-2 bg-green-200 text-gray-600 hover:bg-green-400 duration-150">Mark as Paid</button>
                <button
                    v-if="!invoiceDetails.invoiceDraft && invoiceDetails.invoicePaid"
                    @click="updateAsDraft(invoiceDetails.id)"
                    class="text-xs bg-gray-600 text-white p-2 duration-150 hover:bg-gray-800"
                    >Mark as Draft</button>
            </div>
        </div>

        <!-- invoice details -->
        <div class="mt-10 bg-slate-800 p-4 rounded-md">
            <!-- top -->
            <div class="flex items-center justify-between pb-6">
                <div class="flex flex-col space-y-2">
                    <p class="text-lg">#{{ invoiceDetails.invoiceId }}</p>
                    <p class="text-gray-400">{{ invoiceDetails.productDescription }}</p>
                </div>
                <div class="flex flex-col text-sm space-y-2 text-gray-300">
                    <p>{{ invoiceDetails.billerStreetAddress }}</p>
                    <p>{{ invoiceDetails.billerCity }}</p>
                    <p>{{ invoiceDetails.billerZipCode }}</p>
                    <p>{{ invoiceDetails.billerCountry }}</p>
                </div>
            </div>
            <hr>
            <!-- middle -->
            <div class="pb-6">
                <!-- 3 col -->
                <div class="grid grid-cols-3 items-center space-y-5 pt-5">
                    <div class="flex flex-col space-y-2">
                        <h4 class="text-md">Invoice Date</h4>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.invoiceDate }}</p>
                    </div>

                    <div class="flex flex-col space-y-2">
                        <h4 class="text-md">Bill To</h4>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.clientName }}</p>
                    </div>

                    <div class="flex flex-col space-y-2">
                        <h4 class="text-md">Invoice Date</h4>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.clientEmail }}</p>
                    </div>

                    <div class="flex flex-col space-y-2">
                        <h4 class="text-md">Payment Date</h4>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.paymentDueDate }}</p>
                    </div>

                    <div class="flex flex-col space-y-1">
                        <p class="text-sm text-gray-300">{{ invoiceDetails.clientStreetAddress }}</p>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.clientCity }}</p>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.clientZipCode }}</p>
                        <p class="text-sm text-gray-300">{{ invoiceDetails.clientCountry }}</p>
                    </div>
                </div>
            </div>

            <hr>
            <!-- bottom -->
            <div class="mt-6">
                <!-- invoice table -->
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <tr>
                            <th class="px-6 py-3">Item Name</th>
                            <th class="px-6 py-3">Quantity</th>
                            <th class="px-6 py-3">Price</th>
                            <th class="px-6 py-3">Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="item in invoiceDetails.invoiceItemList" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class="px-6 py-3">{{ item.itemName }}</td>
                            <td class="px-6 py-3">{{ item.qty }}</td>
                            <td class="px-6 py-3">${{ item.price }}</td>
                            <td class="px-6 py-3">${{ item.total }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-center text-lg">Subtotal</td>
                            <td class="px-6 py-3 text-lg text-gray-200">${{ invoiceDetails.invoiceTotal }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
</template>
