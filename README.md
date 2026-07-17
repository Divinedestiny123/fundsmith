# Fundsmith 💸

**Fundsmith** is the most efficient way to batch distribute MON to multiple addresses simultaneously on the Monad network. Designed for developers, hackers, and teams building on Monad who need to quickly fund multiple wallets in one single transaction. Supports both **Monad Testnet** and **Monad Mainnet**.

## Features

- **Time-Saving**: Execute one transaction to fund dozens of wallets. Focus on building your dApp, not managing funds manually.
- **Multi-Network Support**: Seamlessly toggle between Monad Testnet and Monad Mainnet directly from the RainbowKit UI. The app dynamically adjusts balances and gas estimations based on your active network.
- **Gas Optimized**: Leverages Monad's high throughput with tightly estimated, buffered gas limits for maximum economic efficiency.
- **Safety Checks**: Connects to your wallet and instantly alerts you if you do not have enough MON to cover the batch transaction.

## Technologies Used

- **Smart Contracts:** Solidity, Hardhat, Ignition
- **Frontend:** Next.js (App Router), React, TailwindCSS
- **Web3 Integration:** Wagmi, Viem, RainbowKit

## Getting Started

### Prerequisites

- Node.js (v18+)
- MetaMask or any Web3 Wallet
- MON tokens on the Monad Testnet or Mainnet ([Testnet Faucet](https://testnet.monad.xyz/))

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Divinedestiny123/fundsmith.git
   cd fundsmith
   ```

2. **Install Smart Contract Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

4. **Run the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or 3001) in your browser.

## How to Use

1. Connect your wallet using the "Connect Wallet" button on the top right.
2. Select your desired network (**Monad Testnet** or **Monad Mainnet**) from the network dropdown.
3. Enter the recipient wallet addresses (separated by commas or new lines).
4. Enter the amount of MON you wish to send to **each** wallet.
5. Click **Batch Fund Wallets** and approve the transaction in your wallet.

## License

MIT License
