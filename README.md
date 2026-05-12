# 艺术品 RWA 预测市场（Monad Testnet 前端预览）

React + TypeScript + Tailwind v4（Vite）+ `wagmi` / `viem` + RainbowKit。**纯前端**：数据占位与合约占位 ABI 齐备，可自行替换为 indexer / subgraph。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开控制台输出的本地地址即可。

### 环境变量（`.env`）

可复制仓库根目录的 `.env.example` 至 `.env`：

| 变量 | 含义 |
| --- | --- |
| `VITE_RPC_URL` | Monad Testnet RPC，默认官方测试网 Gateway |
| `VITE_PREDICTION_MARKET_ADDRESS` | 预测市场主合约地址（未部署时请保持零地址占位，下单按钮会禁用链上写入） |
| `VITE_TEST_USDC_ADDRESS` | 若池子使用 ERC20 USDC/MON 包装，占位后续替换 |
| `VITE_WALLETCONNECT_PROJECT_ID` | RainbowKit/Reown WalletConnect Project ID，`https://dashboard.reown.com` |

## 接入 Monad Testnet

1. 网络名称：**Monad Testnet**
2. **RPC**：`https://testnet-rpc.monad.xyz/`
3. **链 ID**：`10143`（请以官方文档为准校对）
4. **浏览器**：`https://testnet.monadexplorer.com/`
5. 原生代币：**MON**

在 MetaMask 等浏览器钱包中：**设置 → 网络 → 自定义网络**，填写以上参数即可完成手动添加。

## 水龙头

测试 MON：**Monad 官方 Discord → 水龙头 / Faucet 频道**领取（页面内亦有提示）。

## 目录结构（数据源替换提示）

| 路径 | 内容 |
| --- | --- |
| `src/mock/artworks.ts` | 3 张艺术品占位；对齐 `predictionMarket.artwork(bytes32/id)` |
| `src/mock/priceHistory.ts` | 走势图模拟序列；请以链上 Swap/Sync 日志重建 |
| `src/mock/leaderboard.ts` | 榜单数据；请以 `positions(status:SETTLED)` 聚合 |
| `src/abi/predictionMarket.ts` | 占位 ABI：`buyOutcome` / `claimRewards` / `getPoolTotals` |

## License

原型演示用途——部署前请务必重新审计 ABI、代币逻辑与风控策略。
