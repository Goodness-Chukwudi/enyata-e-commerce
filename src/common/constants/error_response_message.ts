/**
 * Provides response messages and methods that generates customized error messages for http error responses.
 * - The messages returned are of type IResponseMessage
 * - IResponseMessage has a response_code field of type number
 * - In addition to the regular http error codes being returned, the response_code field provides a more specific way to track errors on the client side.
*/
class ErrorResponseMessage {

    public requiredField(field: string) {
        return {
          response_code: 2,
          message: field + " is required",
        };
    }

    public resourceNotFound(resource: string) {
        return {
          response_code: 3,
          message: resource + " not found",
        };
    }

    public readonly ERROR = {
        response_code: 4,
        message: "An error occurred",
    };

    public readonly DUPLICATE_EMAIL = {
        response_code: 5,
        message: "An account with this email already exist, please try a different email",
    };

    public readonly DUPLICATE_PHONE = {
        response_code: 6,
        message: "An account with this phone number already exist, please try a different phone number",
    };

    public readonly UNABLE_TO_SAVE = {
        response_code: 7,
        message: "Unable to save",
    };

    public readonly UNABLE_TO_COMPLETE_REQUEST = {
        response_code: 8,
        message: "Unable to complete request",
    };

    public invalidRequest(reason: string) {
        return {
          response_code: 9,
          message: "Invalid request. " + reason,
        };
    }

    public readonly INVALID_LOGIN = {
        response_code: 10,
        message: "Invalid email or password",
    };

    public readonly ACCOUNT_BLOCKED = {
        response_code: 11,
        message: "Account may have been blocked or suspended. Please contact administrator",
    };

    public readonly INVALID_TOKEN = {
        response_code: 12,
        message: "Unable to authenticate request. Please login again",
    };

    public  actionNotPermitted(action: string) {
        return {
          response_code: 13,
          message: action + " is not permitted",
        };
    }

    public readonly ACCOUNT_ACTIVATION_REQUIRED = {
        response_code: 14,
        message: "Account activation required",
    };
    
    public duplicateValue(value: string) {
        return {
          response_code: 15,
          message: `a duplicate value for ${value} already exists`,
        };
    }

    public readonly ALREADY_ACTIVATED = {
        response_code: 16,
        message: "Account already activated",
    };

    public readonly SESSION_EXPIRED = {
        response_code: 17,
        message: "Session expired. Please login again",
    }

    public readonly CONTACT_ADMIN = {
        response_code: 18,
        message: "An error occurred, please contact admin",
    };

    public readonly UNABLE_TO_LOGIN = {
        response_code: 19,
        message: "Unable to login",
    };

    public readonly INVALID_SESSION_USER = {
        response_code: 20,
        message: "Unable to validate the user in this session. Please login again",
    };

    public readonly PASSWORD_MISMATCH = {
        response_code: 21,
        message: "Passwords do not match",
    };

    public readonly PASSWORD_UPDATE_REQUIRED = {
        response_code: 22,
        message: "Password update is required for this account",
    };

    public readonly INVALID_PERMISSION = {
        response_code: 23,
        message: "Sorry you do not have permission to perform this action",
    };

    public invalidValue(field: string) {
        return {
          response_code: 24,
          message: `Invalid value provided for ${field}`,
        };
    }

    public readonly INVALID_EMAIL = {
        response_code: 25,
        message: "Invalid email address",
    };

    public readonly FILE_NOT_FOUND = {
        response_code: 26,
        message: "File not found. Please attach a file to your request",
    };

    public invalidFileType(fileTypes: string[]) {
        return {
            response_code: 27,
            message: "You tried to upload an invalid file type, upload a " +fileTypes.join()+ " file instead",
        }
    }

    public readonly FILE_SIZE_LIMIT = {
        response_code: 28,
        message: "The size of this file is larger than the accepted limit",
    };

    public readonly FILE_UPLOAD_ERROR = {
        response_code: 29,
        message: "Error uploading file. Please try again",
    };
    
    public readonly ACCOUNT_IS_IN_REVIEW = {
        response_code: 30,
        message: "This account is still in review and have not been approved yet",
    };

    public badRequestError(message: string) {
        return {
            response_code: 31,
            message: message
        }
    }

    public readonly MAX_FILE_COUNT_LIMIT = {
        response_code: 32,
        message: "You have exceeded the max number of files",
    };

    public readonly INVALID_OTP = {
        response_code: 33,
        message: "Invalid or expired otp",
    };

    public readonly DUPLICATE_USER_ROLE = {
        response_code: 34,
        message: "This user already has this privilege",
    };

    public readonly DUPLICATE_USERNAME = {
        response_code: 35,
        message: "An account with this username already exist, please try a different username",
    };

    public readonly ACCOUNT_PENDING = {
        response_code: 11,
        message: "Your account is still pending. Verify your email to activate your account",
    };
}


export default ErrorResponseMessage;