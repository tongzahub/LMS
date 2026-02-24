import * as cdk from 'aws-cdk-lib';

export interface MoodleConfig {
  environment: string;
  region: string;
  domainName: string;
  taskCpu: number;
  taskMemory: number;
  minTasks: number;
  maxTasks: number;
  cpuTargetUtilization: number;
  spotPercentage: number;
  minAcu: number;
  maxAcu: number;
  backupRetentionDays: number;
  maxEcpu: number;
  maxCacheDataGb: number;
  opcacheMemory: number;
  cognitoDomainPrefix: string;
  costAllocationTags: Record<string, string>;
}

/**
 * Valid Fargate CPU/memory combinations.
 * Key: CPU units, Value: array of valid memory values in MiB.
 */
const VALID_FARGATE_COMBOS: Record<number, number[]> = {
  256: [512, 1024, 2048],
  512: [1024, 2048, 3072, 4096],
  1024: [2048, 3072, 4096, 5120, 6144, 7168, 8192],
  2048: [4096, 5120, 6144, 7168, 8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384],
  4096: Array.from({ length: 23 }, (_, i) => 8192 + i * 1024), // 8192–30720
};

export function validateConfig(config: MoodleConfig): void {
  const errors: string[] = [];

  // Required fields
  if (!config.domainName) {
    errors.push('domainName is required');
  }
  if (!config.region) {
    errors.push('region is required');
  }

  // Fargate CPU validation
  const validCpus = Object.keys(VALID_FARGATE_COMBOS).map(Number);
  if (!validCpus.includes(config.taskCpu)) {
    errors.push(`taskCpu must be one of ${validCpus.join(', ')}, got ${config.taskCpu}`);
  } else {
    // Fargate memory validation for chosen CPU
    const validMemory = VALID_FARGATE_COMBOS[config.taskCpu];
    if (!validMemory.includes(config.taskMemory)) {
      errors.push(
        `taskMemory ${config.taskMemory} is not valid for taskCpu ${config.taskCpu}. ` +
        `Valid values: ${validMemory.join(', ')}`
      );
    }
  }

  // Scaling ranges
  if (config.minTasks < 1) {
    errors.push('minTasks must be >= 1');
  }
  if (config.maxTasks < config.minTasks) {
    errors.push(`maxTasks (${config.maxTasks}) must be >= minTasks (${config.minTasks})`);
  }

  // CPU target utilization
  if (config.cpuTargetUtilization < 1 || config.cpuTargetUtilization > 100) {
    errors.push('cpuTargetUtilization must be between 1 and 100');
  }

  // Spot percentage
  if (config.spotPercentage < 0 || config.spotPercentage > 100) {
    errors.push('spotPercentage must be between 0 and 100');
  }

  // ACU ranges
  if (config.minAcu < 0.5) {
    errors.push('minAcu must be >= 0.5');
  }
  if (config.maxAcu < config.minAcu) {
    errors.push(`maxAcu (${config.maxAcu}) must be >= minAcu (${config.minAcu})`);
  }
  if (config.maxAcu > 128) {
    errors.push('maxAcu must be <= 128');
  }

  // Backup retention
  if (config.backupRetentionDays < 1 || config.backupRetentionDays > 35) {
    errors.push('backupRetentionDays must be between 1 and 35');
  }

  // OPcache memory
  if (config.opcacheMemory < 128 || config.opcacheMemory > 512) {
    errors.push('opcacheMemory must be between 128 and 512');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid MoodleConfig:\n  - ${errors.join('\n  - ')}`);
  }
}

export function loadConfig(app: cdk.App): MoodleConfig {
  const config: MoodleConfig = {
    environment: app.node.tryGetContext('moodle:environment') ?? 'production',
    region: app.node.tryGetContext('moodle:region') ?? 'ap-southeast-1',
    domainName: app.node.tryGetContext('moodle:domainName') ?? '',
    taskCpu: app.node.tryGetContext('moodle:taskCpu') ?? 2048,
    taskMemory: app.node.tryGetContext('moodle:taskMemory') ?? 4096,
    minTasks: app.node.tryGetContext('moodle:minTasks') ?? 1,
    maxTasks: app.node.tryGetContext('moodle:maxTasks') ?? 10,
    cpuTargetUtilization: app.node.tryGetContext('moodle:cpuTargetUtilization') ?? 50,
    spotPercentage: app.node.tryGetContext('moodle:spotPercentage') ?? 75,
    minAcu: app.node.tryGetContext('moodle:minAcu') ?? 0.5,
    maxAcu: app.node.tryGetContext('moodle:maxAcu') ?? 10,
    backupRetentionDays: app.node.tryGetContext('moodle:backupRetentionDays') ?? 7,
    maxEcpu: app.node.tryGetContext('moodle:maxEcpu') ?? 100,
    maxCacheDataGb: app.node.tryGetContext('moodle:maxCacheDataGb') ?? 10,
    opcacheMemory: app.node.tryGetContext('moodle:opcacheMemory') ?? 512,
    cognitoDomainPrefix: app.node.tryGetContext('moodle:cognitoDomainPrefix') ?? `ecv-lms-${app.node.tryGetContext('moodle:environment') ?? 'production'}`,
    costAllocationTags: app.node.tryGetContext('moodle:costAllocationTags') ?? {
      Project: 'MoodleLMS',
      Environment: app.node.tryGetContext('moodle:environment') ?? 'production',
      ManagedBy: 'cdk',
    },
  };

  validateConfig(config);
  return config;
}
