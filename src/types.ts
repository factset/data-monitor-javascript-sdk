import {ProxySubscription} from './proxy-subscription';
import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {Environment} from './env';

export interface Options {
  currency?: string;
  timezone?: string;
  britishCurrencyInPence?: boolean;
}

export interface BaseParams {
  symbols: string[];
  fields: (string | Field)[];
  options?: Options;
}

export interface OnParams extends BaseParams {
  success: SuccessCallback;
  error?: ErrorCallback;
}

export interface OnceParams extends BaseParams {
  success?: SuccessCallback;
  complete?: CompleteCallback;
  error?: ErrorCallback;
}

export type SuccessCallback = (message: DMMessage, subscription: ProxySubscription) => void;
export type ErrorCallback = (error: any, subscription: ProxySubscription) => void;
export type CompleteCallback = (
  errors: Record<string, any[]>,
  messages: Record<string, Record<string, any>>,
  subscriptions: ProxySubscriptionCollection
) => void;

export interface DMMessage {
  symbol: string;
  data: Record<string, any>;
  options?: Record<string, any>;
}

export enum Action {
  ON = 'on',
  ONCE = 'once',
  UPDATE = 'update',
  CANCEL = 'cancel',
  SUCCESS = 'success',
  ERROR = 'error',
  COMPLETE = 'complete',
  PAUSE = 'pause',
  RESUME = 'resume',
  PING = 'ping',
  INIT = 'init',
  DATA_POINT_GET = 'dataPointGet',
  DATA_POINT_REGISTER = 'dataPointRegister',
}

// subscription id to input symbol
export type SubscriptionIdMap = Record<string, string>;

export interface BasePostMessage {
  source: 'dataMonitor';
  action: Action;
  subscriptionIdMap?: SubscriptionIdMap;
  collectionId?: string;
  actionId?: string;
  fields?: FieldPayload;
  sdkVersion?: string;
}

export interface Request extends BasePostMessage {
  initOptions?: Options;
  options?: Options;
}

export interface Response extends BasePostMessage {
  message?: any;
  error?: any;
}

export type FieldPayload = string | Field | (string | Field)[];

interface BaseFieldDefinition {
  id: string;
}

export interface ComputedFieldDefinition extends BaseFieldDefinition {
  computedFunction: (data: Record<string, any>, subscription: ProxySubscription, options: Options) => any;
  dependencies: (string | DependencyFieldDefinition)[];
  type?: string;
  name?: string;
}

export interface RoutedFieldDefinition extends BaseFieldDefinition {
  endpoint: string | ExpandedEndpoint;
  endpointProperty?: string;
  dependencies?: (string | DependencyFieldDefinition)[];
  type?: string;
  name?: string;
}

export type Field = ComputedFieldDefinition | RoutedFieldDefinition;

export interface DependencyFieldDefinition extends BaseFieldDefinition {
  optional?: boolean;
}

export interface InitOptions {
  idpid?: string;
  environment?: Environment;
  globalOptions?: Options;
}

interface ExpandedEndpoint {
  platform?: {
    web?: FieldTarget;
    node?: FieldTarget;
  };
  default?: FieldTarget;
  fallback?: FieldTarget | FieldTarget[];
}

interface FieldTarget {
  endpoint: string;
  endpointProperty: string;
}

export enum FXRate {
  NOW = 'NOW',
  YESTERDAY = 'YESTERDAY',
  YESTERDAY_PREV_CLOSE = 'YESTERDAY_PREV_CLOSE',
  ONE_WEEK_AGO = 'ONE_WEEK_AGO',
  ONE_MONTH_AGO = 'ONE_MONTH_AGO',
  THREE_MONTHS_AGO = 'THREE_MONTHS_AGO',
  SIX_MONTHS_AGO = 'SIX_MONTHS_AGO',
  ONE_YEAR_AGO = 'ONE_YEAR_AGO',
  YEAR_END = 'YEAR_END',
  WEEK_END = 'WEEK_END',
  MONTH_END = 'MONTH_END',
  QUARTER_END = 'QUARTER_END',
}
