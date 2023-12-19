
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";


// Create an ECR repository to store the Docker image.
const repo = new aws.ecr.Repository("api-repo", {
  forceDelete: true,
});

// Set up auth for the ECR repository
const registryInfo = repo.registryId.apply(async id => {
  const credentials = await aws.ecr.getCredentials({ registryId: id });
  const decodedCredentials = Buffer.from(credentials.authorizationToken, "base64").toString();
  const [username, password] = decodedCredentials.split(":");
  if (!password || !username) {
    throw new Error("Invalid credentials");
  }
  return {
    server: credentials.proxyEndpoint,
    username: username,
    password: password,
  };
});

const image = new docker.Image('api-image', {
  build: {
    platform: "linux/amd64",
    context: ".",
  },
  imageName: repo.repositoryUrl,
  registry: registryInfo,
})
export const repoDigest = image.repoDigest


// Build and publish the Docker image to the ECR repository.
// Create a new VPC for our ECS service, or use an existing one.
const vpc = new awsx.ec2.Vpc("custom", {})

// Create a security group for the load balancer
const lbSecurityGroup = new aws.ec2.SecurityGroup("lb-security-group", {
  vpcId: vpc.vpcId,
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"],
  }],
  ingress: [{
    protocol: "tcp",
    fromPort: 80,
    toPort: 80,
    cidrBlocks: ["0.0.0.0/0"],
  }],
});

const alb = new awsx.lb.ApplicationLoadBalancer("alb", {
  defaultTargetGroup: {
    port: 3000,
    protocol: "HTTP",
    targetType: "ip"
  },
  internal: false,
  listener: {
    port: 80,
    protocol: "HTTP",
  },
  securityGroups: [lbSecurityGroup.id],
  subnetIds: vpc.publicSubnetIds,
});


// Create a security group for the frontend service
const frontendSecurityGroup = new aws.ec2.SecurityGroup("frontend-security-group", {
  vpcId: vpc.vpcId,
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"],
  }],
  ingress: [{
    protocol: "tcp",
    fromPort: 3000,
    toPort: 3000,
    securityGroups: [lbSecurityGroup.id],
  }],
});

// Create an ECS cluster.
const cluster = new aws.ecs.Cluster("my-cluster", {});

// Define the log group for the Fargate service.
const logGroup = new aws.cloudwatch.LogGroup("my-log-group");

const apiService = new awsx.ecs.FargateService("frontend-service", {
  cluster: cluster.arn,
  desiredCount: 2,
  networkConfiguration: {
    assignPublicIp: true,
    securityGroups: [frontendSecurityGroup.id],
    subnets: vpc.publicSubnetIds,
  },
  taskDefinitionArgs: {
    container: {
      name: "frontend",
      image: repoDigest,
      cpu: 512,
      memory: 1024,
      essential: true,
      portMappings: [{
        containerPort: 3000,
        hostPort: 3000,
        targetGroup: alb.defaultTargetGroup,
      }],
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-group": logGroup.name,
          "awslogs-region": 'us-east-1',
          "awslogs-stream-prefix": "frontend"
        }
      },
      environment: [
      ],
    },
  },
});


// Create an API Gateway to route traffic to the Fargate service.
/*const api = new awsx.api.API("my-api", {
  routes: [
    {
      path: "/",
      target: apiService,
      method: "ANY",
    },
  ],
});*/

// Export the API URL and the ECR repository URL.
//export const apiUrl = api.url;
export const repositoryUrl = repo.repositoryUrl;
