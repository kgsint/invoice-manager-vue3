import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SingleInvoice from '../views/SingleInvoice.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/invoices/:invoiceId',
      name: 'single-invoice',
      component: SingleInvoice
    }
  ]
})

export default router
