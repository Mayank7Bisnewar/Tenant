import React from 'react';
import { PaymentRecord, Tenant } from '@/types/tenant';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { History, Trash2, Calendar, Droplets, Zap, Home, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-semibold text-lg text-foreground">No History Yet</p>
                <p className="text-sm opacity-75">Records will appear here once you save a payment.</p>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <ScrollArea className="h-[450px] pr-4">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                        className="space-y-3 pb-4"
                    >
                        <AnimatePresence mode='popLayout'>
                            {sortedHistory.map((record) => (
                                <motion.div
                                    key={record.id}
                                    layout
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    className="group relative overflow-hidden transition-all hover:bg-muted/40 border border-border/50 bg-card/50 rounded-2xl p-4 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-base flex items-center gap-2">
                                                    {record.billingMonth}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-medium">
                                                    Paid on {format(parseISO(record.date), 'dd MMM yyyy, hh:mm a')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-lg text-primary">
                                                ₹{record.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 rounded-xl p-2.5">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Home className="w-3.5 h-3.5 text-primary/70" />
                                            <span>Rent: <span className="font-bold text-foreground">₹{record.rentAmount}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Zap className="w-3.5 h-3.5 text-electricity" />
                                            <span>Elec: <span className="font-bold text-foreground">₹{record.electricityAmount}</span> <span className="opacity-70">({record.electricityUnits}u)</span></span>
                                        </div>
                                        {record.waterAmount > 0 && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Droplets className="w-3.5 h-3.5 text-water" />
                                                <span>Water: <span className="font-bold text-foreground">₹{record.waterAmount}</span></span>
                                            </div>
                                        )}
                                        {record.extraAmount > 0 && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Plus className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Extra: <span className="font-bold text-foreground">₹{record.extraAmount}</span></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this payment record for {record.billingMonth}? This cannot be undone.
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
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
