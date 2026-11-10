import { Model } from '@nozbe/watermelondb';
import { date, field, text, writer } from '@nozbe/watermelondb/decorators';

export class AgeRecord extends Model {
  static table = 'age_records';

  @text('source') source: string;
  @text('birth_date') birthDate: string;
  @field('age') age: number;
  @field('used') used: boolean;
  @date('created_at') createdAt: Date;

  @writer async setUsed(used: boolean) {
    await this.update(record => {
      record.used = used;
    });
  }
}
