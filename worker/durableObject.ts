import { DurableObject } from "cloudflare:workers";
import type { DemoItem, UserSettingsAndAlerts } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
const DEFAULT_SETTINGS_AND_ALERTS: UserSettingsAndAlerts = {
  settings: {
    audBudget: 500000,
    transferFeePercent: 1.5,
    email: '',
  },
  alerts: [
    { id: 'alert-106k', btcThreshold: 106000, isEnabled: true },
    { id: 'alert-100k', btcThreshold: 100000, isEnabled: false },
    { id: 'alert-90k', btcThreshold: 90000, isEnabled: false },
  ],
};
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    // --- New StellarPulse Methods ---
    async getUserSettingsAndAlerts(): Promise<UserSettingsAndAlerts> {
      const data = await this.ctx.storage.get<UserSettingsAndAlerts>("user_settings_alerts");
      return data || DEFAULT_SETTINGS_AND_ALERTS;
    }
    async updateUserSettingsAndAlerts(data: UserSettingsAndAlerts): Promise<UserSettingsAndAlerts> {
      await this.ctx.storage.put("user_settings_alerts", data);
      return data;
    }
    // --- Existing Demo Methods ---
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async decrement(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value -= amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) {
        return items as DemoItem[];
      }
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = [...items, item];
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
}