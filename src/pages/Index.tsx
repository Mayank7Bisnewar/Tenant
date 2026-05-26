import React, { useState, useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { motion, AnimatePresence } from 'framer-motion';
import { BillingProvider } from '@/context/BillingContext';
import { BottomNavigation } from '@/components/BottomNavigation';
import { TenantList } from '@/components/TenantList';
import { BillSummary } from '@/components/BillSummary';
import { TenantDirectory } from '@/components/TenantDirectory';
import { Home } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TenantForm, TenantFormData } from '@/components/TenantForm';
import { GoogleSheetsService } from '@/services/GoogleSheetsService';
import { useBilling } from '@/context/BillingContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

const TABS = ['tenant', 'send', 'directory',];

function AppContent() {
  const { toast } = useToast();
  const {
    addTenant,
    selectTenant,
    ownerInfo,
    setOwnerInfo,
    messageSettings,
    setMessageSettings,
  } = useBilling();
  const { user, loginWithGoogle, logout } = useAuth();

  const [activeTab, setActiveTabState] = useState('tenant');
  const [history, setHistory] = useState<string[]>(['tenant']);
  const [direction, setDirection] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localOwnerInfo, setLocalOwnerInfo] = useState(ownerInfo);
  const [localMessageSettings, setLocalMessageSettings] = useState(messageSettings);
  const [sheetsUrl, setSheetsUrl] = useState('');

  // Sync local state with context when dialog opens
  useEffect(() => {
    if (isSettingsOpen) {
      setLocalOwnerInfo(ownerInfo);
      setLocalMessageSettings(messageSettings);
      setSheetsUrl(GoogleSheetsService.getScriptUrl() || '');
    }
  }, [isSettingsOpen, ownerInfo, messageSettings]);

  const handleAddTenant = (data: TenantFormData) => {
    const newTenant = addTenant({
      name: data.name.trim(),
      roomNumber: data.roomNumber.trim(),
      mobileNumber: data.mobileNumber.trim(),
      monthlyRent: parseFloat(data.monthlyRent) || 0,
      waterBill: parseFloat(data.waterBill) || 0,
      paymentHistory: [],
      status: 'active',
    });
    selectTenant(newTenant.id);
    setIsAddOpen(false);
  };

  const handleSaveSettings = () => {
    setOwnerInfo(localOwnerInfo);
    setMessageSettings(localMessageSettings);
    GoogleSheetsService.setScriptUrl(sheetsUrl);
    setIsSettingsOpen(false);
    toast({ title: 'Settings saved successfully' });
  };

  // Custom setter to track history and direction
  const setActiveTab = useCallback((newTab: string, isBack: boolean = false) => {
    const currentIndex = TABS.indexOf(activeTab);
    const nextIndex = TABS.indexOf(newTab);

    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTabState(newTab);

    if (!isBack) {
      setHistory(prev => {
        if (prev[prev.length - 1] === newTab) return prev;
        return [...prev, newTab];
      });
    }
  }, [activeTab]);

  // Handle back button
  useEffect(() => {
    const handleBackButton = async () => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return;
      }

      if (history.length > 1) {
        const newHistory = [...history];
        newHistory.pop();
        const previousTab = newHistory[newHistory.length - 1];

        // When going back, we need to find the correct direction
        const currentIndex = TABS.indexOf(activeTab);
        const prevIndex = TABS.indexOf(previousTab);
        setDirection(prevIndex > currentIndex ? 1 : -1);

        setHistory(newHistory);
        setActiveTabState(previousTab);
      } else if (activeTab !== 'tenant') {
        setDirection(-1);
        setActiveTabState('tenant');
        setHistory(['tenant']);
      } else {
        await App.exitApp();
      }
    };

    const backButtonListener = App.addListener('backButton', () => {
      handleBackButton();
    });

    return () => {
      backButtonListener.then(l => l.remove());
    };
  }, [history, activeTab]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    const velocityThreshold = 0.5;
    const { offset, velocity } = info;

    // Reject if the swipe was primarily vertical
    if (Math.abs(offset.y) > Math.abs(offset.x)) return;

    const currentIndex = TABS.indexOf(activeTab);

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      // Swipe Left (<-) -> Next Tab
      if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1]);
      }
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      // Swipe Right (->) -> Previous Tab
      if (currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1]);
      }
    }
  };

  const renderTabContent = () => {
    const variants = {
      initial: (dir: number) => ({
        x: dir > 0 ? '100%' : '-100%',
        opacity: 0,
      }),
      animate: {
        x: 0,
        opacity: 1,
      },
      exit: (dir: number) => ({
        x: dir > 0 ? '-100%' : '100%',
        opacity: 0,
      }),
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 relative overflow-visible">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="flex-1 flex flex-col min-h-0 w-full active:cursor-grabbing"
          >
            {(() => {
              switch (activeTab) {
                case 'tenant':
                  return <TenantList onNavigateToSummary={() => setActiveTab('send')} />;
                case 'send':
                  return <BillSummary />;
                case 'directory':
                  return <TenantDirectory />;
                default:
                  return <TenantList onNavigateToSummary={() => setActiveTab('send')} />;
              }
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'tenant':
        return 'Tenants';
      case 'send':
        return 'Bill Summary';
      case 'directory':
        return 'Directory';
      default:
        return 'Tenant';
    }
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-visible">
      {/* Header */}
      <header className="flex-none bg-card border-b border-border shadow-sm safe-area-top z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
              <img src="/home-icon.png" alt="Home" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-logo text-lg font-bold text-foreground select-none tracking-[0.01em] leading-none transform scale-y-[0.85] origin-left">TENANT</h1>
              <p className="text-xs text-muted-foreground">
                {getTabTitle()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content — pb-24 keeps Send button above floating nav */}
      <main className="flex-1 flex flex-col min-h-0 overflow-visible px-2 ">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onAddClick={() => setIsAddOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Add Tenant Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm
            onSubmit={handleAddTenant}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="message">Message</TabsTrigger>
            </TabsList>

              <TabsContent value="account" className="py-2">
                <div className="space-y-4">

                  {user ? (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/50">
                      <Avatar className="h-16 w-16 border-2 border-primary/20 flex-none">
                        <AvatarImage
                          src={user.photoURL || undefined}
                          referrerPolicy="no-referrer"
                        />

                        <AvatarFallback className="bg-primary/10 text-primary">
                          <UserIcon className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0">
                        <p className="font-bold text-base text-foreground truncate">
                          {user.displayName || "User"}
                        </p>

                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>

                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Signed In
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-muted/40 border border-dashed border-border text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                      </div>

                      <div>
                        <p className="font-semibold text-foreground">
                          Not signed in
                        </p>

                        <p className="text-sm text-muted-foreground mt-1">
                          Sign in to back up your data to the cloud
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    className={`w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 text-white ${
                        user
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    onClick={() => {
                      if (user) {
                        logout();
                      } else {
                        loginWithGoogle();
                      }

                      setIsSettingsOpen(false);
                    }}
                  >
                    {user ? (
                      <LogOut className="h-4 w-4" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}

                    {user ? "Sign Out" : "Sign In with Google"}
                  </Button>

                </div>
              </TabsContent>
            <TabsContent value="profile" className="space-y-4 py-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Landlord</Label>
                  <Input
                    id="ownerName"
                    placeholder="Your name"
                    value={localOwnerInfo.name}
                    onChange={(e) => setLocalOwnerInfo({ ...localOwnerInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerMobile">Mobile Number</Label>
                  <Input
                    id="ownerMobile"
                    type="text"
                    inputMode="tel"
                    placeholder="Your mobile number"
                    value={localOwnerInfo.mobileNumber}
                    onChange={(e) => setLocalOwnerInfo({ ...localOwnerInfo, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@upi"
                    value={localOwnerInfo.upiId || ''}
                    onChange={(e) => setLocalOwnerInfo({ ...localOwnerInfo, upiId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="electricityRate">Electricity Rate (₹ per unit)</Label>
                  <Input
                    id="electricityRate"
                    type="number"
                    value={localOwnerInfo.electricityRate !== undefined ? localOwnerInfo.electricityRate : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalOwnerInfo({
                        ...localOwnerInfo,
                        electricityRate: val === '' ? undefined : parseFloat(val)
                      });
                    }}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <p className="text-[10px] text-muted-foreground italic text-center">Settings for your bill message and Google Sheets sync.</p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="sheetsUrl">Google Sheets Script URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sheetsUrl"
                      placeholder="https://script.google.com/..."
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                    />
                    {sheetsUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await GoogleSheetsService.appendRow({
                              billedDate: '01/01/2024',
                              paidDate: '01/01/2024',
                              tenantName: 'TEST',
                              roomNo: 'TEST',
                              rent: 0,
                              electricityUnits: 0,
                              electricityAmount: 0,
                              waterAmount: 0,
                              extraAmount: 0,
                              totalAmount: 0,
                              remarks: 'Connection Test',
                            });
                            toast({ title: 'Test successful! Check your sheet.' });
                          } catch (error) {
                            toast({ title: 'Test failed', variant: 'destructive' });
                          }
                        }}
                      >
                        Test
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="message" className="space-y-4 py-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headerText">Message Header</Label>
                  <Input
                    id="headerText"
                    value={localMessageSettings.headerText}
                    onChange={(e) => setLocalMessageSettings({ ...localMessageSettings, headerText: e.target.value })}
                    placeholder="HOUSE RENT BILL"
                  />
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="include-rent">Include Monthly Rent</Label>
                    <Switch
                      id="include-rent"
                      checked={localMessageSettings.includeRent}
                      onCheckedChange={(checked) => setLocalMessageSettings({ ...localMessageSettings, includeRent: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="include-elec">Include Electricity Charges</Label>
                    <Switch
                      id="include-elec"
                      checked={localMessageSettings.includeElectricity}
                      onCheckedChange={(checked) => setLocalMessageSettings({ ...localMessageSettings, includeElectricity: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="include-water">Include Water Charges</Label>
                    <Switch
                      id="include-water"
                      checked={localMessageSettings.includeWater}
                      onCheckedChange={(checked) => setLocalMessageSettings({ ...localMessageSettings, includeWater: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="include-extra">Include Extra Charges</Label>
                    <Switch
                      id="include-extra"
                      checked={localMessageSettings.includeExtra}
                      onCheckedChange={(checked) => setLocalMessageSettings({ ...localMessageSettings, includeExtra: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="include-total">Include Total Amount</Label>
                    <Switch
                      id="include-total"
                      checked={localMessageSettings.includeTotal}
                      onCheckedChange={(checked) => setLocalMessageSettings({ ...localMessageSettings, includeTotal: checked })}
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="customText">Custom Footer Message</Label>
                  <Textarea
                    id="customText"
                    placeholder="e.g., Thank you for early payment"
                    className="h-20 resize-none text-xs"
                    value={localMessageSettings.customText}
                    onChange={(e) => setLocalMessageSettings({ ...localMessageSettings, customText: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Index = () => {
  return (
    <BillingProvider>
      <AppContent />
    </BillingProvider>
  );
};

export default Index;
