import * as ObjectHelpers from '@js/helpers/object-helpers';

const searchActionOnInput = (event, F2Instance) => {
    F2Instance = validateF2Instance(F2Instance, true);

    if (!F2Instance || !event?.target) {
        return false;
    }

    // F2Instance.getFilteredOptions()
    F2Instance.refreshOptionItems();
}

const generateOptionItems = (container) => { // WIP // DEBUG
    return [];
}

const validateCustomOptions = (customOptions) => {
    if (!customOptions || !Array.isArray(customOptions) || !customOptions?.length) {
        return false;
    }

    customOptions = customOptions.filter(
        item => (ObjectHelpers.isBasicObject(item) && Object.entries(item)?.length)
    );

    if (!customOptions?.length) {
        return false;
    }

    return customOptions; // WIP
}

const optionContentFormatter = (optionItem, container = null) => {
    optionItem = validateOptionItem(optionItem || null);

    if (!optionItem || !container) {
        return false;
    }

    let label = ObjectHelpers.get(optionItem, 'label');
    let content = ObjectHelpers.get(optionItem, 'content', label);

    content = typeof content === 'function' ? content(optionItem) : content;

    content = typeof content === 'string' ? content : '';

    return `${content}`;
}

const validateOptionItem = (optionItem) => {
    if (!ObjectHelpers.isValidObject(optionItem)) {
        return false;
    }

    return optionItem;
}

const validateF2Instance = (F2Instance, throwOnFail = false) => {
    if (ObjectHelpers.instanceOfIn(F2Instance, F2Selector)) {
        return F2Instance;
    }

    if (throwOnFail) {
        throw `Invalid F2Selector instance`;
    }

    return null;
}

const optionItemGenerator = (optionItem = {}, F2Instance = null) => {
    F2Instance = validateF2Instance(F2Instance, true);

    if (!F2Instance) {
        return false;
    }

    optionItem = validateOptionItem(optionItem);

    let {
        container,
    } = F2Instance;

    if (!optionItem || !container) {
        return false;
    }

    let optionItemElement = document.createElement('li');
    let attributes = ObjectHelpers.get(optionItem, 'attributes', {});

    for(let attributeItem of Object.entries(attributes)) {
        let [_key, _value] = attributeItem;
        _value = ['string', 'number', 'boolean'].includes(typeof _value) ? _value : JSON.stringify(_value);

        if (
            ['value', 'disabled', 'enabled', 'active'].includes(_key) &&
            !optionItemElement?.getAttributeNames()?.includes(`data-${_key}`)
        ) {
            optionItemElement.setAttribute(`data-${_key}`, _value);
        }

        optionItemElement.setAttribute(_key, _value);
    }

    optionItemElement.setAttribute('data-f2-selector-type', 'option');
    let value = ObjectHelpers.get(optionItem, 'value', null);
    value = ['string', 'number', 'boolean'].includes(typeof value) ? value : JSON.stringify(value);

    let dataValue = optionItemElement.getAttribute('data-value') || value;

    optionItemElement.setAttribute('data-value', dataValue);

    optionItemElement.innerHTML = optionContentFormatter(optionItem, container);

    return optionItemElement;
}

const validateInstanceOf = (targetInstance, mustBe, throwOnFail = false) => {
    if (ObjectHelpers.instanceOfIn(targetInstance, mustBe)) {
        return targetInstance;
    }

    if (throwOnFail) {
        throw `Invalid "${mustBe}" instance`;
    }

    return false;
}

const resetOptionElementToList = (F2Instance, htmlContent = '') => {
    F2Instance = validateF2Instance(F2Instance, true);

    if (!F2Instance) {
        return false;
    }

    let listElement = F2Instance.getListElement();

    if (!listElement) {
        return false;
    }

    listElement.innerHTML = htmlContent;
}

const pushOptionElementToList = (optionItemElement, F2Instance, mode = 'append') => {
    F2Instance = validateF2Instance(F2Instance, true);

    if (!F2Instance) {
        return false;
    }

    let listElement = F2Instance.getListElement();

    try {
        listElement = validateInstanceOf(listElement, 'HTMLUListElement', true);
        optionItemElement = validateInstanceOf(optionItemElement, 'HTMLLIElement', true);

        if (!listElement || !optionItemElement) {
            return false;
        }

        switch (mode) {
            case 'prepend':
                listElement.prepend(optionItemElement);
                break;

            case 'append':
            default:
                listElement.append(optionItemElement);
                break;
        }
    } catch (error) {
        console.error(error); // DEBUG

        return false;
    }
}

const actionWhenClickOnOption = (event, F2Instance = null) => {
    F2Instance = validateF2Instance(F2Instance, false);

    if (!F2Instance) {
        return false;
    }

    let optionElement = event.target;

    if (!optionElement) {
        return;
    }

    let optionData = ObjectHelpers.validObjectOr(optionElement.dataset);

    let value = ObjectHelpers.get(optionData, 'value');

    if (!DataHelpers.filled(value)) {
        return;
    }

    let selectedItems = F2Instance.getSelectedItems();

    if (!F2Instance.multiple) {
        selectedItems = [];
        F2Instance.setSelectedItems([]);
    }

    console.log(
        // ['selectedItems', selectedItems],
        ['ArrayHelpers.toggle(selectedItems, value)', ArrayHelpers.toggleItem(selectedItems, value)],
    );

    // selectedItems = ArrayHelpers.toggle(selectedItems, value);

    console.clear();
    console.log('-----------------------------------------');
    console.log('BEGIN optionItemElement click');
    console.log('selectedItems', F2Instance.getSelectedItems());
    // console.log(optionData);
    // console.log('value: ', value);
    // console.log('selectedItems: ', ArrayHelpers.toggle(selectedItems, value), value);
    // console.log('value: ', ArrayHelpers.toggle([value, 234, 456], value));
    // console.log(event, F2Instance);
    console.log('END optionItemElement click');
    console.log('-----------------------------------------');

    F2Instance.setSelectedItems(selectedItems);
}

class F2Selector {
    config = {};
    selectorId = null;
    container = null;
    searchElement = null;
    multiple = false;
    selectedItems = [];
    optionItems = {};
    referenceSelectElement = null;

    constructor(referenceSelectElement, config = {}) {
        this.setReferenceSelectElement(referenceSelectElement);
        this.setConfig(config);
        let containerElement = this.getOrGenerateContainerElement();

        console.log('containerElement', containerElement);

        this.setContainer(containerElement);
        this.searchElement = null;
        this.initSearchElement();
        this.generateOptionItems();
        this.refreshAll();
    }

    get searchValue() {
        if (!this.searchElement) {
            return null;
        }

        console.log('searchValue', this.searchElement?.value, this.searchElement);

        return this.searchElement?.value || null;
    }

    getFilteredOptions() {
        let inputValue = this.searchValue || null;

        if (!DataHelpers.filled(inputValue)) {
            return this.getOptionItems();
        }

        let strValue = inputValue;
        let filtered = Object.entries(this.getOptionItems()).filter(item => {
            let [key, value] = item;
            let content = value.content || '';
            content = typeof content === 'function' ? content(this) : content;

            return content.toLowerCase().includes(strValue.toLowerCase());
        });

        return Object.fromEntries(filtered);
    }

    setReferenceSelectElement(referenceSelectElement = null) {
        if (!referenceSelectElement || !ObjectHelpers.isValidObject(referenceSelectElement)) {
            throw `Invalid referenceSelectElement`;
        }

        this.referenceSelectElement = referenceSelectElement;
    }

    getSelectedItems() {
        return ArrayHelpers.uniqueAndFilledOnly(this.selectedItems) || [];
    }

    setSelectedItems(values) {
        values = ArrayHelpers.uniqueAndFilledOnly(ArrayHelpers.wrap(values));
        console.log('setSelectedItems values', values);

        this.selectedItems = values;
        this.refreshPreviewSelectedItems();

        let targetElement = this.getOrGenerateValueTargetElement();

        targetElement.value = values;

        targetElement.dispatchEvent(new Event('change'));
    }

    pushSelectedItems(value) {
        value = ArrayHelpers.uniqueAndFilledOnly(ArrayHelpers.wrap(value));

        console.log('pushSelectedItems value:', value, this.getSelectedItems());

        let currentValues = ArrayHelpers.uniqueAndFilledOnly(this.getSelectedItems());
        let newValues = [
            ...ArrayHelpers.wrap(currentValues),
            ...value,
        ];

        this.setSelectedItems(newValues);
    }

    setValue(value) {
        this.pushSelectedItems(value);
    }

    getOrGenerateContainerElement() {
        if (!this.referenceSelectElement || !ObjectHelpers.isValidObject(this.referenceSelectElement)) {
            throw `[Invalid referenceSelectElement]`;
        }

        let referenceSelectElementClass = ObjectHelpers.getClassName(this.referenceSelectElement);

        let f2SelectorId = this.referenceSelectElement?.getAttribute('data-f2-selector-id')
            || this.selectorId;

        let currentDivContainer = document.querySelector(`[data-f2-selector-id="${f2SelectorId}"]`)
        let divContainer = currentDivContainer || document.createElement('div');

        divContainer.setAttribute('data-f2-selector', 'container')
        divContainer.setAttribute('data-f2-selector-id', f2SelectorId);

        // document.querySelectorAll(`[data-f2-selector-id="${f2SelectorId}"]`)?.forEach(el => el.remove());

        switch (referenceSelectElementClass) {
            case 'HTMLSelectElement':
                console.log('referenceSelectElementClass: ', referenceSelectElementClass);
                break;

            default:
                console.log('referenceSelectElementClass: ', referenceSelectElementClass);
                break;
        }

        console.log('referenceSelectElementClass: ', referenceSelectElementClass);

        divContainer.innerHTML = [
            `    <div data-f2-selector-type="preview_selected"></div>`,
            `    <div data-f2-selector-type="search">`,
            `        <input type="search" autocomplete="false">`,
            `    </div>`,
            `    <ul data-f2-selector="list"></ul>`,
        ].join(`\n`);

        if (!currentDivContainer) {
            console.log('Has no currentDivContainer');
            this.referenceSelectElement.insertAdjacentElement('afterend', divContainer)
        }

        return divContainer;
    }

    getOrGenerateValueTargetElement() {
        let {
            valueTarget,
        } = this.getConfig();

        if (!valueTarget) {
            console.log('valueTarget', valueTarget);
        }

        valueTarget = valueTarget || document.createElement('select');

        if ('validity' in valueTarget && 'form' in valueTarget) {
            valueTarget.setAttribute('f2-selector-was-init', true);

            valueTarget.addEventListener('change', event => {
                console.log('valueTarget changed', event); // DEBUG
            });

            return valueTarget;
        }

        return null;
    }

    getConfig(toMerge = {}) {
        return ObjectHelpers.objectMerge(
            ObjectHelpers.validObjectOr(this.config, {}),
            ObjectHelpers.validObjectOr(toMerge, {}),
        );
    }

    setConfig(config = {}) {
        this.config = this.getConfig(config);

        let {
            selectorId,
            multiple,
            selectedItems,
        } = ObjectHelpers.validObjectOr(this.config, {});

        selectorId = selectorId || ObjectHelpers.UUIDv4.generate();

        this.selectorId = selectorId;
        this.multiple = multiple;
        selectedItems = ArrayHelpers.uniqueAndFilledOnly(selectedItems);
        this.selectedItems = selectedItems;
    }

    configSet(key, value) {
        if (key === undefined || key === null || typeof key !== 'string' || key.trim() === '') {
            return false;
        }

        key = key.trim();

        this.setConfig({
            key: value,
        })

        return key in ObjectHelpers.validObjectOr(this.config, {});
    }

    configGet(key, defaultValue = null) {
        if (key === null) {
            return ObjectHelpers.validObjectOr(this.config, {});
        }

        return ObjectHelpers.get(
            ObjectHelpers.validObjectOr(this.config, {}),
            key,
            defaultValue,
        );
    }

    setContainer(containerElement) {
        // TODO: validate element
        if (!containerElement) {
            throw `Invalid containerElement`;
        }

        this.container = containerElement;

        console.log('container', this.container);
    }

    initSearchElement() {
        if (!this.container || this.searchElement) {
            console.error('Error on initSearchElement');
            return;
        }

        let searchElement = this.container?.querySelector('[data-f2-selector-type="search"] [type="search"]');

        if (!searchElement) {
            console.log('Has no searchElement');
            return;
        }

        this.searchElement = searchElement;

        searchElement.addEventListener('input', event => {
            searchActionOnInput(event, this);
        })
    }

    generateOptionItems() { // WIP
        let optionItems = [];

        let { customOptions } = ObjectHelpers.validObjectOr(this.config, {});
        customOptions = validateCustomOptions(customOptions);
        console.log('customOptions', customOptions);

        optionItems = customOptions ? customOptions : generateOptionItems(this.container);

        this.setOptionItems(optionItems);
    }

    setOptionItems(options) {
        if (!options || typeof options !== 'object') {
            return false;
        }

        console.clear();
        console.log('setOptionItems(options)', options);

        options = Array.isArray(options) ? options : Object.values(options);

        options = options.filter(option => {
            if (!ObjectHelpers.isValidObject(option)) {
                return false;
            }

            if (!ObjectHelpers.has(option, 'content')) {
                return false;
            }

            return true;
        }).map(option => {
            if (!ObjectHelpers.has(option, 'attributes') || !ObjectHelpers.isValidObject(option['attributes'])) {
                let _attributes = option['attributes'] ?? {};
                _attributes = typeof _attributes === 'function' ? _attributes(option, this) : {};

                option['attributes'] = _attributes;
            }

            if (typeof option['value'] === 'function') {
                try {
                    let tempValue = option['value'](this);
                    option['value'] = tempValue || '';
                } catch (error) {
                    //
                }
            }

            return option;
        });

        this.optionItems = {};
        options?.forEach(option => this.pushOption(option));

        this.refreshOptionItems();
    }

    pushOption(option, uid = null) {
        if (!ObjectHelpers.isValidObject(option)) {
            return false;
        }

        uid = uid || ObjectHelpers.get(option, 'uid');

        if (!uid || (typeof uid !== 'string') || !uid.trim()) {
            uid = ObjectHelpers.UUIDv4.generate();
        }

        if (!ObjectHelpers.has(option, 'attributes') || !ObjectHelpers.isValidObject(option['attributes'])) {
            option['attributes'] = {};
        }

        let optionValue = ObjectHelpers.get(option, 'value') || ObjectHelpers.get(option, 'attributes.value') || null;

        if (!optionValue || (typeof optionValue !== 'string')) {
            optionValue =  '';
        }

        option['value'] = optionValue || '';
        option['attributes'] = ObjectHelpers.validObjectOr(ObjectHelpers.get(option, 'attributes'), {});

        ObjectHelpers.putIfNoExists(option['attributes'], 'value', optionValue);
        ObjectHelpers.putIfNoExists(option['attributes'], 'uid', uid);

        this.optionItems = ObjectHelpers.put(
            ObjectHelpers.validObjectOr(this.optionItems, {}),
            uid,
            ObjectHelpers.validObjectOr(option),
        );
    }

    getOptionItems() {
        return ObjectHelpers.validObjectOr(this.optionItems, {});
    }

    getListElement() {
        if (!this.container) {
            return null;
        }

        return this.container?.querySelector('ul[data-f2-selector="list"]') || null;
    }

    getListElementListItems() {
        return this.getListElement()?.querySelectorAll(`[data-f2-selector-type="option"]`) || [];
    }

    getPreviewElement() {
        if (!this.container) {
            return null;
        }

        return this.container?.querySelector('[data-f2-selector-type="preview_selected"]') || null;
    }

    refreshPreviewSelectedItems() {
        let previewElement = this.getPreviewElement() || null;

        if (!previewElement) {
            return null;
        }

        let selectedItems = this.getSelectedItems() || [];

        previewElement.innerHTML = JSON.stringify((this.multiple ? selectedItems : selectedItems[0]) || null);

        for (let listItem of this.getListElementListItems()) {
            listItem.removeAttribute('data-f2-selected');

            let itemSelected = ArrayHelpers.inArray(listItem.dataset.value, selectedItems, false);

            listItem.setAttribute('data-f2-selected', itemSelected);
        }
    }

    refreshOptionItems(useOptions = null) {
        resetOptionElementToList(this);

        // useOptions = useOptions || this.getOptionItems();
        useOptions = useOptions ?? this.getFilteredOptions();

        console.log('useOptions', useOptions, this.searchValue, this.searchElement);

        // return;

        for(let _item of Object.entries(useOptions)) {
            let [_key, optionItem] = _item;
            let optionItemElement = optionItemGenerator(optionItem, this);

            optionItemElement.addEventListener('click', event => {
                actionWhenClickOnOption(event, this);
            });

            pushOptionElementToList(optionItemElement, this);
        }
    }

    refreshAll() {
        this.refreshOptionItems();
        this.refreshPreviewSelectedItems();
    }
}

export default F2Selector;
