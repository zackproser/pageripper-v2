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
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryUrl = exports.apiUrl = void 0;
const aws = __importStar(require("@pulumi/aws"));
const awsx = __importStar(require("@pulumi/awsx"));
const pulumi = __importStar(require("@pulumi/pulumi"));
// Create an ECR repository to store the Docker image.
const repo = new awsx.ecr.Repository("my-repo");
// Build and publish the Docker image to the ECR repository.
const image = new awsx.ecr.Image("my-image", {
    path: "./", // The path to your Dockerfile and source code
    repositoryUrl: repo.repository.repositoryUrl,
});
// Create a new VPC for our ECS service, or use an existing one.
const vpc = awsx.ec2.Vpc.getDefault();
// Create an ECS cluster.
const cluster = new awsx.ecs.Cluster("my-cluster", { vpc });
// Define the log group for the Fargate service.
const logGroup = new aws.cloudwatch.LogGroup("my-log-group");
// Create a Fargate service.
const fargateService = new awsx.ecs.FargateService("my-service", {
    cluster,
    taskDefinitionArgs: {
        containers: {
            app: {
                image: image.imageValue, // Use the built image
                memory: 512,
                portMappings: [{ containerPort: 80 }],
                logConfiguration: {
                    logDriver: "awslogs",
                    options: {
                        "awslogs-group": logGroup.name,
                        "awslogs-region": pulumi.output(aws.getRegion()).name,
                        "awslogs-stream-prefix": "app",
                    },
                },
            },
        },
    },
    desiredCount: 1,
});
// Create an API Gateway to route traffic to the Fargate service.
const api = new awsx.apigateway.API("my-api", {
    routes: [
        {
            path: "/",
            target: fargateService,
            method: "ANY",
        },
    ],
});
// Export the API URL and the ECR repository URL.
exports.apiUrl = api.url;
exports.repositoryUrl = repo.repository.repositoryUrl;
