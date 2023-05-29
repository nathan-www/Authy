import { DBReady, RateLimitingEvent } from "./db";
import express from "express";
import verifySession from "./session/verifySession";
import cookieParser from "cookie-parser";
import { Account } from "./db";

const app = express();
const port = 3000;

app.use(cookieParser());

app.post("/", async (req, res) => {
  const clientInfo = {
    cookies: req.cookies,
    country: "GB",
    fingerprint: "a71d233137a35b3967269e871899805c",
    ip: "109.202.242.254",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0",
  };

  const info = await verifySession(clientInfo);

  res.contentType("application/json");
  res.send(JSON.stringify(info));
});

DBReady.then(async () => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});

/* 

INSERT INTO `Auth`.`Sessions` (`ClientCountry`, `ClientFingerprint`, `ClientIP`, `ClientUserAgentHash`, `CreatedTimestamp`, `SessionId`, `Token`, `createdAt`, `updatedAt`, `AccountId`) VALUES ('GB', 'a71d233137a35b3967269e871899805c', '109.202.242.254', 'd0a241a4c269cb31f07cd1927ec17c99', 1685384794601, 1, 'gG2J6LeISs9eBC3W9FQpq17whgGmTGRx', NOW(), NOW(), 100437487452048);

INSERT INTO `Auth`.`SessionUses` (`id`, `ClientCountry`, `ClientFingerprint`, `ClientIP`, `ClientUserAgentHash`, `EndTimestamp`, `StartTimestamp`, `createdAt`, `updatedAt`, `SessionId`) VALUES (1, 'GB', 'a71d233137a35b3967269e871899805c', '109.202.242.254', 'd0a241a4c269cb31f07cd1927ec17c99', 1685384794601, 1685384794601, NOW(), NOW(), 1);

*/

/*
const newAccount = await Account.create({
    AccountId: 100437487452048,
    CreatedTimestamp: Date.now(),
  });

  newAccount.createIdentity({
    AddedTimestamp: Date.now(),
    IdentityContent: "nathanjaarnold@gmail.com",
    IdentityId: 200043749847399,
    IdentityType: 0,
    Verified: true,
  });

  const newSession = await newAccount.createSession({
    ClientCountry: "GB",
    ClientFingerprint: "a71d233137a35b3967269e871899805c",
    ClientIP: "109.202.242.254",
    ClientUserAgentHash: "d0a241a4c269cb31f07cd1927ec17c99",
    CreatedTimestamp: Date.now(),
    SessionId: "303737483294234",
    Token: "gG2J6LeISs9eBC3W9FQpq17whgGmTGRx",
  });

  newSession.createSessionUse({
    ClientCountry: "GB",
    ClientFingerprint: "a71d233137a35b3967269e871899805c",
    ClientIP: "109.202.242.254",
    ClientUserAgentHash: "d0a241a4c269cb31f07cd1927ec17c99",
    EndTimestamp: Date.now(),
    StartTimestamp: Date.now(),
  });
  */
