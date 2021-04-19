import {Options, SubscriptionIdMap, Field} from './types';
import {sendUpdate, sendCancel, sendPause, sendResume} from './platforms/web/events';
import {invalidateSubscription} from './invalidate';

export class ProxySubscription {
  public active: boolean = true;
  public id: string = `${Date.now()}:${Math.random() * 10000}`;

  constructor(public symbol: string, public fields: Field[]) {}

  get idMap(): SubscriptionIdMap {
    return {[this.id]: this.symbol};
  }

  public update(options: Options) {
    if (!this.active) {
      return;
    }

    sendUpdate(this.idMap, options);
  }

  public cancel() {
    if (!this.active) {
      return;
    }

    sendCancel(this.idMap);
    invalidateSubscription(this);
  }

  public pause() {
    if (!this.active) {
      return;
    }

    sendPause(this.idMap);
  }

  public resume() {
    if (!this.active) {
      return;
    }

    sendResume(this.idMap);
  }
}
