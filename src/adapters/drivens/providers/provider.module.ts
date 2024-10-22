import { Module } from '@nestjs/common';
import { CustomGenerateCodeProvider } from './generation-unique-code';
import { GenerateCodeProvider } from '@core/modules/orders/application/ports/providers/generate-code-provider';

@Module({
  providers: [
    {
      provide: GenerateCodeProvider,
      useClass: CustomGenerateCodeProvider,
    },
  ],

  exports: [GenerateCodeProvider],
})
export class ProviderModule {}
