export interface User {
    email: string;
    passwordHash: string;
    memberships: Membership[];
}

export interface Membership {
    model: string;
    until: Date;
}

export interface RedeemToken {
    code: string;
    model: string;
    durationDays: number;
    remainTimes: number;
}

export interface LoginState {
    login: boolean;
    email?: string;
    memberships?: Membership[];
    availableModels?: string[];
}
