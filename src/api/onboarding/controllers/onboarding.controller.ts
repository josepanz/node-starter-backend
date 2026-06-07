import { Controller, Post, Version, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBasicAuth } from '@nestjs/swagger';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';
import * as DTO from '@api/onboarding/dto';
import { OnboardingDocs } from '@api/onboarding/docs/onboarding-api.docs';
import { OnboardingApiService } from '@api/onboarding/services/onboarding-api.service';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingApiService: OnboardingApiService) {}

  @Post()
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @OnboardingDocs('onboarding')
  async onboarding(
    @Body() dto: DTO.OnboardingUserRequestDTO,
  ): Promise<DTO.OnboardingUserResponseDTO> {
    return await this.onboardingApiService.onboarding(dto);
  }
}
