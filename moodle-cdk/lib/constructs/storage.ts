import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface StorageProps {
  vpc: ec2.IVpc;
  efsSecurityGroup: ec2.ISecurityGroup;
  kmsKey: kms.IKey;
}

export class Storage extends Construct {
  public readonly fileSystem: efs.FileSystem;
  public readonly accessPoints: Record<string, efs.AccessPoint>;

  constructor(scope: Construct, id: string, props: StorageProps) {
    super(scope, id);

    const { vpc, efsSecurityGroup, kmsKey } = props;

    // --- EFS Filesystem ---
    this.fileSystem = new efs.FileSystem(this, 'MoodleEfs', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroup: efsSecurityGroup,
      encrypted: true,
      kmsKey,
      throughputMode: efs.ThroughputMode.ELASTIC,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // --- Access Points ---
    // POSIX user 33:33 = www-data (standard Apache/Nginx user)
    const posixUser: efs.PosixUser = { uid: '33', gid: '33' };
    const createDirPermissions: efs.Acl = { ownerUid: '33', ownerGid: '33', permissions: '0755' };

    const accessPointConfigs: Record<string, string> = {
      data: '/var/www/moodle/data',
      cache: '/var/www/moodle/cache',
      temp: '/var/www/moodle/temp',
    };

    this.accessPoints = {};

    for (const [name, path] of Object.entries(accessPointConfigs)) {
      this.accessPoints[name] = new efs.AccessPoint(this, `${capitalize(name)}AccessPoint`, {
        fileSystem: this.fileSystem,
        path,
        posixUser,
        createAcl: createDirPermissions,
      });
    }
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
