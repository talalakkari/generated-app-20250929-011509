import { Hono } from "hono";
import { Env } from './core-utils';
import type { DemoItem, ApiResponse, MarketData, ChartDataPoint, PriceData, UserSettingsAndAlerts } from '@shared/types';
// --- Type definitions for CoinGecko API responses ---
interface CoinGeckoBtcPriceResponse {
    bitcoin: {
        usd: number;
        usd_24h_change: number;
    };
}
interface CoinGeckoExchangeRatesResponse {
    rates: {
        [key: string]: {
            name: string;
            unit: string;
            value: number;
            type: string;
        };
    };
}
// A simple in-memory cache to avoid hitting the API too frequently.
const cache = {
    marketData: null as MarketData | null,
    lastFetch: 0,
};
const CACHE_DURATION = 60 * 1000; // 1 minute
export function userRoutes(app: Hono<{ Bindings: Env & { SENDGRID_API_KEY: string } }>) {
    // --- New StellarPulse Market Data Endpoint ---
    app.get('/api/market-data', async (c) => {
        const timeframe = c.req.query('timeframe') || '7'; // Default to 7 days
        const now = Date.now();
        if (cache.marketData && (now - cache.lastFetch < CACHE_DURATION)) {
            return c.json({ success: true, data: cache.marketData } satisfies ApiResponse<MarketData>);
        }
        try {
            const headers = { 'User-Agent': 'cloudflare-worker-fetch' };
            const btcPromise = fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', { headers });
            const audPromise = fetch('https://api.coingecko.com/api/v3/exchange_rates', { headers });
            const chartPromise = fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${timeframe}`, { headers });
            const [btcRes, audRes, chartRes] = await Promise.all([btcPromise, audPromise, chartPromise]);
            if (!btcRes.ok) throw new Error(`Failed to fetch BTC price: ${btcRes.status}`);
            if (!audRes.ok) throw new Error(`Failed to fetch exchange rates: ${audRes.status}`);
            if (!chartRes.ok) throw new Error(`Failed to fetch chart data: ${chartRes.status}`);
            const btcData = await btcRes.json<CoinGeckoBtcPriceResponse>();
            const audData = await audRes.json<CoinGeckoExchangeRatesResponse>();
            const chartData = await chartRes.json<ChartDataPoint[]>();
            const btcPrice: PriceData = { price: btcData.bitcoin.usd, change24h: btcData.bitcoin.usd_24h_change };
            const audRate = audData.rates.usd.value / audData.rates.aud.value;
            const marketData: MarketData = { btcPrice, audRate, chartData };
            cache.marketData = marketData;
            cache.lastFetch = now;
            return c.json({ success: true, data: marketData } satisfies ApiResponse<MarketData>);
        } catch (error) {
            console.error('Error fetching market data:', error);
            return c.json({ success: false, error: 'Failed to fetch market data' }, 500);
        }
    });
    // --- New StellarPulse Settings Endpoints ---
    app.get('/api/settings', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getUserSettingsAndAlerts();
        return c.json({ success: true, data } satisfies ApiResponse<UserSettingsAndAlerts>);
    });
    app.post('/api/settings', async (c) => {
        const body = await c.req.json<UserSettingsAndAlerts>();
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.updateUserSettingsAndAlerts(body);
        return c.json({ success: true, data } satisfies ApiResponse<UserSettingsAndAlerts>);
    });
    // --- New SendGrid Email Endpoint ---
    app.post('/api/send-alert-email', async (c) => {
        const { email, btcPrice, threshold } = await c.req.json<{ email: string; btcPrice: number; threshold: number }>();
        if (!c.env.SENDGRID_API_KEY) {
            console.error("SENDGRID_API_KEY is not set.");
            return c.json({ success: false, error: "Email service is not configured." }, 500);
        }
        const sendRequest = new Request("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${c.env.SENDGRID_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email }] }],
                from: { email: "alerts@stellarpulse.io", name: "StellarPulse Alerts" },
                subject: `🚨 BTC Price Alert Triggered!`,
                content: [{
                    type: "text/plain",
                    value: `Heads up! The price of Bitcoin has dropped below your threshold of $${threshold.toLocaleString()}.\n\nThe current price is $${btcPrice.toLocaleString()}.\n\n- The StellarPulse Team`,
                }],
            }),
        });
        try {
            const resp = await fetch(sendRequest);
            if (resp.ok) {
                return c.json({ success: true });
            } else {
                const errorBody = await resp.text();
                console.error("SendGrid API Error:", resp.status, errorBody);
                return c.json({ success: false, error: "Failed to send email." }, 500);
            }
        } catch (error) {
            console.error("Error sending email:", error);
            return c.json({ success: false, error: "An internal error occurred." }, 500);
        }
    });
    // --- Existing Demo Routes ---
    app.get('/api/demo', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getDemoItems();
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
    app.get('/api/counter', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getCounterValue();
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
    app.post('/api/counter/increment', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.increment();
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
}