<script setup>

defineProps({
    invoice: Object
})

</script>


<template>
        <RouterLink 
        class="flex border border-white px-3 py-6 rounded-md justify-between items-center mb-6"
        :to="{ name: 'single-invoice', params: { invoiceId: invoice.invoiceId} }">

        <!-- left -->
        <div class="space-x-6">
            <span class="bg-slate-700">#{{ invoice.invoiceId }}</span>
            <span>{{ invoice.paymentDueDate }}</span>
            <span class=" italic">{{ invoice.clientName }}</span>
        </div>
        <!-- right -->
        <div class="flex space-x-3 items-center">
            <span class="text-gray-300 text-md">${{ invoice.invoiceTotal }}</span>
            <!-- status -->
            <div>
                <span v-if="invoice.invoicePending" :class="{ pending: invoice.invoicePending }" class="text-xs p-2 rounded-full">Pending</span>
                <span v-else-if="invoice.invoicePaid" :class="{ paid: invoice.invoicePaid }" class="text-xs p-2 rounded-full">Paid</span>
                <span v-else-if="invoice.invoiceDraft" :class="{ draft: invoice.invoiceDraft }" class="text-xs p-2 rounded-full">Draft</span>
            </div>
            <div>
                <i class="bi bi-arrow-right-short text-purple-600"></i>
            </div>
        </div>
    </RouterLink>

</template>


<style scoped>

</style>