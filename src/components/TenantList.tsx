import React, { useState } from 'react';
import { Plus, User, Phone, Home, Droplets, IndianRupee, Pencil, Trash2, Check, X, Zap, Calendar, FileText, Contact, GripVertical, GripHorizontal, Edit2 } from 'lucide-react';
import { Contacts } from '@capacitor-community/contacts';
import { useBilling } from '@/context/BillingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tenant } from '@/types/tenant';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';

import { TenantForm, TenantFormData } from '@/components/TenantForm';

// Sub-component for individual Tenant Item to handle drag controls properly
function TenantItem({
  tenant,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  electricityUnits,
  extraCharges,
  onUpdateElectricity,
  onUpdateExtraCharges
}: {
  tenant: Tenant,
  isSelected: boolean,
  onSelect: () => void,
  onEdit: () => void,
  onDelete: () => void,
  electricityUnits: number,
  extraCharges: number,
  onUpdateElectricity: (units: number) => void,
  onUpdateExtraCharges: (amount: number) => void
}) {
  const controls = useDragControls();
  const electricityCharges = electricityUnits * 12;
  const totalAmount = tenant.monthlyRent + electricityCharges + tenant.waterBill + extraCharges;

  return (
    <Reorder.Item
      value={tenant}
      id={tenant.id}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50
      }}
      className="list-none"
    >
      <Card
        className={cn(
          'shadow-sm border-none transition-all duration-200 rounded-2xl bg-card cursor-pointer relative overflow-hidden',
          isSelected
            ? 'ring-2 ring-primary bg-primary/[0.02]'
            : 'hover:shadow-md active:scale-[0.99]'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            {/* Drag Handle - Left Side */}
            {/* Drag Handle - Left Side */}
            <div
              className="flex-none self-center p-2 -ml-2 text-primary/40 hover:text-primary transition-colors cursor-grab active:cursor-grabbing z-10 touch-none"
              onPointerDown={(e) => {
                controls.start(e);
              }}
            >
              <GripVertical className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-none",
                  isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
                )}>
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground text-base truncate leading-tight">{tenant.name}</h3>
                  {tenant.roomNumber && (
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      Room {tenant.roomNumber}
                    </p>
                  )}
                </div>
              </div>

              {!isSelected && (
                <div className="flex items-center gap-4 text-sm font-bold pl-[52px]">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Home className="w-4 h-4" /> ₹{tenant.monthlyRent.toLocaleString()}
                  </div>
                  {electricityUnits > 0 && (
                    <div className="flex items-center gap-1.5 text-electricity">
                      <Zap className="w-4 h-4" /> ₹{electricityCharges.toLocaleString()}
                    </div>
                  )}
                  {/* {extraCharges > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Plus className="w-4 h-4" /> ₹{extraCharges.toLocaleString()}
                    </div>
                  )} */}
                  {tenant.waterBill > 0 && (
                    <div className="flex items-center gap-1.5 text-water">
                      <Droplets className="w-4 h-4" /> ₹{tenant.waterBill.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-1 flex-none self-start">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/30 p-3 rounded-xl">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Mobile</p>
                      <p className="text-sm font-bold flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary" /> {tenant.mobileNumber}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Monthly Rent</p>
                      <p className="text-sm font-bold">₹{tenant.monthlyRent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                          <Zap className="w-3 h-3 text-electricity" /> Electricity Units
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Units"
                            className="w-full h-11 px-4 pr-12 rounded-xl bg-muted/30 border-none font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={electricityUnits || ''}
                            onChange={(e) => onUpdateElectricity(parseFloat(e.target.value) || 0)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {electricityUnits > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-electricity bg-electricity/10 px-1.5 py-0.5 rounded">
                              ₹{electricityCharges}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                          <Plus className="w-3 h-3 text-amber-500" /> Extra Charges
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Amount"
                            className="w-full h-11 px-4 pr-12 rounded-xl bg-muted/30 border-none font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={extraCharges || ''}
                            onChange={(e) => onUpdateExtraCharges(parseFloat(e.target.value) || 0)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {extraCharges > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              ₹{extraCharges}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                      }}
                    >
                      Generate Bill (₹{totalAmount.toLocaleString()})
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Reorder.Item>
  );
}

export function TenantList({ onNavigateToSummary }: { onNavigateToSummary?: () => void }) {
  const {
    tenants,
    addTenant,
    updateTenant,
    deleteTenant,
    selectedTenant,
    selectTenant,
    reorderTenants,
    getTenantBillingState,
    setElectricityUnits,
    setExtraCharges
  } = useBilling();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const handleAddTenant = (data: TenantFormData) => {
    const newTenant = addTenant({
      name: data.name.trim(),
      roomNumber: data.roomNumber.trim(),
      mobileNumber: data.mobileNumber.trim(),
      monthlyRent: parseFloat(data.monthlyRent) || 0,
      waterBill: parseFloat(data.waterBill) || 0,
      paymentHistory: [],
    });
    selectTenant(newTenant.id);
    setIsAddOpen(false);
  };

  const handleEditTenant = (data: TenantFormData) => {
    if (editingTenant) {
      updateTenant(editingTenant.id, {
        name: data.name.trim(),
        roomNumber: data.roomNumber.trim(),
        mobileNumber: data.mobileNumber.trim(),
        monthlyRent: parseFloat(data.monthlyRent) || 0,
        waterBill: parseFloat(data.waterBill) || 0,
      });
      setEditingTenant(null);
    }
  };

  const handleDeleteTenant = (id: string) => {
    if (selectedTenant?.id === id) {
      selectTenant(null);
    }
    deleteTenant(id);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 py-4 gap-6 overflow-hidden">
      {/* Add Tenant Button - Fixed */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="flex-none w-full gap-2 bg-primary hover:bg-primary-dark h-11 text-base font-bold shadow-md rounded-xl transition-all active:scale-[0.98]">
            <Plus className="w-5 h-5" />
            Add New Tenant
          </Button>
        </DialogTrigger>
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

      {/* Tenant List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto pt-2 pb-6 px-0.5">
        {tenants.length === 0 ? (
          <Card className="shadow-card border-dashed border-2">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No tenants added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first tenant to get started</p>
            </CardContent>
          </Card>
        ) : (
          <Reorder.Group
            axis="y"
            values={tenants}
            onReorder={reorderTenants}
            className="space-y-4"
          >
            <AnimatePresence initial={false}>
              {tenants.map((tenant) => {
                const billingState = getTenantBillingState(tenant.id);
                return (
                  <TenantItem
                    key={tenant.id}
                    tenant={tenant}
                    electricityUnits={billingState.electricityUnits}
                    extraCharges={billingState.extraCharges}
                    onUpdateElectricity={(units) => {
                      selectTenant(tenant.id);
                      setElectricityUnits(units);
                    }}
                    onUpdateExtraCharges={(amount) => {
                      selectTenant(tenant.id);
                      setExtraCharges(amount);
                    }}
                    isSelected={selectedTenant?.id === tenant.id}
                    onSelect={() => selectTenant(selectedTenant?.id === tenant.id ? null : tenant.id)}
                    onEdit={() => setEditingTenant(tenant)}
                    onDelete={() => handleDeleteTenant(tenant.id)}
                  />
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>

      {/* Edit Tenant Dialog */}
      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          {editingTenant && (
            <TenantForm
              initialData={editingTenant}
              onSubmit={handleEditTenant}
              onCancel={() => setEditingTenant(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
