import React from 'react';
import { PaymentRecord, Tenant } from '@/types/tenant';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryViewProps {
    tenant: Tenant;
}

export function HistoryView({ tenant }: HistoryViewProps) {
    const history = tenant.paymentHistory || [];

    // Sort by date descending
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedHistory.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payment history found.</p>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Payment History
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                        {sortedHistory.map((record) => (
                            <div
                                key={record.id}
                                className="border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-semibold text-sm">
                                            {format(parseISO(record.date), 'dd MMM yyyy')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {record.billingMonth}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary text-lg">
                                            ₹{record.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t">
                                    <div>
                                        <div className="text-muted-foreground">Rent</div>
                                        <div className="font-medium">₹{record.rentAmount}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Electricity</div>
                                        <div className="font-medium">{record.electricityUnits}u (₹{record.electricityAmount})</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Water</div>
                                        <div className="font-medium">₹{record.waterAmount}</div>
                                    </div>
                                </div>

                                {record.extraAmount > 0 && (
                                    <div className="text-xs mt-2 pt-2 border-t">
                                        <span className="text-muted-foreground">Extra: </span>
                                        <span className="font-medium">₹{record.extraAmount}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
