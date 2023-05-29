import { Validator as JSONSchemaValidator } from "jsonschema";
import validator from "validator";

const JSONSchemaValidatorInst = new JSONSchemaValidator();

// Validate IP
JSONSchemaValidator.prototype.customFormats.isIP = (input) =>
  validator.isIP(input);

/*
ClientInfo
*/

export interface ClientInfoType {
  country: string;
  ip: string;
  fingerprint: string;
  userAgent: string;
  cookies: {
    [key: string]: string;
  };
}

export function ClientInfoValidator(clientInfo: ClientInfoType) {
  // TODO: Add regex to stop bad special characters
  return JSONSchemaValidatorInst.validate(clientInfo, {
    properties: {
      cookies: {
        patternProperties: {
          "^.*$": {
            maxLength: 255,
            minLength: 1,
            type: "string",
          },
        },
        type: "object",
      },
      country: { maxLength: 2, minLength: 2, type: "string" },
      fingerprint: { maxLength: 255, minLength: 1, type: "string" },
      ip: { format: "isIP", maxLength: 255, minLength: 1, type: "string" },
      userAgent: { maxLength: 255, minLength: 1, type: "string" },
    },
    required: ["cookies", "fingerprint", "ip", "userAgent", "country"],
    type: "object",
  }).valid;
}
