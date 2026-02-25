import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { MessageSquare, IndianRupee, Home, Zap, Droplets, PlusCircle, Calendar, User, Settings, CheckSquare, History, Save } from 'lucide-react';
import { useBilling } from '@/context/BillingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BillData } from '@/types/tenant';
import { HistoryView } from '@/components/HistoryView';
import { GoogleSheetsService } from '@/services/GoogleSheetsService';
import { useToast } from '@/hooks/use-toast';

export function BillSummary() {
  const {
    tenants,
    ownerInfo,
    setOwnerInfo,
    generateBillDataForTenant,
    addPaymentRecord,
    updatePaymentRecord,
  } = useBilling();
  const { toast } = useToast();

  const [localOwnerInfo, setLocalOwnerInfo] = useState(ownerInfo);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState(GoogleSheetsService.getScriptUrl());

  // Selection state
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [historyTenantId, setHistoryTenantId] = useState<string | null>(null);
  const [syncingTenants, setSyncingTenants] = useState<Set<string>>(new Set());

  // Sync local state with context when dialog opens
  React.useEffect(() => {
    if (isSettingsOpen) {
      setLocalOwnerInfo(ownerInfo);
    }
  }, [isSettingsOpen, ownerInfo]);

  const handleSaveOwnerInfo = () => {
    setOwnerInfo(localOwnerInfo);
    GoogleSheetsService.setScriptUrl(sheetsUrl);
    setIsSettingsOpen(false);
    toast({ title: 'Settings saved successfully' });
  };

  const handleRecordPayment = async (tenantId: string) => {
    const billData = generateBillDataForTenant(tenantId);
    if (!billData) return;

    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const billingMonth = format(billData.billingDate, 'MMMM yyyy');
    const existingPayment = tenant.paymentHistory?.find(
      record => record.billingMonth === billingMonth
    );
    const scriptUrl = GoogleSheetsService.getScriptUrl();

    if (existingPayment && existingPayment.syncedToSheets) {
      toast({
        title: 'Payment already recorded',
        description: `A payment for ${billingMonth} is already recorded and synced.`,
        variant: 'default'
      });
      window.open(getWhatsappLink(billData), '_blank');
      return;
    }

    let paymentRecordId = existingPayment?.id;

    if (!existingPayment) {
      const paymentRecord = {
        date: new Date().toISOString(),
        amount: billData.totalAmount,
        rentAmount: billData.monthlyRent,
        electricityAmount: billData.electricityCharges,
        waterAmount: billData.waterBill,
        extraAmount: billData.extraCharges,
        electricityUnits: billData.electricityUnits,
        billingMonth: billingMonth,
        syncedToSheets: false,
      };

      const newRecord = addPaymentRecord(tenantId, paymentRecord);
      if (newRecord) {
        paymentRecordId = newRecord.id;
      }
      toast({ title: 'Payment recorded locally' });
    }

    window.open(getWhatsappLink(billData), '_blank');

    if (scriptUrl && (!existingPayment || !existingPayment.syncedToSheets)) {
      setSyncingTenants(prev => new Set(prev).add(tenantId));
      (async () => {
        try {
          await GoogleSheetsService.appendRow({
            billedDate: format(billData.billingDate, 'dd/MM/yyyy'),
            paidDate: format(new Date(), 'dd/MM/yyyy'),
            tenantName: billData.tenantName,
            roomNo: billData.roomNumber,
            rent: billData.monthlyRent,
            electricityUnits: billData.electricityUnits,
            electricityAmount: billData.electricityCharges,
            waterAmount: billData.waterBill,
            extraAmount: billData.extraCharges,
            totalAmount: billData.totalAmount,
            remarks: '',
          });

          if (paymentRecordId) {
            updatePaymentRecord(tenantId, paymentRecordId, { syncedToSheets: true });
          }
        } catch (error) {
          console.error('Sheets sync error:', error);
          toast({
            title: 'Sync failed',
            description: `Auto-sync failed for ${billData.tenantName}. You can retry later.`,
            variant: 'destructive'
          });
        } finally {
          setSyncingTenants(prev => {
            const next = new Set(prev);
            next.delete(tenantId);
            return next;
          });
        }
      })();
    }
  };

  const toggleTenant = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTenantIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTenantIds(newSelected);
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedTenantIds(new Set(tenants.map(t => t.id)));
    } else {
      setSelectedTenantIds(new Set());
    }
  };

  const selectedTotal = useMemo(() => {
    let total = 0;
    selectedTenantIds.forEach(id => {
      const data = generateBillDataForTenant(id);
      if (data) total += data.totalAmount;
    });
    return total;
  }, [selectedTenantIds, generateBillDataForTenant]);

  const getWhatsappLink = (billData: BillData) => {
    const formattedDate = format(billData.billingDate, 'MMMM yyyy');
    let message = `Hello ${billData.tenantName},\n\n`;
    message += `Here are the bill details for ${formattedDate}:\n\n`;
    if (billData.extraCharges > 0) {
      message += `Extra Charges: ₹${billData.extraCharges.toLocaleString()}\n`;
    }
    message += `\n *Total Payable Amount: ₹${billData.totalAmount.toLocaleString()}*\n`;
    if (ownerInfo.name || ownerInfo.upiId || ownerInfo.mobileNumber) {
      message += `\n---\n`;
      if (ownerInfo.name) message += `Owner Name: ${ownerInfo.name}\n`;
      if (ownerInfo.upiId) message += `UPI ID: ${ownerInfo.upiId}\n`;
      if (ownerInfo.mobileNumber) message += `Mobile: ${ownerInfo.mobileNumber}\n`;
    }
    message += `\n*Please ensure the surroundings and toilets are kept clean. Let’s maintain hygiene together. Thank you.*`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = (billData.mobileNumber || '').replace(/\D/g, '');
    if (!phoneNumber) return ''; // Fallback
    return `whatsapp://send?phone=91${phoneNumber}&text=${encodedMessage}`;
  };

  const handleSendClick = (tenantId: string) => {
    const data = generateBillDataForTenant(tenantId);
    if (data) {
      window.open(getWhatsappLink(data), '_blank');
    }
  };

  if (tenants.length === 0) {
    return (
      <div className="py-4">
        <Card className="shadow-card border-dashed border-2">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">No tenants found</p>
            <p className="text-sm text-muted-foreground mt-1">Add tenants to generate bills</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 py-4 gap-4 overflow-hidden">
      <Card className="flex-1 flex flex-col min-h-0 shadow-card overflow-hidden">
        {/* Header - Fixed */}
        <CardHeader className="flex-none bg-gradient-to-r from-primary to-primary-dark text-primary-foreground py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CheckSquare className="w-5 h-5" />
              Select Tenants
            </CardTitle>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Owner Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
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
                      pattern="[0-9]*"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
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
                      value={localOwnerInfo.upiId}
                      onChange={(e) => setLocalOwnerInfo({ ...localOwnerInfo, upiId: e.target.value })}
                    />
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
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSaveOwnerInfo}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        {/* Action Bar - Fixed */}
        <div className="flex-none px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedTenantIds.size === tenants.length && tenants.length > 0}
              onCheckedChange={(checked) => toggleAll(checked as boolean)}
            />
            <Label htmlFor="select-all" className="cursor-pointer font-medium">Select All</Label>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {selectedTenantIds.size} selected
          </span>
        </div>

        {/* Tenant List - Scrollable Area */}
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
          {tenants.map((tenant) => {
            const billData = generateBillDataForTenant(tenant.id);
            if (!billData) return null;

            return (
              <div
                key={tenant.id}
                className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer active:bg-muted/50"
                onClick={() => toggleTenant(tenant.id, !selectedTenantIds.has(tenant.id))}
              >
                <Checkbox
                  id={`tenant-${tenant.id}`}
                  checked={selectedTenantIds.has(tenant.id)}
                  onCheckedChange={(checked) => toggleTenant(tenant.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0 grid gap-1">
                  <Label
                    htmlFor={`tenant-${tenant.id}`}
                    className="font-semibold cursor-pointer truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tenant.name}
                  </Label>
                  <div className="flex text-[10px] text-muted-foreground gap-3 uppercase font-semibold tracking-tight">
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3" /> {tenant.roomNumber}
                    </span>
                    <span className="flex items-center gap-1 text-electricity">
                      <Zap className="w-3 h-3" /> ₹{billData.electricityCharges}
                    </span>
                    <span className="flex items-center gap-1 text-water">
                      <Droplets className="w-3 h-3" /> ₹{billData.waterBill}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistoryTenantId(tenant.id);
                    }}
                  >
                    <History className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <div className="font-semibold text-primary whitespace-nowrap">
                    ₹{billData.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total & Send - Fixed Footer */}
        <div className="flex-none p-3 border-t bg-card">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground">Total Receivable</span>
            <span className="text-lg font-semibold text-foreground">₹{selectedTotal.toLocaleString()}</span>
          </div>
          <Button
            className="w-full h-10 text-sm font-semibold shadow-md bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl transition-all active:scale-[0.98]"
            disabled={selectedTenantIds.size === 0}
            onClick={() => setIsSendingModalOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send {selectedTenantIds.size} Bills
          </Button>
        </div>
      </Card>

      {/* Sending Modal */}
      <Dialog open={isSendingModalOpen} onOpenChange={setIsSendingModalOpen}>
        <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Send Bills</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Verify and send bills to WhatsApp
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {Array.from(selectedTenantIds).map(id => {
              const tenant = tenants.find(t => t.id === id);
              const data = generateBillDataForTenant(id);
              if (!tenant || !data) return null;

              const billingMonth = format(data.billingDate, 'MMMM yyyy');
              const existingPayment = tenant.paymentHistory?.find(
                record => record.billingMonth === billingMonth
              );
              const isSynced = existingPayment?.syncedToSheets;
              const isSyncing = syncingTenants.has(id);

              return (
                <div key={id} className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm border-border/50">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{tenant.name}</p>
                    <p className="text-xs text-primary font-semibold">₹{data.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isSynced ? "secondary" : "outline"}
                      onClick={() => handleRecordPayment(id)}
                      disabled={isSynced || isSyncing}
                      className={cn("h-8 rounded-lg", !isSynced && !existingPayment && "border-primary text-primary hover:bg-primary/5")}
                    >
                      {isSyncing ? (
                        <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : isSynced ? (
                        <CheckSquare className="w-4 h-4 text-green-500" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg px-4"
                      onClick={() => handleSendClick(id)}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter className="p-4 pt-2 border-t flex-none">
            <DialogClose asChild>
              <Button variant="secondary" className="w-full rounded-xl h-11">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historyTenantId} onOpenChange={(open) => !open && setHistoryTenantId(null)}>
        <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0 gap-0 [&>button]:text-primary-foreground [&>button]:hover:opacity-100">
          <DialogHeader className="flex-none bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 pb-3">
            <DialogTitle className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base font-semibold leading-tight">
                  {historyTenantId && tenants.find(t => t.id === historyTenantId)?.name}
                </p>
                <p className="text-[11px] font-medium opacity-75 mt-0.5">
                  Room {historyTenantId && tenants.find(t => t.id === historyTenantId)?.roomNumber} • Payment History
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {historyTenantId && (
              <HistoryView tenant={tenants.find(t => t.id === historyTenantId)!} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
