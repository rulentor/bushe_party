<script setup>
import { ref } from 'vue'
const model = ref([
    {
        label: 'Меню',
        items: [
		  { label: 'Главная', icon: 'pi pi-fw pi-home', to: '/' },
		  { label: 'Заказы', icon: 'pi pi-fw pi-home', to: '/orders' },
		  { label: 'Курьеры', icon: 'pi pi-fw pi-home', to: '/delivers' },		  
		  { label: 'Журнал', icon: 'pi pi-fw pi-home', to: '/ai' },
		  { label: 'Чаты', icon: 'pi pi-fw pi-home', to: '/chat' },		  
		]

    },
])
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
