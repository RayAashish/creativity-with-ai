import { db, ReadMasterDB } from './db';
import { ReaderSettingsRecord, DEFAULT_SETTINGS } from '../types';

export interface ISettingsRepository {
  getSettings(): Promise<ReaderSettingsRecord>;
  updateSettings(settings: Partial<ReaderSettingsRecord>): Promise<ReaderSettingsRecord>;
}

export class DexieSettingsRepository implements ISettingsRepository {
  constructor(private database: ReadMasterDB = db) {}

  async getSettings(): Promise<ReaderSettingsRecord> {
    const found = await this.database.settings.get('current_settings');
    if (found) return found;

    // Seed default settings
    await this.database.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  async updateSettings(settings: Partial<ReaderSettingsRecord>): Promise<ReaderSettingsRecord> {
    const current = await this.getSettings();
    const updated: ReaderSettingsRecord = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    await this.database.settings.put(updated);
    return updated;
  }
}

export const settingsRepository = new DexieSettingsRepository();
