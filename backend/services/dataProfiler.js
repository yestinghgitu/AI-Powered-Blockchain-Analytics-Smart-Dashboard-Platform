/**
 * Basic Data Profiling Engine: Analyzes CSV structure and data quality.
 */
function profileData(data) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const profile = {
    totalRows: data.length,
    totalColumns: columns.length,
    missingCells: 0,
    columns: {}
  };

  columns.forEach(col => {
    let missing = 0;
    let numeric = 0;
    const values = data.map(row => {
      const val = row[col];
      if (val === undefined || val === null || val === '') {
        missing++;
        return null;
      }
      if (!isNaN(parseFloat(val)) && isFinite(val)) {
        numeric++;
      }
      return val;
    });

    profile.missingCells += missing;
    profile.columns[col] = {
      type: numeric > data.length * 0.8 ? 'numeric' : 'categorical',
      missing,
      uniqueCount: new Set(values.filter(v => v !== null)).size
    };
  });

  return profile;
}

module.exports = { profileData };
