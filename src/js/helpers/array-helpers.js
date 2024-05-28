import * as DataHelpers from '@js/helpers/data-helpers'
import * as NumberHelpers from '@js/helpers/number-helpers'

export const isArray = (array) => {
    return Array.isArray(array);
}

export const unique = (array) => {
    if (!Array.isArray(array)) {
        return [];
    }

    return [...new Set(array)];
}

export const filledOnly = (values) => {
    if (!Array.isArray(values)) {
        return [];
    }

    return values.filter(item => DataHelpers.filled(item)) || [];
}

export const uniqueAndFilledOnly = (values) => {
    return unique(filledOnly(values));
}

export const wrap = (content) => {
    if (Array.isArray(content)) {
        return content;
    }

    return [content];
}

export const inArrayKey = (value, array, checkType = false) => {
    array = wrap(array);

    let findKey = undefined;

    array.find((item, key) => {
        if (findKey !== undefined) {
            return findKey;
        }

        if (checkType ? item === value : item == value) {
            findKey = key;
            return key;
        }

        findKey = undefined;
    });

    return findKey !== undefined ? findKey : -1;
}

export const inArray = (value, array, checkType = false) => {
    array = wrap(array);

    // return array.find(item => {
    //     return checkType ? item === value : item == value;
    // }) !== undefined;

    return inArrayKey(value, array, checkType) !== -1;
}

export const toggleItem = (array, item, strict = false) => {
    array = wrap(array);

    let keyOnArray = inArrayKey(item, array, strict);

    if (keyOnArray !== -1) {
        array.splice(keyOnArray, 1);

        return array;
    }

    array.push(item);

    return array;
}

export const toggle = (array, toCompare, strict = false) => {
    return toggleItem(array, toCompare, strict);
}
