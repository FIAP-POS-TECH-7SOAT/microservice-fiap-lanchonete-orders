import { CustomGenerateCodeProvider } from '@adapters/drivens/providers/generation-unique-code';

describe('CustomGenerateCodeProvider', () => {
  let generateCodeProvider: CustomGenerateCodeProvider;

  beforeEach(() => {
    generateCodeProvider = new CustomGenerateCodeProvider();
  });

  it('should generate a code with 1 letter followed by 3 digits', () => {
    const code = generateCodeProvider.generate();

    expect(code).toHaveLength(4);

    expect(code).toMatch(/^[A-Z]\d{3}$/);
  });

  it('should generate different codes on each call', () => {
    const code1 = generateCodeProvider.generate();
    const code2 = generateCodeProvider.generate();

    expect(code1).not.toEqual(code2);
  });
});
