
import { parseCSVLine, parseCSVContent, prepareImportData } from './csv-import';
import { type ColumnMapping } from '@/app/(dashboard)/leads/types';

describe('csv-import', () => {
  describe('parseCSVLine', () => {
    it('parses a simple comma-separated line', () => {
      const result = parseCSVLine('John Doe,john@example.com,1234567890');
      expect(result).toEqual(['John Doe', 'john@example.com', '1234567890']);
    });

    it('handles values with quotes', () => {
      const result = parseCSVLine('"Doe, John",john@example.com,"123,456"');
      expect(result).toEqual(['Doe, John', 'john@example.com', '123,456']);
    });

    it('trims whitespace from values', () => {
      const result = parseCSVLine('  Jane Doe  , jane@example.com , 0987654321 ');
      expect(result).toEqual(['Jane Doe', 'jane@example.com', '0987654321']);
    });
  });

  describe('parseCSVContent', () => {
    it('throws error for empty CSV', () => {
      expect(() => parseCSVContent('')).toThrow('CSV file is empty or has no data rows');
    });

    it('does not throw error for CSV with only headers if it contains a newline (lines.length >= 2)', () => {
      const result = parseCSVContent('Name,Email\n');
      expect(result.headers).toEqual(['Name', 'Email']);
      expect(result.preview).toHaveLength(1);
    });

    it('extracts headers and preview rows', () => {
      const csv = 'Name,Email,Phone\nJohn,john@test.com,123\nJane,jane@test.com,456';
      const result = parseCSVContent(csv);
      
      expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
      expect(result.preview).toHaveLength(3); // Includes header row
      expect(result.preview[0]).toEqual(['Name', 'Email', 'Phone']);
      expect(result.preview[1]).toEqual(['John', 'john@test.com', '123']);
      expect(result.preview[2]).toEqual(['Jane', 'jane@test.com', '456']);
    });
  });

  describe('prepareImportData', () => {
    it('maps CSV rows to CreateLeadDto objects', () => {
      const csv = 'Full Name,Email Address,Mobile\nJohn Doe,john@example.com,1234567890';
      const mappings: ColumnMapping[] = [
        { csvHeader: 'Full Name', leadField: 'name' },
        { csvHeader: 'Email Address', leadField: 'email' },
        { csvHeader: 'Mobile', leadField: 'phone' }
      ];

      const result = prepareImportData(csv, mappings);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        stage: 'New',
        status: 'Warm'
      });
    });

    it('ignores skipped columns', () => {
      const csv = 'Name,Age,Email\nJohn,30,john@example.com';
      const mappings: ColumnMapping[] = [
        { csvHeader: 'Name', leadField: 'name' },
        { csvHeader: 'Age', leadField: 'skip' },
        { csvHeader: 'Email', leadField: 'email' }
      ];

      const result = prepareImportData(csv, mappings);

      expect(result[0]).toEqual({
        name: 'John',
        email: 'john@example.com',
        stage: 'New',
        status: 'Warm'
      });
      // Age should not be present
      expect((result[0] as any).age).toBeUndefined();
    });
  });
});
