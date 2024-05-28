import * as DataHelpers from '@js/helpers/data-helpers'
import * as ArrayHelpers from '@js/helpers/array-helpers'

// BEGIN of UUIDv4
export const UUIDv4 = {
    /**
     * Returns a UUIDv4 as string
     *
     * @returns
     */
    generate: () => {
        return (
            String('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')
        ).replace(/[xy]/g, (character) => {
            const random = (Math.random() * 16) | 0;
            const value = character === "x" ? random : (random & 0x3) | 0x8;

            return value.toString(16)
        })
    },

    /**
     *
     * @param {string} string
     *
     * @returns boolean
     */
    isValid: (string) => {
        const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

        return regexExp.test(string)
    }
}

/**
    // Usage:
    //
    // UuidHelper.generate() // 23a331a5-3c7a-4b68-95cf-5760375f8a5b
    // UuidHelper.isValid('23a331a5-3c7a-4b68-95cf-5760375f8a5b') // true
    // UuidHelper.isValid('23a331a5-3c7a-4b68-95cf') // false
*/
// END of UUIDv4

export const arrayUnique = (array) => {
    return ArrayHelpers.unique(array);
}

export const isValidObject = (value)=> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export const validObjectOr = (value, defaultValue = {})=> {
    return isValidObject(value) ? value : defaultValue;
}

export const canInstanciate = (item, ...params) => {
    try {
        if (!item) {
            return false;
        }

        new item(...params);

        return true;
    } catch(error) {
        let errorText = `${error}`.trim();

        let notClass = errorText.includes('TypeError') && errorText.includes('constructor');

        return !notClass;
    }
}

export const getClassOrFunctionName = () => {} // TODO

// const INVALID_CONSTRUCTOR = '__INVALID_CONSTRUCTOR__';
// const INVALID_CONSTRUCTOR = undefined;
// const INVALID_CONSTRUCTOR = '';
const INVALID_CONSTRUCTOR = null;

export const getConstructor = (target, defaultValue = null) => {
    defaultValue = defaultValue === null ? INVALID_CONSTRUCTOR : defaultValue;

    try {
        if (isValidObject(target)) {
            return target?.constructor && target?.constructor?.name || defaultValue;
        }

        if (target === 'undefined') {
            return 'undefined';
        }

        return target?.constructor && target?.constructor?.name || defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

export const getMethods = (target) => {
    let methods = [];

    if (!isValidObject(target) || Array.isArray(target)) {
        return methods;
    }

    Object.entries(target)
        .map(item => {
            let [key, value] = item;

            if (typeof target[key] === 'function') {
                methods.push(key);
            }
        });

    return methods || [];
}

export const infoOfObject = (target, trackCaller = false) => {
    let info = {};
    info['value'] = target;

    try {
        if (trackCaller) {
            let calledByInfo = new Error('calledInfo');

            info['calledByInfo'] = ((calledByInfoStack) => {
                try {
                    calledByInfoStack = typeof calledByInfoStack === 'string' ? calledByInfoStack : '';

                    if (!calledByInfoStack) {
                        return {};
                    }

                    calledByInfoStack = calledByInfoStack?.split(`\n`)[1] || '';

                    let fullPath = calledByInfoStack.slice(calledByInfoStack.indexOf('@') + 1);
                    let functionName = calledByInfoStack?.slice(0, calledByInfoStack?.indexOf('@'));
                    let line = fullPath.split(':').slice(fullPath.split(':').length -2)[0] || null;
                    let column = fullPath.split(':').slice(fullPath.split(':').length -1)[0] || null;
                    let lineAndColumn = [line, column].filter(item => !isNaN(parseInt(item))).join(':');
                    let file = fullPath.split(':').slice(0, fullPath.split(':').length - 2).join(':');

                    return {
                        file,
                        fullPath,
                        functionName,
                        line,
                        column,
                        joined: fullPath + (lineAndColumn ? ':' + lineAndColumn : ''),
                        fullTrace: calledByInfoStack,
                    };
                } catch (error) {
                    console.error(error); // DEBUG
                    return {};
                }
            })(calledByInfo?.stack || '');
        }

        let methods = getMethods(target);

        let bareConstructor = target?.constructor?.name || null;

        let attributes = (('getAttributeNames' in methods) || target?.getAttributeNames)
            ? target?.getAttributeNames() || []
            : [];
        let bareName = (attributes || []).includes('name') ? bareConstructor : target?.name;
        let canBeInstantiated = canInstanciate(target);
        let targetType = typeof target;
        let isInstanceOf = (targetType === 'object') && bareConstructor && (bareName === undefined) ? bareConstructor : null;
        let isAClass = (bareConstructor === 'Function') && (targetType === 'function') && canBeInstantiated;
        let constructorName = getConstructor(target);

        info['constructorName'] = constructorName;
        info['bareConstructor'] = bareConstructor;
        info['bareName'] = bareName;
        info['canBeInstantiated'] = canBeInstantiated;
        info['itemType'] = targetType;
        info['isAClass'] = isAClass;
        info['className'] = isAClass ? bareName : (bareConstructor || constructorName);
        info['isInstanceOf'] = isInstanceOf;
        info['isObject'] = !isAClass && isValidObject(target);
        info['isBasicObject'] = isValidObject(target) && isInstanceOf === 'Object';
        info['methods'] = methods;

        return info;
    } catch (error) {
        console.log(error); // DEBUG

        return info;
    }
}

export const isBasicObject = (content) => {
    return get(infoOfObject(content, false), 'isBasicObject', false);
}

export const typeOf = (content) => {
    return typeof content;
}

export const typeOfIn = (content, ...types) => {
    if (!Array.isArray(types) || !types.length) {
        return false;
    }

    types = types.filter(item => typeof item === 'string' && item.trim());

    return types.length && types.includes(typeof content);
}

export const getClassName = (object) => {
    let info = infoOfObject(object);

    // if (!get(info, 'isAClass')) {
    //     return null;
    // }

    return get(info, 'className');
}

export const isAClass = (object) => {
    return (infoOfObject(object) || {})['isAClass'] || false;
}

export const instanceOf = (object) => {
    try {
        let objectInfo = infoOfObject(object, false);

        let {
            isInstanceOf,
            bareName,
            className,
            bareConstructor,
            constructorName,
            itemType,
        } = objectInfo || {};

        return isInstanceOf ||
            bareName ||
            className ||
            bareConstructor ||
            constructorName ||
            itemType || null;
    } catch (error) {
        console.log(error); // DEBUG

        return null;
    }
}

export const instanceOfIn = (object, ...toCompare) => {
    if (!Array.isArray(toCompare) || !toCompare.length) {
        return false;
    }

    toCompare = toCompare
        .filter(item => item && typeOfIn(item, 'function', 'string'))
        .map(item => {
            if (typeOfIn(item, 'function')) {
                item = isAClass(item) ? getClassName(item) : null;
            }

            return item;
        });

    if (!toCompare.length) {
        return false;
    }

    let objectInfo = infoOfObject(object, false);

    let {
        isInstanceOf,
        bareName,
        bareConstructor,
        constructorName,
        itemType,
    } = objectInfo || {};

    let objectInfoValues = [
        isInstanceOf,
        bareName,
        bareConstructor,
        constructorName,
        itemType,
    ]
    .filter(item => item && typeOfIn(item, 'string'));

    if (!objectInfoValues.length) {
        return false;
    }

    for (let item of toCompare) {
        if (objectInfoValues.includes(item)) {
            return true;
        }
    }

    return false;
}

export const objectMerge = (...objects) => {
    let newObject = {};

    objects.filter(item => item && typeof item === 'object' && !Array.isArray(item))
        .forEach(item => {
        newObject = {
            ...newObject,
            ...item,
        };
        });

    return newObject;
}

export const strval = (content) => {
    try {
        if (isValidObject(content) && has(content, 'toString') && typeOfIn(content?.toString, 'function')) {
            content = content?.toString() || '';
        }

        return `${content}`;
    } catch (error) {
        console.error(error);
        return '';
    }
}

export const trimStr = (content) => {
    return strval(content).trim();
}

export const get = (object, notation, defaultValue = null) => {
    try {
        notation = Array.isArray(notation) || typeOfIn(notation, 'number', 'string') ? strval(notation) : '';

        let keys = Array.isArray(notation)
            ? notation.filter(
                item => typeOfIn(item, 'number', 'string') && trimStr(item) !== ''
            )
                .map(item => trimStr(item))
            : notation.split('.');

        let result = object;

        keys.forEach(key => {
            key = strval(key);

            if (result === undefined) {
                return defaultValue;
            }

            result = result[`${key}`]
        })

        return (result === undefined) ? defaultValue : result;
    } catch (err) {
        return defaultValue;
    }
}

export const isValidKey = (key) => {
    return Boolean(['string', 'number'].includes(typeof key));
}

export const validKey = (key) => {
    return isValidKey(key) ? `${key}` : null;
}

export const put = (object, key, value) => {
    object = validObjectOr(object, {});

    key = validKey(key);

    if (key === null || !key.trim()) {
        return object;
    }

    object[key] = value;

    return object;
}

export const exists = (object, key) => {
    if (!isValidObject(object)) {
        return false;
    }

    key = validKey(key);

    if (key === null || !key.trim()) {
        return false;
    }

    return (key in object);
}

export const has = (object, key) => {
    return exists(object, key);
};

export const putIfNoExists = (object, key, value) => {
    if (exists(object, key)) {
        return null;
    }

    return put(object, key, value);
}

export const only = (object, ...keys) => {
    let filteredItems = {};
    object = validObjectOr(object, {});

    keys = keys.filter(item => typeOfIn(item, 'number', 'string'));

    if (!keys || !keys.length) {
        return filteredItems;
    }

    for (let key of keys) {
        if (!has(object, key)) {
            continue;
        }

        filteredItems[key] = get(object, key);
    }

    return filteredItems;
}

export const onlyValues = (object, ...keys) => {
    return Object.values(only(object, ...keys));
}

export const onlyAsArray = (object, ...keys) => {
    return onlyValues(object, ...keys);
}
