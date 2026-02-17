import React, { useState } from 'react';
import { User, Home, Phone, Search, Pencil } from 'lucide-react';
import { useBilling } from '@/context/BillingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TenantForm, TenantFormData } from '@/components/TenantForm';
import { Tenant } from '@/types/tenant';

export function TenantDirectory() {
    const { tenants, updateTenant } = useBilling();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const filteredTenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.mobileNumber.includes(searchQuery)
    );

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

    return (
        <div className="flex-1 flex flex-col min-h-0 py-4 gap-4 overflow-hidden">
            {/* Header & Search - Fixed */}
            <div className="flex-none space-y-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Tenant Directory</h2>
                    <p className="text-sm text-muted-foreground font-medium">Manage and contact your residents</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, room, or mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-11 bg-card border-none shadow-sm focus-visible:ring-primary transition-all rounded-xl font-medium"
                    />
                </div>
            </div>

            {/* List - Scrollable Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {filteredTenants.length === 0 ? (
                    <Card className="border-dashed py-12 text-center text-muted-foreground bg-card/50">
                        <p className="font-medium">No tenants found matching your search.</p>
                    </Card>
                ) : (
                    filteredTenants.map((tenant) => (
                        <Card key={tenant.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card active:scale-[0.99]">
                            <CardContent className="p-0">
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-display font-bold text-lg text-foreground leading-tight">{tenant.name}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Dialog open={editingTenant?.id === tenant.id} onOpenChange={(open) => !open && setEditingTenant(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all bg-primary/5 shadow-sm"
                                                    onClick={() => setEditingTenant(tenant)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="font-display text-xl">Edit Tenant Details</DialogTitle>
                                                </DialogHeader>
                                                <TenantForm
                                                    initialData={tenant}
                                                    onSubmit={handleEditTenant}
                                                    onCancel={() => setEditingTenant(null)}
                                                    submitLabel="Save Changes"
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="flex flex-row gap-3">
                                        <a
                                            href={`tel:${tenant.mobileNumber}`}
                                            className="flex-1 flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group/call"
                                        >
                                            <div className="p-1.5 rounded-lg bg-card text-primary group-hover/call:bg-primary group-hover/call:text-white transition-colors shadow-sm">
                                                <Phone className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Mobile</span>
                                                <span className="font-bold text-xs truncate">{tenant.mobileNumber}</span>
                                            </div>
                                        </a>

                                        <div className="flex-1 flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl">
                                            <div className="p-1.5 rounded-lg bg-card text-primary shadow-sm">
                                                <Home className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Room</span>
                                                <span className="font-bold text-xs truncate">{tenant.roomNumber || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
