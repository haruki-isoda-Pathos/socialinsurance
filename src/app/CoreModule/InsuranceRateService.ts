import { Injectable } from '@angular/core';

export interface InsuranceRates {
    healthRate: number;
    nursingRate: number;
    pensionRate: number;
}

export interface InsuranceRateEntry extends InsuranceRates {
    effectiveYearMonth: string;
}

interface StoredRateSettings {
    entries: InsuranceRateEntry[];
}

const STORAGE_KEY = 'socialinsurance.insuranceRates';

const DEFAULT_RATES: InsuranceRates = {
    healthRate: 0.0985,
    nursingRate: 0.0162,
    pensionRate: 0.183,
};

@Injectable({ providedIn: 'root' })
export class InsuranceRateService {
    private entries: InsuranceRateEntry[] = [];

    constructor() {
        this.loadFromStorage();
    }

    getHealthRate(yearMonth: string): number {
        return this.getRatesForYearMonth(yearMonth).healthRate;
    }

    getNursingRate(yearMonth: string): number {
        return this.getRatesForYearMonth(yearMonth).nursingRate;
    }

    getPensionRate(yearMonth: string): number {
        return this.getRatesForYearMonth(yearMonth).pensionRate;
    }

    getRatesForYearMonth(yearMonth: string): InsuranceRates {
        const applicable = this.entries
            .filter((entry) => entry.effectiveYearMonth <= yearMonth)
            .sort((a, b) => a.effectiveYearMonth.localeCompare(b.effectiveYearMonth));

        if (applicable.length === 0) {
            // #region agent log
            fetch('http://127.0.0.1:7877/ingest/e924b3ce-ea66-46ab-93b9-b99a79ae1438',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b88198'},body:JSON.stringify({sessionId:'b88198',location:'InsuranceRateService.ts:getRatesForYearMonth',message:'no applicable entry, using defaults',data:{yearMonth,entryCount:this.entries.length,entries:this.entries.map(e=>e.effectiveYearMonth),result:DEFAULT_RATES},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            return { ...DEFAULT_RATES };
        }

        const latest = applicable[applicable.length - 1];
        const result = {
            healthRate: latest.healthRate,
            nursingRate: latest.nursingRate,
            pensionRate: latest.pensionRate,
        };
        // #region agent log
        fetch('http://127.0.0.1:7877/ingest/e924b3ce-ea66-46ab-93b9-b99a79ae1438',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b88198'},body:JSON.stringify({sessionId:'b88198',location:'InsuranceRateService.ts:getRatesForYearMonth',message:'rate selected for yearMonth',data:{yearMonth,entryCount:this.entries.length,allEntries:this.entries.map(e=>({ym:e.effectiveYearMonth,h:e.healthRate})),selectedEffectiveYearMonth:latest.effectiveYearMonth,result},timestamp:Date.now(),hypothesisId:'A,C'})}).catch(()=>{});
        // #endregion
        return result;
    }

    getRatesAsPercent(yearMonth: string): {
        healthPercent: number;
        nursingPercent: number;
        pensionPercent: number;
    } {
        const rates = this.getRatesForYearMonth(yearMonth);
        return {
            healthPercent: this.toPercent(rates.healthRate),
            nursingPercent: this.toPercent(rates.nursingRate),
            pensionPercent: this.toPercent(rates.pensionRate),
        };
    }

    getRateEntries(): InsuranceRateEntry[] {
        return [...this.entries].sort((a, b) =>
            a.effectiveYearMonth.localeCompare(b.effectiveYearMonth),
        );
    }

    saveRatesFromPercent(
        healthPercent: number,
        nursingPercent: number,
        pensionPercent: number,
        effectiveYearMonth: string,
    ): void {
        const entry: InsuranceRateEntry = {
            effectiveYearMonth,
            healthRate: this.fromPercent(healthPercent),
            nursingRate: this.fromPercent(nursingPercent),
            pensionRate: this.fromPercent(pensionPercent),
        };

        const existingIndex = this.entries.findIndex(
            (item) => item.effectiveYearMonth === effectiveYearMonth,
        );
        if (existingIndex >= 0) {
            this.entries[existingIndex] = entry;
        } else {
            this.entries.push(entry);
        }

        this.persistToStorage();
        // #region agent log
        fetch('http://127.0.0.1:7877/ingest/e924b3ce-ea66-46ab-93b9-b99a79ae1438',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b88198'},body:JSON.stringify({sessionId:'b88198',location:'InsuranceRateService.ts:saveRatesFromPercent',message:'rates saved',data:{effectiveYearMonth,healthPercent,nursingPercent,pensionPercent,totalEntries:this.entries.length},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
        // #endregion
    }

    resetToDefaults(): void {
        this.entries = [];
        this.persistToStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return;
            }

            const parsed = JSON.parse(stored) as Partial<StoredRateSettings> & Partial<InsuranceRates>;
            if (Array.isArray(parsed.entries)) {
                this.entries = parsed.entries.filter((entry) => this.isValidEntry(entry));
                return;
            }

            if (this.isValidRates(parsed)) {
                this.entries = [
                    {
                        effectiveYearMonth: '0000-01',
                        healthRate: parsed.healthRate!,
                        nursingRate: parsed.nursingRate!,
                        pensionRate: parsed.pensionRate!,
                    },
                ];
                this.persistToStorage();
            }
        } catch {
            this.entries = [];
        }
    }

    private persistToStorage(): void {
        const data: StoredRateSettings = { entries: this.entries };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    private isValidEntry(entry: Partial<InsuranceRateEntry>): entry is InsuranceRateEntry {
        return (
            typeof entry.effectiveYearMonth === 'string' &&
            /^\d{4}-\d{2}$/.test(entry.effectiveYearMonth) &&
            this.isValidRates(entry)
        );
    }

    private isValidRates(rates: Partial<InsuranceRates>): rates is InsuranceRates {
        return (
            typeof rates.healthRate === 'number' &&
            rates.healthRate >= 0 &&
            typeof rates.nursingRate === 'number' &&
            rates.nursingRate >= 0 &&
            typeof rates.pensionRate === 'number' &&
            rates.pensionRate >= 0
        );
    }

    private toPercent(rate: number): number {
        return Math.round(rate * 10000) / 100;
    }

    private fromPercent(percent: number): number {
        return percent / 100;
    }
}
