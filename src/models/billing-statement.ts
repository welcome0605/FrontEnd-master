
import {BillingItem } from './billing-item';

export class BillingStatement{
    
    items: Array<BillingItem>;
    id: string;
    month: string;
    total: number;
}