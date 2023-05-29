import { Op } from "sequelize";
import { RateLimitingEvent } from "../db";

export class RateLimiter {
  declare eventType: string;
  declare timeframeMinutes: number;
  declare maxEvents: number;

  static msInMinute = 60000;

  constructor({
    eventType,
    timeframeMinutes,
    maxEvents,
  }: {
    eventType: string;
    timeframeMinutes: number;
    maxEvents: number;
  }) {
    this.eventType = eventType;
    this.timeframeMinutes = timeframeMinutes;
    this.maxEvents = maxEvents;
  }

  async limit(actor: string, recordIfFail: boolean = false) {
    await this.flushEvents();
    const numEvents = await this.countEvents(actor);

    if (numEvents >= this.maxEvents) {
      if (recordIfFail) {
        this.recordEvent(actor);
      }
      throw "Rate limit exceeded";
    } else {
      this.recordEvent(actor);
      return {
        pass: true,
        numEvents,
      };
    }
  }

  private async countEvents(actor: string) {
    return await RateLimitingEvent.count({
      where: {
        EventType: this.eventType,
        EventActor: actor.slice(0, 255),
        EventTimestamp: {
          [Op.lt]: Date.now(),
          [Op.gt]: Date.now() - this.timeframeMinutes * RateLimiter.msInMinute,
        },
      },
    });
  }

  private async recordEvent(actor: string) {
    await RateLimitingEvent.create({
      EventActor: actor.slice(0, 255),
      EventTimestamp: Date.now(),
      EventType: this.eventType,
    });
  }

  private async flushEvents() {
    await RateLimitingEvent.destroy({
      where: {
        EventType: this.eventType,
        EventTimestamp: {
          [Op.lt]: Date.now() - this.timeframeMinutes * RateLimiter.msInMinute,
        },
      },
    });
  }
}
