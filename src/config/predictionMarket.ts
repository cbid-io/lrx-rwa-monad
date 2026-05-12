/** 单个部署仅对应一个链上 market 时，可在 `.env` 写死 `VITE_PREDICTION_MARKET_ID`（十进制字符串）。 */
export const PREDICTION_MARKET_ID_OVERRIDE = (
  import.meta.env.VITE_PREDICTION_MARKET_ID ?? ''
).trim();
