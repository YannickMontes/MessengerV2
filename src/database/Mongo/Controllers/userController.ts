import bcrypt from "bcrypt";
import User, { IUser } from "../Models/UserModel.js"; // You should import the appropriate User model and IUser interface.
import { pickRandom } from "../../../pictures.js";

const ACTIVE_TIMER_MS = 20000;

interface UserResult {
	user?: IUser | null;
	error?: any;
}

interface UsersResult {
	users?: IUser[];
	error?: any;
}

interface PwdResult {
	valid: boolean;
	error?: any;
}

class UserController {
	async isPasswordValid(user: IUser, password: string): Promise<PwdResult> {
		try {
			const pwdValid = await bcrypt.compare(password, user.password);
			return { valid: pwdValid ? true : false };
		} catch (error) {
			return { valid: false, error };
		}
	}

	async refreshUserActivity(username: string): Promise<UserResult> {
		try {
			const user = await User.findOne({ username });
			if (user != null) {
				user.lastConnected = new Date();
				await user.save();
				return { user };
			} else {
				return { error: "User not found." };
			}
		} catch (error) {
			return { error };
		}
	}

	async createUser(username: string, hashedPwd: string): Promise<UserResult> {
		try {
			const newUser = new User({
				username,
				password: hashedPwd,
				profilePicId: pickRandom(),
				lastConnected: new Date(),
			});
			const savedUser = await newUser.save();
			return { user: savedUser };
		} catch (error) {
			return { error };
		}
	}

	async getUser(username: string): Promise<UserResult> {
		try {
			const user = await User.findOne({ username });
			return { user };
		} catch (error) {
			return { error };
		}
	}

	async getUserById(userId: string): Promise<UserResult> {
		try {
			const user = await User.findById(userId);
			return { user };
		} catch (error) {
			return { error };
		}
	}

	async getAllUsers(): Promise<UsersResult> {
		try {
			const users = await User.find();
			return { users };
		} catch (error) {
			return { error };
		}
	}

	async getAllActiveUsers(): Promise<UsersResult> {
		try {
			const activeUsers = await User.find()
				.where("lastConnected")
				.gte(Date.now() - ACTIVE_TIMER_MS);
			return { users: activeUsers };
		} catch (error) {
			return { error };
		}
	}
}

let userController = new UserController();

export { userController };
export type { UserController };
