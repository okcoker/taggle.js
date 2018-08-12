declare namespace Taggle {
    interface Options {
        additionalTagClasses?: string;

        allowDuplicates?: boolean;

        saveOnBlur?: boolean;

        clearOnBlur?: boolean;

        /** @deprecated */
        duplicateTagClass?: string;

        containerFocusClass?: string;

        focusInputOnContainerClick?: boolean;

        hiddenInputName?: string;

        tags?: ReadonlyArray<string>;

        delimeter?: string;
        delimiter?: string;

        /** @deprecated */
        attachTagId?: boolean;

        allowedTags?: ReadonlyArray<string>;

        disallowedTags?: ReadonlyArray<string>;

        trimTags?: boolean;

        maxTags?: number | null;

        tabIndex?: number;

        placeholder?: string;

        submitKeys?: ReadonlyArray<number>;

        preserveCase?: boolean;

        inputFormatter?: (input: HTMLInputElement) => HTMLInputElement;

        tagFormatter?: (li: HTMLLIElement) => HTMLLIElement;

        onBeforeTagAdd?: (e: Event, tag: string) => boolean;

        onTagAdd?: (e: Event, tag: string) => void;

        onBeforeTagRemove?: (e: Event, tag: string) => boolean;

        onTagRemove?: (e: Event, tag: string) => void;
    }
}

declare class Taggle {
    constructor(el: string | HTMLElement, options?: Taggle.Options);

    getTags(): { elements: HTMLElement[], values: string[] };

    /** @deprecated */
    getTagElements(): HTMLElement[];

    /** @deprecated */
    getTagValues(): string[];

    getInput(): HTMLInputElement;

    getContainer(): HTMLElement;

    add(text: string | ReadonlyArray<string>, index?: number): this;

    edit(text: string, index: number): this;

    move(currentIndex: number, destinationIndex: number): this;

    remove(text: string, all?: boolean): this;

    removeAll(): this;

    setOptions(options: Taggle.Options): this;

    enable(): this;

    disable(): this;

    setData(data: any): this;

    getData(): any;

    attachEvents(): this;

    removeEvents(): this;
}

export as namespace Taggle;
export = Taggle;
