import { Module } from '@nestjs/common';
import {
  ChangeRepository,
  DalService,
  EnvironmentRepository,
  ExecutionDetailsRepository,
  FeedRepository,
  IntegrationRepository,
  JobRepository,
  LayoutRepository,
  LogRepository,
  MemberRepository,
  MessageRepository,
  MessageTemplateRepository,
  NotificationGroupRepository,
  NotificationRepository,
  NotificationTemplateRepository,
  OrganizationRepository,
  SubscriberPreferenceRepository,
  SubscriberRepository,
  TenantRepository,
  TopicRepository,
  TopicSubscribersRepository,
  UserRepository,
  WorkflowOverrideRepository,
} from '@novu/dal';
import {
  analyticsService,
  cacheService,
  CacheServiceHealthIndicator,
  CalculateDelayService,
  createNestLoggingModuleOptions,
  DalServiceHealthIndicator,
  distributedLockService,
  featureFlagsService,
  getIsTopicNotificationEnabled,
  getIsApiRateLimitingEnabled,
  InvalidateCacheService,
  LoggerModule,
  QueuesModule,
  storageService,
  getIsApiIdempotencyEnabled,
  ExecutionLogRoute,
  CreateExecutionDetails,
  getIsExecutionLogQueueEnabled,
} from '@novu/application-generic';

import * as packageJson from '../../../package.json';
import { JobTopicNameEnum } from '@novu/shared';

const DAL_MODELS = [
  UserRepository,
  OrganizationRepository,
  EnvironmentRepository,
  ExecutionDetailsRepository,
  NotificationTemplateRepository,
  SubscriberRepository,
  NotificationRepository,
  MessageRepository,
  MessageTemplateRepository,
  NotificationGroupRepository,
  MemberRepository,
  LayoutRepository,
  LogRepository,
  IntegrationRepository,
  ChangeRepository,
  JobRepository,
  FeedRepository,
  SubscriberPreferenceRepository,
  TopicRepository,
  TopicSubscribersRepository,
  TenantRepository,
  WorkflowOverrideRepository,
];

const dalService = {
  provide: DalService,
  useFactory: async () => {
    const service = new DalService();
    await service.connect(process.env.MONGO_URL);

    return service;
  },
};

const PROVIDERS = [
  analyticsService,
  cacheService,
  CacheServiceHealthIndicator,
  CalculateDelayService,
  dalService,
  DalServiceHealthIndicator,
  distributedLockService,
  featureFlagsService,
  getIsTopicNotificationEnabled,
  getIsApiRateLimitingEnabled,
  getIsApiIdempotencyEnabled,
  InvalidateCacheService,
  storageService,
  ...DAL_MODELS,
  ExecutionLogRoute,
  CreateExecutionDetails,
  getIsExecutionLogQueueEnabled,
];

@Module({
  imports: [
    QueuesModule.forRoot([
      JobTopicNameEnum.EXECUTION_LOG,
      JobTopicNameEnum.WEB_SOCKETS,
      JobTopicNameEnum.WORKFLOW,
      JobTopicNameEnum.INBOUND_PARSE_MAIL,
    ]),
    LoggerModule.forRoot(
      createNestLoggingModuleOptions({
        serviceName: packageJson.name,
        version: packageJson.version,
      })
    ),
  ],
  providers: [...PROVIDERS],
  exports: [...PROVIDERS, LoggerModule, QueuesModule],
})
export class SharedModule {}
