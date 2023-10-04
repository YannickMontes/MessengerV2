import * as dotenv from "dotenv";

dotenv.config();

export default {
	DB_ADDRESS: process.env.DB_ADDRESS ?? "",
	PORT: process.env.PORT ?? 5000,
	SECRET_KEY: process.env.SECRET_KEY ?? "secretkey",
	TOKEN_EXP: process.env.TOKEN_EXP ?? "1d",
	SALT_ROUNDS: process.env.SALT_ROUND ?? 10,
};
