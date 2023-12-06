export const USER_LABEL = "user";
export const OTP_LABEL = "otp";
export const USER_PASSWORD_LABEL = "user_password";
export const LOGIN_SESSION_LABEL = "login_session";
export const LOGIN_SESSION_VALIDITY = 86400000;
export const OTP_VALIDITY_PERIOD = 5;
export const UPLOADED_FILE = "uploaded_file";


export const DEFAULT_API_RESPONSE = `
    <div style="padding: 20px; text-align: center; background-color: rgb(79, 78, 78); color: aliceblue;">
        <h1>Welcome to Mainstack's BE engineer test live API</h1>
        
        <b>Kindly check the postman documentation for available endpoints</b>
    </div>`;

export const USER_STATUS = Object.freeze({
    IN_REVIEW: "in review",
    PENDING: 'pending',
    ACTIVE: 'active',
    SELF_DEACTIVATED: 'self_deactivated',
    SUSPENDED: 'suspended',
    DEACTIVATED: 'deactivated',
    HIDDEN: 'hidden'
});

export const GENDER = Object.freeze({
    MALE: "male",
    FEMALE: "female",
    NOT_SAY: "I will rather not say"
});

export const ITEM_STATUS = Object.freeze({
    OPEN: 'open',
    CREATED: 'created',
    PENDING: 'pending',
    IN_REVIEW: 'in review',
    ACTIVE: 'active',
    DEACTIVATED: 'deactivated',
    DELETED: 'deleted',
    ARCHIVED: 'archived',
    SUSPENDED: 'suspended',
    HIDDEN: 'hidden',
    CLOSED: 'closed',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    USED: 'used',
    SkIPPED: 'skipped',
})

export const BIT = Object.freeze({
    ON: 1,
    OFF: 0
});

export const OTP_TYPES = Object.freeze({
    LOGIN: "login",
    PASSWORD_UPDATE: "password update",
    PASSWORD_RESET: "password reset",
    EMAIL_VERIFICATION: "email verification"
});

export const OTP_STATUS = Object.freeze({
    ACTIVE: "active",
    DEACTIVATED: "deactivated",
    USED: "used",
    BARRED: "barred"
});

export const PASSWORD_STATUS = Object.freeze({
    ACTIVE: "active",
    DEACTIVATED: "deactivated",
    COMPROMISED: "compromised",
    BLACKLISTED: "blacklisted"
});

export const ENVIRONMENTS = Object.freeze({
    PROD: "production",
    DEV: "development",
    UAT: "user acceptance testing",
    STAGING: "staging"
});


export const PRODUCT_STATUS = Object.freeze({
    ACTIVE: "active",
    DEACTIVATED: "deactivated",
    SUSPENDED: "suspended",
    BANNED: "banned",
    DELETED: "deleted"
});