'use client';

import { useState } from 'react';

interface TradingChartViewProps {
  tokenAddress?: string;
  tokenSymbol?: string;
}

const TradingChartView = ({ tokenAddress, tokenSymbol }: TradingChartViewProps) => {
  const [chartError, setChartError] = useState(false);

  if (!tokenAddress) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500">Select a token to view its trading chart</p>
        </div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-500 mb-4">Unable to load chart for {tokenSymbol}</p>
          <button 
            onClick={() => setChartError(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border bg-black">
      <iframe
        src={`https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=dark&trades=0&info=0`}
        className="w-full h-full border-0"
        title={`DexScreener chart for ${tokenSymbol || tokenAddress}`}
        onError={() => setChartError(true)}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default TradingChartView;
