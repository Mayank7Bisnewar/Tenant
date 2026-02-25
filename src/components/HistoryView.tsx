import React from 'react';
import { PaymentRecord, Tenant } from '@/types/tenant';
import { format, parseISO } from 'date-fns';
import { History, Trash2, Calendar, Droplets, Zap, Home, Plus, Receipt, Clock } from 'lucide-react';
import { useBilling } from '@/context/BillingContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HistoryViewProps {
    tenant: Tenant;
}

export function HistoryView({ tenant }: HistoryViewProps) {
    const { deletePaymentRecord } = useBilling();
    const history = tenant.paymentHistory || [];

    // Sort by date descending
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-5">
                    <Receipt className="w-10 h-10 opacity-40" />
                </div>
                <p className="font-semibold text-lg text-foreground mb-1">No Payments Yet</p>
                <p className="text-sm opacity-60 text-center max-w-[220px]">Payment records will show up here after you save a bill.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">

            {/* Timeline */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.06 } }
                }}
                className="space-y-3 pb-4"
            >
                <AnimatePresence mode='popLayout'>
                    {sortedHistory.map((record, index) => (
                        <motion.div
                            key={record.id}
                            layout
                            variants={{
                                hidden: { opacity: 0, y: 15, scale: 0.98 },
                                visible: { opacity: 1, y: 0, scale: 1 }
                            }}
                            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                            className="relative overflow-hidden border border-border/60 bg-card rounded-2xl shadow-sm"
                        >
                            {/* Top Row: Month + Amount + Delete */}
                            <div className="flex items-center justify-between p-3.5 pb-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        index === 0
                                            ? "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground"
                                            : "bg-muted/60 text-muted-foreground"
                                    )}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[15px] leading-tight">{record.billingMonth}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {format(parseISO(record.date), 'dd MMM yyyy, hh:mm a')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={cn(
                                        "font-black text-[17px]",
                                        index === 0 ? "text-primary" : "text-foreground"
                                    )}>
                                        ₹{record.amount.toLocaleString()}
                                    </span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full ">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete the payment record for {record.billingMonth}? This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deletePaymentRecord(tenant.id, record.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            {/* Breakdown Bar */}
                            <div className="mx-3.5 mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5 bg-muted/30 rounded-xl px-3 py-2.5 text-xs">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Home className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                                    <span>Rent: <span className="font-semibold text-foreground">₹{record.rentAmount}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Zap className="w-3.5 h-3.5 text-electricity shrink-0" />
                                    <span>Elec: <span className="font-semibold text-foreground">₹{record.electricityAmount}</span> <span className="opacity-70">({record.electricityUnits}u)</span></span>
                                </div>
                                {record.waterAmount > 0 && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Droplets className="w-3.5 h-3.5 text-water shrink-0" />
                                        <span>Water: <span className="font-semibold text-foreground">₹{record.waterAmount}</span></span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Plus className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>Extra: <span className="font-semibold text-foreground">₹{record.extraAmount}</span></span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
