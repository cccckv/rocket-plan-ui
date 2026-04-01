'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { getBalance, getTransactions, CreditTransaction } from '@/lib/api/credits';
import { ArrowDownRight, ArrowUpRight, Coins } from 'lucide-react';

export default function CreditsPage() {
  const { t } = useI18n();
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, historyData] = await Promise.all([
        getBalance(),
        getTransactions(limit, page * limit),
      ]);
      setCredits(balanceData.credits);
      setTransactions(historyData.transactions);
      setTotal(historyData.total);
    } catch (error) {
      console.error('Failed to load credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consume':
        return t.credits.consume;
      case 'refund':
        return t.credits.refund;
      case 'purchase':
        return t.credits.purchase;
      case 'admin_adjust':
        return t.credits.adminAdjust;
      default:
        return type;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout credits={credits}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t.credits.history}</h1>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.credits.balance}</p>
                <p className="text-2xl font-bold">{credits} {t.credits.title}</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t.credits.noTransactions}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          {t.credits.date}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          {t.credits.type}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          {t.credits.amount}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          {t.credits.relatedVideo}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 text-sm">
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">
                              {getTypeText(tx.type)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {tx.amount > 0 ? (
                                <>
                                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                                  <span className="font-medium text-green-500">
                                    +{tx.amount}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                                  <span className="font-medium text-red-500">
                                    {tx.amount}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {tx.videoId ? (
                              <span className="font-mono text-xs">{tx.videoId}</span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
