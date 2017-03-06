import {Promise} from "es6-shim";
export interface CalculateBehavior {
    calculate(...args): Promise<any>;
}