export class BillingPlan {

  constructor(public name: string,
              public marketingName: string,
              public price: string,
              public identifier: string,
              public plan_id: string,
              public properties: Array<Object>,
              public stripeId: string){
              }
}
