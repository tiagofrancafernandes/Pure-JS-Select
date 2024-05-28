import * as DataHelpers from '@js/helpers/data-helpers';
import * as ArrayHelpers from '@js/helpers/array-helpers';

export const isNumeric = (value, strict = false) => {
    if (isNaN(parseFloat(value))) {
        return false;
    }

    if (strict) {
        return value?.constructor?.name === 'Number';
    }

    return true;
}

export const isNumber = (value, strict = true) => {
    return isNumeric(value, strict);
}

export const toFloat = (value, defaultValue = null) => {
    if (!isNaN(parseFloat(value))) {
        return parseFloat(value);
    }

    if (!isNaN(parseFloat(defaultValue))) {
        return parseFloat(defaultValue);
    }

    return parseFloat(0.00);
}

export const toInteger = (value, defaultValue = null) => {
    return parseInt(toFloat(value, defaultValue));
}

export const numberIsEqual = (value, toCompare, strict = false) => {
    if (!isNumeric(value) || !isNumeric(toCompare)) {
        return false;
    }

    if (strict) {
        return value === toCompare;
    }

    if (toInteger(value) == toFloat(toCompare)) {
        return true;
    }

    if (toFloat(toCompare) == toInteger(value)) {
        return true;
    }

    return false;
}

export const numberIsIn = (value, ...toCompare) => {
    toCompare = Array.isArray(toCompare[0] ?? null) ? toCompare[0] : toCompare;
    toCompare = ArrayHelpers.wrap(toCompare);

    return toCompare.filter(item => numberIsEqual(value, item, false)).length > 0;
}
