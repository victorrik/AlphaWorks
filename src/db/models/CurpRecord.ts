import { Model } from '@nozbe/watermelondb';
import { date, field, text, writer } from '@nozbe/watermelondb/decorators';
export class CurpRecord extends Model {
  static table = 'curp_records';
  @text('nombres') nombres: string;
  @text('apellido_paterno') apellidoPaterno: string;
  @text('apellido_materno') apellidoMaterno: string;
  @text('sexo') sexo: string;
  @text('birth_date') birthDate: string;
  @field('age') age: number;
  @text('state_code') stateCode: string;
  @text('curp') curp: string;
  @field('height') height: number | null;
  @field('weight') weight: number | null;
  @field('used') used: boolean;
  @date('created_at') createdAt: Date;
  @writer async setUsed(used: boolean) {
    await this.update(record => {
      record.used = used;
    });
  }
}
