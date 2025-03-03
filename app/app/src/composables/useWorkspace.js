import { computed } from 'vue'
import { useAnchorWallet } from 'solana-wallets-vue'
import { Connection } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { Provider } from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import idl from '../../../target/idl/solana_twitter.json'

const programID = new PublicKey("8qveL96CokpcEbsveb5Q49aD3hvWwdCBZ5eDcHk4q4M3")
let workspace = null

export const useWorkspace = () => workspace

export const initWorkspace = () => {
    const wallet = useAnchorWallet()
    const connection = new Connection('http://127.0.0.1:8899')
    const provider = computed(() => new Provider(connection, wallet.value))
    const program = computed(() => new Program(idl, programID, provider.value))

    workspace = {
        // Provided data here...
        wallet,
        connection,
        provider,
        program,
    }
}