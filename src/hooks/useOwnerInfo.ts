import { useLocalStorage } from './useLocalStorage';
import { OwnerInfo } from '@/types/tenant';

const OLD_STORAGE_KEY = 'rentmate_owner';
const STORAGE_KEY = 'tenant_manager_owner';

// Migrate legacy data
if (localStorage.getItem(OLD_STORAGE_KEY) && !localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, localStorage.getItem(OLD_STORAGE_KEY)!);
  localStorage.removeItem(OLD_STORAGE_KEY);
}

const defaultOwner: OwnerInfo = {
  name: '',
  mobileNumber: '',
  upiId: '',
};

export function useOwnerInfo() {
  const [ownerInfo, setOwnerInfo] = useLocalStorage<OwnerInfo>(STORAGE_KEY, defaultOwner);

  return {
    ownerInfo,
    setOwnerInfo,
  };
}
