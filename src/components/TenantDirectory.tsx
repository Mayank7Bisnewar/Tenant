import React, { useState } from 'react';
import { User, Home, Phone, Search, Pencil, History, Trash2 } from 'lucide-react';
import { HistoryView } from '@/components/HistoryView';
import { useBilling } from '@/context/BillingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TenantForm, TenantFormData } from '@/components/TenantForm';
import { Tenant } from '@/types/tenant';

export function TenantDirectory() {
    const { allTenants, updateTenant, permanentDeleteTenant } = useBilling();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [historyTenantId, setHistoryTenantId] = useState<string | null>(null);

    const tenants = allTenants || [];

    const activeTenants = tenants.filter(t => t.status === 'active' || !t.status);
    const deletedTenants = tenants.filter(t => t.status === 'deleted');

    const filterFn = (tenant: Tenant) =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.mobileNumber.includes(searchQuery);

    const filteredActive = activeTenants.filter(filterFn);
    const filteredDeleted = deletedTenants.filter(filterFn);

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
                    <h2 className="text-2xl font-display font-semibold text-foreground">Tenant Directory</h2>
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
            <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                {/* Active Tenants Section */}
                <div className="space-y-4">
                    {filteredActive.length === 0 && searchQuery && (
                        <Card className="border-dashed py-8 text-center text-muted-foreground bg-card/50">
                            <p className="font-medium text-sm">No active tenants found matching search.</p>
                        </Card>
                    )}

                    {filteredActive.map((tenant) => (
                        <Card key={tenant.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card active:scale-[0.99]">
                            <CardContent className="p-0">
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-display font-semibold text-lg text-foreground leading-tight">{tenant.name}</h4>
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
                                                <span className="font-semibold text-xs truncate">{tenant.mobileNumber}</span>
                                            </div>
                                        </a>

                                        <div className="flex-1 flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl">
                                            <div className="p-1.5 rounded-lg bg-card text-primary shadow-sm">
                                                <Home className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Room</span>
                                                <span className="font-semibold text-xs truncate">{tenant.roomNumber || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Deleted Tenants Section */}
                {filteredDeleted.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-dashed border-muted">
                        <div className="flex items-center gap-2 px-1">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Deleted Tenants</h3>
                            <div className="h-px flex-1 bg-muted/50" />
                        </div>

                        {filteredDeleted.map((tenant) => (
                            <Card key={tenant.id} className="group overflow-hidden border-none shadow-sm opacity-75 hover:opacity-100 transition-all duration-300 rounded-2xl bg-muted/20 grayscale-[0.5] hover:grayscale-0">
                                <CardContent className="p-0">
                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-destructive/10 group-hover:text-destructive transition-all duration-300 shadow-inner">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-display font-semibold text-lg text-foreground leading-tight">{tenant.name}</h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                                                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Deleted</span>
                                                        {tenant.deletedAt && (
                                                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                                                                on {new Date(tenant.deletedAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[10px] font-bold h-7 px-3 rounded-lg hover:bg-primary/10 text-primary border border-primary/20"
                                                onClick={() => updateTenant(tenant.id, { status: 'active' })}
                                            >
                                                Restore
                                            </Button>

                                            <div className="flex gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary transition-all bg-card shadow-sm"
                                                    onClick={() => setHistoryTenantId(tenant.id)}
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive transition-all bg-card shadow-sm"
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to permanently delete all data for ${tenant.name}? This cannot be undone.`)) {
                                                            permanentDeleteTenant(tenant.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
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
                                                    <span className="font-semibold text-xs truncate">{tenant.mobileNumber}</span>
                                                </div>
                                            </a>

                                            <div className="flex-1 flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl">
                                                <div className="p-1.5 rounded-lg bg-card text-primary shadow-sm">
                                                    <Home className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Room</span>
                                                    <span className="font-semibold text-xs truncate">{tenant.roomNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

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
                        {historyTenantId && tenants.find(t => t.id === historyTenantId) && (
                            <HistoryView tenant={tenants.find(t => t.id === historyTenantId)!} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
