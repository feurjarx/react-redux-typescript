export const composition = (...fns) => (...args) => fns.forEach(f => f.apply(null, args));

export const prettylog = (data, color = 'green') => {
    console.log('***');
    console.log(`%c${ JSON.stringify(data, null, 2) }`, `color: ${color}; font-weight: bold`);
    console.log('***');
};