<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import { ref, onBeforeMount } from 'vue'
import InvoiceModal from './components/InvoiceModal.vue'
import { useIndexStore } from './stores/useIndexStore';

let isMobile = ref(false);

// check is mobile screen or size
const checkMobileScreen = () => {
  if(window.innerWidth <= 550) {
    isMobile.value = true
  }else {
    isMobile.value = false
  }
}

onBeforeMount(() => checkMobileScreen())
window.addEventListener('resize', checkMobileScreen)

const indexStore = useIndexStore()

</script>

<template>
  <main v-if="!isMobile" class="app flex flex-col min-h-screen md:flex-row">
    <Header/>

    <Suspense>
        <div class="app-content flex flex-col flex-1 relative px-5">
        <Transition name="create-modal">
          <InvoiceModal v-if="indexStore.showCreateModal" />
        </Transition>
        
        <RouterView />
        
    </div>
    </Suspense>
  </main>

  <div v-else class="bg-slate-800 w-full grid place-items-center h-screen p-5">
    <h1 class="text-lg">This Web Application is not supported on mobile devices.</h1>
  </div>  
</template>

<style scoped>


.create-modal-enter-active,
  .create-modal-leave-active {
    transition: 0.8s ease all;
  }

  .create-modal-enter-from,
  .create-modal-leave-to {
    transform: translateX(-700px);
  }



</style>