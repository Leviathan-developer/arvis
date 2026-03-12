import type { ArvisDatabase } from '../db/database.js';

export interface Variable {
  id: number;
  key: string;
  value: string;
  description: string | null;
  is_secret: number;
  created_at: string;
}

export interface VariableRow {
  id: number;
  key: string;
  value: string;
  description: string | null;
  is_secret: number;
  created_at: string;
}

/**
 * Manages key-value variables/secrets stored in the database.
 * Secret values are masked in list results but available via get() for tool use.
 */
export class VariableManager {
  constructor(private db: ArvisDatabase) {}

  /** List all variables. Secret values are masked. */
  getAll(): Variable[] {
    const rows = this.db.all<VariableRow>(
      'SELECT id, key, value, description, is_secret, created_at FROM variables ORDER BY key'
    );
    return rows.map((r) => ({
      ...r,
      value: r.is_secret ? '••••••••' : r.value,
    }));
  }

  /** Get full variable value by key (unmasked — for tool use). Returns null if not found. */
  get(key: string): string | null {
    const row = this.db.get<VariableRow>(
      'SELECT value FROM variables WHERE key = ?',
      key
    );
    return row?.value ?? null;
  }

  /** Get full variable by ID (unmasked). */
  getById(id: number): Variable | null {
    return this.db.get<Variable>(
      'SELECT id, key, value, description, is_secret, created_at FROM variables WHERE id = ?',
      id
    ) ?? null;
  }

  /** Create or update a variable. */
  set(key: string, value: string, description?: string, isSecret?: boolean): void {
    this.db.run(
      `INSERT INTO variables (key, value, description, is_secret)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         description = COALESCE(excluded.description, variables.description),
         is_secret = excluded.is_secret`,
      key,
      value,
      description ?? null,
      isSecret ? 1 : 0
    );
  }

  /** Delete a variable by ID. */
  delete(id: number): boolean {
    const result = this.db.run('DELETE FROM variables WHERE id = ?', id);
    return result.changes > 0;
  }

  /** Delete a variable by key. */
  deleteByKey(key: string): boolean {
    const result = this.db.run('DELETE FROM variables WHERE key = ?', key);
    return result.changes > 0;
  }
}
