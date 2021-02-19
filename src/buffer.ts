import {send} from './events';
import {Request} from './types';

let taskBuffer: Request[] = [];
export function flushBuffer() {
  taskBuffer.forEach(request => send(request));
  taskBuffer = [];
}

export function queueTask(request: Request) {
  taskBuffer.push(request);
}
