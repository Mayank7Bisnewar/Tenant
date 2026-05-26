import { useLocalStorage } from './useLocalStorage';
import { MessageSettings } from '@/types/tenant';

const STORAGE_KEY = 'tenant_manager_message_settings';

const defaultSettings: MessageSettings = {
  includeRent: true,
  includeElectricity: true,
  includeWater: true,
  includeExtra: true,
  includeTotal: true,
  headerText: 'HOUSE RENT BILL',
  customText: 'Please ensure the surroundings and toilets are kept clean. Let’s maintain hygiene together. Thank you.',
};

export function useMessageSettings() {
  const [messageSettings, setMessageSettings] = useLocalStorage<MessageSettings>(STORAGE_KEY, defaultSettings);

  return {
    messageSettings,
    setMessageSettings,
  };
}
