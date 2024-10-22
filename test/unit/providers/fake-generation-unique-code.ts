import { GenerateCodeProvider } from '@core/modules/orders/application/ports/providers/generate-code-provider';

export class FakeGenerateCodeProvider implements GenerateCodeProvider {
  generate(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = letters.charAt(
      Math.floor(Math.random() * letters.length),
    );
    const randomNumbers = Math.floor(100 + Math.random() * 900).toString();

    return randomLetter + '' + randomNumbers;
  }
}
