/// <reference path="./.sst/platform/config.d.ts" />

import pulumi from "@pulumi/pulumi"
import z from "zod"

export default $config({
  app(input) {
    return {
      name: "htmlscraper",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    }
  },

  async run() {
    const schema = z
      .object({
        API_KEY: z.string().min(8),
        SST_AWS_ACCESS_KEY_ID: z.string(),
        SST_AWS_SECRET_ACCESS_KEY: z.string(),
        PULUMI_NODEJS_PROJECT: z.string(),
        PULUMI_NODEJS_STACK: z.enum(["dev"]),
      })
      .parse(process.env)

    const apSouth1 = new sst.aws.Function(
      "htmlscraper",
      {
        handler: "src/index.handler",
        memory: "512 MB",
        runtime: "nodejs20.x",
        url: true,
        environment: {
          API_KEY: schema.API_KEY,
          ACCESS_KEY_ID: schema.SST_AWS_ACCESS_KEY_ID,
          SECRET_ACCESS_KEY: schema.SST_AWS_SECRET_ACCESS_KEY,
          FUNCTION_NAME: `${schema.PULUMI_NODEJS_PROJECT}-${schema.PULUMI_NODEJS_STACK}-${schema.PULUMI_NODEJS_PROJECT}Function`,
          FUNCTION_REGION: "ap-south-1",
        },
      },
      {
        provider: new aws.Provider("ap-south-1", { region: "ap-south-1" }),
      },
    )

    return {
      Console: "https://console.aws.amazon.com/lambda",
      URL: pulumi.interpolate`${apSouth1.url}?key=${schema.API_KEY}&search=https://api.apify.com/v2/browser-info`,
    }
  },
})
