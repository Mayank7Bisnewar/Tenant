import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { MessageSquare, IndianRupee, Home, Zap, Droplets, PlusCircle, Calendar, User, Settings, CheckSquare, History as HistoryIcon, Save, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBilling } from '@/context/BillingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BillData, Tenant, PaymentRecord } from '@/types/tenant';
import { HistoryView } from '@/components/HistoryView';
import { GoogleSheetsService } from '@/services/GoogleSheetsService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function Settings() {
  const {
    tenants,
    ownerInfo,
    setOwnerInfo,
    generateBillDataForTenant,
    addPaymentRecord,
    updatePaymentRecord,
    resetTenantBillData,
    messageSettings,
    setMessageSettings,
    getWhatsappLink,
  } = useBilling();
  const { toast } = useToast();

  // Selection state
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [historyTenantId, setHistoryTenantId] = useState<string | null>(null);
  const [syncingTenants, setSyncingTenants] = useState<Set<string>>(new Set());

  const handleSendClick = (tenantId: string) => {
    const data = generateBillDataForTenant(tenantId);
    if (data) {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        window.open(getWhatsappLink(tenant, data), '_blank');
        resetTenantBillData(tenantId);
      }
    }
  };

  const handleSendAndRecord = async (tenantId: string) => {
    const billData = generateBillDataForTenant(tenantId);
    if (!billData) return;

    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const billingMonth = format(billData.billingDate, 'MMMM yyyy');
    const existingPayment = tenant.paymentHistory?.find(
      record => record.billingMonth === billingMonth
    );
    const scriptUrl = GoogleSheetsService.getScriptUrl();

    window.open(getWhatsappLink(tenant, billData), '_blank');

    toast({
      title: 'WhatsApp opened',
      description: `Please click send in WhatsApp for ${tenant.name}.`,
    });

    if (existingPayment && existingPayment.syncedToSheets) {
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

    resetTenantBillData(tenantId);

    if (scriptUrl && (!existingPayment || !existingPayment.syncedToSheets)) {
      setSyncingTenants(prev => new Set(prev).add(tenantId));
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
}