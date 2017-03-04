import * as React from 'react';

export function Autobind(cmp: React.Component<any, any>, methodName: string) {
    debugger
    cmp[methodName] = cmp[methodName].bind(cmp);
    return cmp;
}
