<script setup>
import { useRoute } from 'vue-router'
import TheSidebar from './components/TheSidebar'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
//The solana-wallets-vue library provides VueJS components that allow the user to select a wallet provider and connect to it. It contains a button to initiate the process, a modal to select the wallet provider and a dropdown that can be used once connected to copy your address, change provider or disconnect.
import { initWallet } from 'solana-wallets-vue'
import { initWorkspace } from './composables'

const route = useRoute()

const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
]
// we set the autoConnect option to true so that it will automatically try to reconnect the user's wallet on page refresh.
initWallet({ wallets, autoConnect: true })
// We can now access the workspace data from any component of our application.
initWorkspace()

</script>

<template>
    <div class="w-full max-w-3xl lg:max-w-4xl mx-auto">

        <!-- Sidebar. -->
        <the-sidebar class="py-4 md:py-8 md:pl-4 md:pr-8 fixed w-20 md:w-64"></the-sidebar>

        <!-- Main -->
        <main class="flex-1 border-r border-l ml-20 md:ml-64 min-h-screen">
            <header class="flex space-x-6 items-center justify-between px-8 py-4 border-b">
                <div class="text-xl font-bold" v-text="route.name"></div>
            </header>
            <router-view></router-view>
        </main>
    </div>
</template>
