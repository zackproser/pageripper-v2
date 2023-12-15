"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryUrl = exports.repoDigest = void 0;
const aws = __importStar(require("@pulumi/aws"));
const awsx = __importStar(require("@pulumi/awsx"));
const docker = __importStar(require("@pulumi/docker"));
// Create an ECR repository to store the Docker image.
const repo = new aws.ecr.Repository("api-repo", {
    forceDelete: true,
});
const registryInfo = repo.registryId.apply((id) => __awaiter(void 0, void 0, void 0, function* () {
    const credentials = yield aws.ecr.getCredentials({ registryId: id });
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
}));
const image = new docker.Image('api-image', {
    build: {
        platform: "linux/amd64",
        context: ".",
    },
    imageName: repo.repositoryUrl,
    registry: registryInfo,
});
exports.repoDigest = image.repoDigest;
// Build and publish the Docker image to the ECR repository.
// Create a new VPC for our ECS service, or use an existing one.
const vpc = new awsx.ec2.Vpc("custom", {});
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
            image: exports.repoDigest,
            cpu: 512,
            memory: 1024,
            essential: true,
            portMappings: [{
                    containerPort: 3000,
                    hostPort: 3000, // May be removed, must match containerPort if present
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
            environment: [],
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
exports.repositoryUrl = repo.repositoryUrl;
