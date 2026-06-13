import { Injectable } from "@nestjs/common";
import { Subject, type Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { SseEventType } from "@office/shared";

interface SseMessage {
  type: SseEventType;
  data: string;
}

@Injectable()
export class SseService {
  private readonly bus = new Subject<SseMessage>();

  emit<T>(type: SseEventType, data: T) {
    this.bus.next({ type, data: JSON.stringify(data) });
  }

  stream(): Observable<MessageEvent> {
    return this.bus.asObservable().pipe(
      map(
        (msg) =>
          ({
            type: msg.type,
            data: msg.data,
          }) as MessageEvent,
      ),
    );
  }

  /** Per-user stream — all clients receive global events (v1 single-office). */
  userStream(_userId: string): Observable<MessageEvent> {
    return this.stream();
  }
}
