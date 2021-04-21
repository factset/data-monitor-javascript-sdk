import {Options, SubscriptionIdMap, Field} from './types';
import {sendCancel, sendUpdate, sendPause, sendResume} from './platforms/web/events';
import {ProxySubscription} from './proxy-subscription';
import {invalidateCollection} from './invalidate';
import {Platform, platform} from './env';

export class ProxySubscriptionCollection {
  public subscriptions: Map<string, ProxySubscription> = new Map();
  public id: string = `${Date.now()}:${Math.random() * 10000}`;
  public active: boolean = true;

  constructor(symbols: string[], fields: Field[]) {
    this.createSubscriptions(symbols, fields);
  }

  private createSubscriptions(symbols: string[], fields: Field[]): void {
    symbols.forEach(symbol => {
      const normalizedSymbol = symbol.toUpperCase();
      this.subscriptions.set(normalizedSymbol, new ProxySubscription(normalizedSymbol, fields));
    });
  }

  get idMap(): SubscriptionIdMap {
    const subIds: SubscriptionIdMap = {};
    this.subscriptions.forEach(sub => {
      if (sub.active) {
        subIds[sub.id] = sub.symbol;
      }
    });

    return subIds;
  }

  public update(options: Options) {
    if (!this.active || platform === Platform.NODE) {
      return;
    }

    sendUpdate(this.idMap, options);
  }

  public cancel() {
    if (!this.active) {
      return;
    }

    sendCancel(this.idMap);
    invalidateCollection(this);
  }

  public pause() {
    if (!this.active || platform === Platform.NODE) {
      return;
    }

    sendPause(this.idMap);
  }

  public resume() {
    if (!this.active || platform === Platform.NODE) {
      return;
    }

    sendResume(this.idMap);
  }
}
