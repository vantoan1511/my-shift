import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/schedule',
    },
    {
      path: '/shifts',
      name: 'shifts',
      component: () => import('@/views/Shifts/ShiftView.vue')
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('@/views/Employees/EmployeesView.vue')
    },
    {
      path: '/branches',
      name: 'branches',
      component: () => import('@/views/Branches/BranchesView.vue')
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('@/views/ScheduleView.vue')
    }
  ],
})

export default router
