import * as joi from "joi";
import { EReaction } from "./database/Mongo/Models/MessageModel";
import { Request } from "express";

const pwdMinSize = 5;
const pwdMaxSize = 15;

const loginBodyFormat = joi.object({
	username: joi.string().required(),
	password: joi.string().min(pwdMinSize).max(pwdMaxSize).required(),
});

const createMessageBodyFormat = joi.object({
	conversationId: joi.string().not(null).not(""),
	messageContent: joi.string().required().not(null).not(""),
	messageReplyId: joi.string().not(null).not("").optional(),
});

const editMessageBodyFormat = joi.object({
	conversationId: joi.string().not(null).not(""),
	newMessageContent: joi.string().required().not(null).not(""),
});

const reactMessageBodyFormat = joi.object({
	reaction: joi.string().required().valid(... Object.values(EReaction)),
});

const createConversationBodyFormat = joi.object({
	concernedUsersIds: joi.array<string>().required().min(1),
});

interface JoiRequestValidatorResponse
{
	error?: string
}

interface JoiRouteValidator
{
	route: string,
	method: string,
	validatorSchema: joi.ObjectSchema<any>
}

class JoiRequestValidator 
{
	validators: JoiRouteValidator[] = 
	[
		{
			route: "/conversations/:id",
			method: "POST",
			validatorSchema: createMessageBodyFormat,
		},
		{
			route: "/conversations/",
			method: "POST",
			validatorSchema: createConversationBodyFormat,
		},
		{
			route: "/messages/:id",
			method: "PUT",
			validatorSchema: editMessageBodyFormat,
		},
		{
			route: "/messages/:id",
			method: "POST",
			validatorSchema: reactMessageBodyFormat,
		},
		{
			route: "/users/login",
			method: "POST",
			validatorSchema: loginBodyFormat,
		},
	];

	validate(request: Request): JoiRequestValidatorResponse 
	{
		let fullRoute = request.baseUrl + request.route.path;
		let specificValidator = undefined;
		for(let validator of this.validators)
		{
			if(validator.route == fullRoute && validator.method == request.method)
			{
				specificValidator = validator;
				break;
			}
		}
		if(!specificValidator)
			return {};

		let validRes = specificValidator.validatorSchema.validate(request.body);
		if(validRes.error)
			return { error: this.convertJoiErrorToString(validRes) };
		return {};
	}

	convertJoiErrorToString(joiResult: joi.ValidationResult) : string
	{
		if(!joiResult.error)
			return "";
		let fullMessage = "Body request format error: ";
		for(let i = 0; i < joiResult.error.details.length; i++)
		{
			if (i > 0 && i < joiResult.error.details.length - 1)
				fullMessage += ", ";
			fullMessage += joiResult.error.details[i].message;
		}
		return fullMessage;
	}
}

export const JoiRequestValidatorInstance = new JoiRequestValidator();