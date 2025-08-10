import { Test, TestingModule } from '@nestjs/testing';
import { OtpChannel } from 'src/auth/domain/enums';
import { UnknownOtpChannelException } from 'src/auth/domain/exceptions';

import { OtpPolicyAdapter } from 'src/auth/infrastructure/adapters/outbound/policy';
import securityConfig from 'src/shared/infrastructure/config/security.config';

describe('OtpPolicyAdapter', () => {
  let adapter: OtpPolicyAdapter;

  const mockConfig = {
    otp: {
      channel: {
        email: {
          ttl: 10, // 10 minutes for email
        },
        sms: {
          ttl: 5, // 5 minutes for SMS
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpPolicyAdapter,
        {
          provide: securityConfig.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    adapter = module.get<OtpPolicyAdapter>(OtpPolicyAdapter);
  });

  describe('ttlMinutes', () => {
    it('should return correct TTL for EMAIL channel', () => {
      // Act
      const result = adapter.ttlMinutes(OtpChannel.EMAIL);

      // Assert
      expect(result).toBe(10);
    });

    it('should return correct TTL for SMS channel', () => {
      // Act
      const result = adapter.ttlMinutes(OtpChannel.SMS);

      // Assert
      expect(result).toBe(5);
    });

    it('should handle case-insensitive channel names', () => {
      // This test verifies that the toLowerCase() conversion works correctly
      // Act & Assert
      expect(adapter.ttlMinutes(OtpChannel.EMAIL)).toBe(10);
      expect(adapter.ttlMinutes(OtpChannel.SMS)).toBe(5);
    });

    it('should throw UnknownOtpChannelException for missing channel configuration', () => {
      // Arrange - Create adapter with incomplete config
      const incompleteConfig = {
        otp: {
          channel: {
            email: {
              ttl: 10,
            },
            // Missing SMS configuration
          },
        },
      };

      const testModule = Test.createTestingModule({
        providers: [
          OtpPolicyAdapter,
          {
            provide: securityConfig.KEY,
            useValue: incompleteConfig,
          },
        ],
      });

      return testModule.compile().then((module) => {
        const testAdapter = module.get<OtpPolicyAdapter>(OtpPolicyAdapter);

        // Act & Assert
        expect(() => testAdapter.ttlMinutes(OtpChannel.SMS)).toThrow(
          UnknownOtpChannelException,
        );
        expect(() => testAdapter.ttlMinutes(OtpChannel.SMS)).toThrow(
          'Unknown OTP policy channel: SMS',
        );
      });
    });

    it('should throw UnknownOtpChannelException when TTL is 0', () => {
      // Arrange - Create adapter with zero TTL
      const zeroTtlConfig = {
        otp: {
          channel: {
            email: {
              ttl: 0, // Invalid TTL
            },
            sms: {
              ttl: 5,
            },
          },
        },
      };

      const testModule = Test.createTestingModule({
        providers: [
          OtpPolicyAdapter,
          {
            provide: securityConfig.KEY,
            useValue: zeroTtlConfig,
          },
        ],
      });

      return testModule.compile().then((module) => {
        const testAdapter = module.get<OtpPolicyAdapter>(OtpPolicyAdapter);

        // Act & Assert
        expect(() => testAdapter.ttlMinutes(OtpChannel.EMAIL)).toThrow(
          UnknownOtpChannelException,
        );
        expect(() => testAdapter.ttlMinutes(OtpChannel.EMAIL)).toThrow(
          'Unknown OTP policy channel: EMAIL',
        );
      });
    });

    it('should throw UnknownOtpChannelException when TTL is undefined', () => {
      // Arrange - Create adapter with undefined TTL
      const undefinedTtlConfig = {
        otp: {
          channel: {
            email: {}, // Missing ttl property
            sms: {
              ttl: 5,
            },
          },
        },
      };

      const testModule = Test.createTestingModule({
        providers: [
          OtpPolicyAdapter,
          {
            provide: securityConfig.KEY,
            useValue: undefinedTtlConfig,
          },
        ],
      });

      return testModule.compile().then((module) => {
        const testAdapter = module.get<OtpPolicyAdapter>(OtpPolicyAdapter);

        // Act & Assert
        expect(() => testAdapter.ttlMinutes(OtpChannel.EMAIL)).toThrow(
          UnknownOtpChannelException,
        );
        expect(() => testAdapter.ttlMinutes(OtpChannel.EMAIL)).toThrow(
          'Unknown OTP policy channel: EMAIL',
        );
      });
    });

    it('should work with different TTL values', () => {
      // Arrange - Create adapter with custom TTL values
      const customConfig = {
        otp: {
          channel: {
            email: {
              ttl: 15, // 15 minutes for email
            },
            sms: {
              ttl: 3, // 3 minutes for SMS
            },
          },
        },
      };

      const testModule = Test.createTestingModule({
        providers: [
          OtpPolicyAdapter,
          {
            provide: securityConfig.KEY,
            useValue: customConfig,
          },
        ],
      });

      return testModule.compile().then((module) => {
        const testAdapter = module.get<OtpPolicyAdapter>(OtpPolicyAdapter);

        // Act & Assert
        expect(testAdapter.ttlMinutes(OtpChannel.EMAIL)).toBe(15);
        expect(testAdapter.ttlMinutes(OtpChannel.SMS)).toBe(3);
      });
    });
  });
});
