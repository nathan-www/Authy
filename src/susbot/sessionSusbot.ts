import { Session, SessionUse } from "../db";
import { SESSION_SUSBOT_CONFIG } from "../constants";

export default async function sessionSusbot(session: Session) {
  return {
    pass: false,
  };
}
