
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

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
export const apiUrl = api.url;
export const repositoryUrl = repo.repository.repositoryUrl;
