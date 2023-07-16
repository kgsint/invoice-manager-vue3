<script setup>

import { computed, ref } from 'vue';
import { useIndexStore } from '../stores/useIndexStore'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import InvoiceList from '../components/InvoiceList.vue'

const indexStore = useIndexStore()
const invoiceStore = useInvoiceStore()

const currentState = ref('all')


await invoiceStore.getInvoicesFromFirebase()
// console.log(invoiceStore.invoices)

const filterMenu = ref(false)
const toggleFilterMenu = () => {
  filterMenu.value = !filterMenu.value
}

const filteredInvoices = computed(() => {
  switch(currentState.value) {
    case 'all': 
    return invoiceStore.invoices
    break

    case 'draft':
      return invoiceStore.invoices.filter(invoice => invoice.invoiceDraft)
      break

    case 'pending':
      return invoiceStore.invoices.filter(invoice => invoice.invoicePending)

      case 'paid':
        return invoiceStore.invoices.filter(invoice => invoice.invoicePaid)
  }
})

</script>

<template>
  <Suspense>
  <div class="home container w-[799px] mx-auto">
    <!-- header -->
    <div class="flex justify-between mb-10">
      <!-- left side -->
      <div class="flex flex-col">
        <h1 class="text-2xl">Invoices</h1>
        <span class="text-sm">There are {{ invoiceStore.invoices.length }} {{ invoiceStore.invoices.length > 1 ? ' invoices': ' invoice' }}</span>
      </div>
      <!-- right side -->
      <div class="flex justify-end items-center space-x-6">
        <!-- filter menu -->
        <div @click="toggleFilterMenu" class="flex items-center relative gap-1 cursor-pointer">
          <div class="space-x-2">
            <span>Filter by status</span>
            <i class="bi bi-sort-down"></i>
          </div>

          <ul v-show="filterMenu" class="absolute z-10 bg-slate-950  shadow-md text-sm space-y-4 top-7 w-full rounded-md">
            <li @click="currentState = 'all'" class="cursor-pointer hover:bg-slate-700 p-2 w-full rounded-sm duration-150 ease-in">All</li>
              <li @click="currentState = 'draft'" class="cursor-pointer hover:bg-slate-700 p-2 w-full rounded-sm duration-150 ease-in">Draft</li>
              <li @click="currentState = 'pending'" class="cursor-pointer hover:bg-slate-700 p-2 w-full rounded-sm duration-150 ease-in">Pending</li>
              <li @click="currentState = 'paid'" class="cursor-pointer hover:bg-slate-700 p-2 w-full rounded-sm duration-150 ease-in">Paid</li>
          </ul>
        </div>
        <!-- add new invoice -->
        <div @click="indexStore.showCreateModal = true" class="bg-purple-500 space-x-1 p-3 flex justify-center items-center rounded-full cursor-pointer hover:bg-purple-600 duration-300">
            <i class="bi bi-plus-circle-fill"></i>
            <span class="text-sm">New Invoice</span>
        </div>
      </div>
    </div>

    <!-- invoice lists -->
    <div v-if="invoiceStore.invoices.length">
      <InvoiceList v-for="invoice in filteredInvoices" :key="invoice.id" :invoice="invoice" />
    </div>

    <div v-else class="flex flex-col items-center">
      <img src="../assets/icons/illustration-empty.svg" alt="illustration empty">
      <p>There is no invoice at the moment. Please create one</p>
    </div>

  </div>
</Suspense>
</template>
