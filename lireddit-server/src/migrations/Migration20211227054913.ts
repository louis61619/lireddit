import { Migration } from '@mikro-orm/migrations';

export class Migration20211227054913 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" add column "create_at" timestamptz(0) not null, add column "update_at" timestamptz(0) not null;');
  }

}
