import {
  DataTypes,
  HasManyCreateAssociationMixin,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import dotenv from "dotenv";
dotenv.config(); // TODO: Use proper credential storage

const sequelize = new Sequelize({
  database: "Auth",
  dialect: "mysql",
  host: process.env.MYSQL_HOST,
  logging: () => undefined,
  password: process.env.MYSQL_PASSWORD,
  username: process.env.MYSQL_USERNAME,
});

export class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  declare AccountId: number;
  declare CreatedTimestamp: number;
}
export class Identity extends Model<
  InferAttributes<Identity>,
  InferCreationAttributes<Identity>
> {
  declare AddedTimestamp: number;
  declare IdentityContent: string;
  declare IdentityId: number;
  declare IdentityType: number;
  declare Verified: boolean;
  declare AccountId: ForeignKey<Account["AccountId"]>;
}
export class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare ClientCountry: string;
  declare ClientFingerprint: string;
  declare ClientIP: string;
  declare ClientUserAgentHash: string;
  declare CreatedTimestamp: number;
  declare SessionId: number;
  declare Token: string;
  declare AccountId: ForeignKey<Account["AccountId"]>;
}
export class SessionUse extends Model<
  InferAttributes<SessionUse>,
  InferCreationAttributes<SessionUse>
> {
  declare ClientCountry: string;
  declare ClientFingerprint: string;
  declare ClientIP: string;
  declare ClientUserAgentHash: string;
  declare EndTimestamp: number;
  declare StartTimestamp: number;
  declare SessionId: ForeignKey<Session["SessionId"]>;
}

export class RateLimitingEvent extends Model<
  InferAttributes<RateLimitingEvent>,
  InferCreationAttributes<RateLimitingEvent>
> {
  declare EventActor: string;
  declare EventTimestamp: number;
  declare EventType: string;
}

Account.init(
  {
    AccountId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    CreatedTimestamp: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
  },
  { sequelize }
);

Identity.init(
  {
    AddedTimestamp: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
    IdentityContent: {
      allowNull: false,
      type: DataTypes.TEXT("medium"),
    },
    IdentityId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    IdentityType: {
      allowNull: false,
      type: DataTypes.SMALLINT,
    },
    Verified: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.BOOLEAN,
    },
  },
  { sequelize }
);

Session.init(
  {
    ClientCountry: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    ClientFingerprint: {
      allowNull: false,
      type: DataTypes.TEXT("medium"),
    },
    ClientIP: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    ClientUserAgentHash: {
      allowNull: false,
      type: DataTypes.TEXT("medium"),
    },
    CreatedTimestamp: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
    SessionId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    Token: {
      allowNull: false,
      type: DataTypes.TEXT("medium"),
    },
  },
  { sequelize }
);

SessionUse.init(
  {
    ClientCountry: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    ClientFingerprint: {
      allowNull: false,
      type: DataTypes.TEXT("medium"),
    },
    ClientIP: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    ClientUserAgentHash: {
      allowNull: false,
      type: DataTypes.TEXT("medium"),
    },
    EndTimestamp: {
      allowNull: true,
      type: DataTypes.BIGINT,
    },
    StartTimestamp: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
  },
  { sequelize }
);

RateLimitingEvent.init(
  {
    EventActor: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    EventTimestamp: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
    EventType: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },
  { sequelize }
);

Account.hasMany(Identity, {
  foreignKey: "AccountId",
  onDelete: "CASCADE",
});
Identity.belongsTo(Account, {
  foreignKey: "AccountId",
});

Account.hasMany(Session, {
  foreignKey: "AccountId",
  onDelete: "CASCADE",
});
Session.belongsTo(Account, {
  foreignKey: "AccountId",
});

Session.hasMany(SessionUse, {
  foreignKey: "SessionId",
  onDelete: "CASCADE",
});
SessionUse.belongsTo(Session, {
  foreignKey: "SessionId",
});

export const DBReady = (async () => {
  await sequelize.sync({ alter: true });
})();
