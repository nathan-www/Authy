import { Validator as JSONSchemaValidator } from "jsonschema";
import validator from "validator";

const JSONSchemaValidatorInst = new JSONSchemaValidator();

// Validate IP
JSONSchemaValidator.prototype.customFormats.isIP = (input) =>
  validator.isIP(input);

// Validate email address
JSONSchemaValidator.prototype.customFormats.isEmailAddress = (input) =>
  validator.isEmail(input);

/*
EmailSimpleLoginInfo
*/

export interface EmailSimpleLoginInfoType {
  emailAddress: string;
  password: string;
}

export function EmailSimpleLoginInfoValidator(
  loginInfo: EmailSimpleLoginInfoType
) {
  // TODO: Add regex to stop bad special characters
  return JSONSchemaValidatorInst.validate(loginInfo, {
    type: "object",
    properties: {
      emailAddress: {
        format: "isEmailAddress",
        maxLength: 255,
        type: "string",
      },
      password: {
        type: "string",
        minLength: 1,
        maxLength: 255,
      },
    },
    required: ["emailAddress", "password"],
  }).valid;
}

/*
EmailSimpleRegistrationInfo
*/

export interface EmailSimpleRegistrationInfoType {
  emailAddress: string;
  password: string;
}

export function EmailSimpleRegistrationInfoValidator(
  registrationInfo: EmailSimpleRegistrationInfoType
) {
  // TODO: Add regex to stop bad special characters
  return JSONSchemaValidatorInst.validate(registrationInfo, {
    type: "object",
    properties: {
      emailAddress: {
        format: "isEmailAddress",
        maxLength: 255,
        type: "string",
      },
      password: {
        type: "string",
        minLength: 1,
        maxLength: 255,
      },
    },
    required: ["emailAddress", "password"],
  }).valid;
}

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
