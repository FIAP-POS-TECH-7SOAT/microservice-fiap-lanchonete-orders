import { Controller, UseInterceptors } from '@nestjs/common';

import { LoggingInterceptor } from '../Interceptors/custom-logger-routes';
import { ApiTags } from '@nestjs/swagger';

@Controller('/sessions')
@ApiTags('Authentication')
@UseInterceptors(LoggingInterceptor)
export class AuthController {}
