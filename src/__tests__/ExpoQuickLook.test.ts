describe('ExpoQuickLook exports', () => {
  it('exports default module', () => {
    const mod = require('../ExpoQuickLookModule');
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it('exports all types', () => {
    const types = require('../ExpoQuickLook.types');
    expect(types).toBeDefined();
  });

  it('exports from index', () => {
    const index = require('../index');
    expect(index).toBeDefined();
    expect(index.default).toBeDefined();
  });
});
