import Papa from 'papaparse';

// 1. Standard Parser (Year is a ROW, Categories are COLUMNS)
export function parseStandardCSV(csvString) {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_'),
    transform: (value) => value.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  return result.data.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      // Sanitize key
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      
      if (cleanKey === 'year') {
        newRow.year = parseInt(row[key]) || 0;
      } else {
        // Data is clean integers
        newRow[cleanKey] = parseInt(row[key]) || 0;
      }
    });
    return newRow;
  }).filter(r => r.year);
}

// 2. Transposed Parser (Year is a COLUMN, Categories are ROWS)
// If categoryMap is provided, use it. If not, generate keys dynamically.
export function parseTransposedCSV(csvString, categoryMap = null) {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_'),
    transform: (value) => value.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  const rows = result.data;
  if (rows.length === 0) return [];

  // Get all header except category column
  const headers = result.meta.fields || [];
  const categoryColumn = headers[0];
  const yearColumns = headers.slice(1);

  const yearData = [];

  // Process each category column
  for (const row of rows) {
    const category = row[categoryColumn];
    let dbField;

    if (categoryMap) {
      // Use provided map
      dbField = categoryMap[category];
    } else {
      // Generate key dynamically (e.g. "United States" -> "united_states")
      dbField = category.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    if (!dbField) continue;

    // Add value for each year column
    yearColumns.forEach((yearHeader) => {
      const year = parseInt(yearHeader);
      if (isNaN(year)) return;

      const value = row[yearHeader] || '0';

      // Find or create year object
      let yearObj = yearData.find(y => y.year === year);
      if (!yearObj) {
        yearObj = { year };
        yearData.push(yearObj);
      }

      // Data is clean integers
      yearObj[dbField] = parseInt(value) || 0;
    })
  }

  return yearData.sort((a, b) => a.year - b.year);
}