/// <reference path="./.sst/platform/config.d.ts" />

import pulumi from "@pulumi/pulumi"
import z from "zod"

export default $config({
  app(input) {
    return {
      name: "html-scraper",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "ap-south-1",
        },
      },
    }
  },

  async run() {
    const schema = z
      .object({
        API_KEY: z.string().min(8),
        PULUMI_NODEJS_STACK: z.enum(["dev"]),
      })
      .parse(process.env)

    const lambda = new sst.aws.Function("html-scraper", {
      handler: "src/index.handler",
      memory: "512 MB",
      runtime: "nodejs20.x",
      url: true,
      environment: {
        API_KEY: schema.API_KEY,
      },
    })

    return {
      URL: pulumi.interpolate`${lambda.url}?key=${schema.API_KEY}&search=https://api.apify.com/v2/browser-info`,
    }
  },
})
