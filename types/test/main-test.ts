const x: Taggle.Options = {
    // all options are optional
};
const y: Taggle.Options = {
    maxTags: null // maxTags may be null
};

new Taggle(document.getElementById("eleId")!);

const taggle = new Taggle("eleId", {
    additionalTagClasses: "additionalTagClasses",
    allowDuplicates: true,
    saveOnBlur: true,
    clearOnBlur: true,
    duplicateTagClass: "duplicateTagClass",
    containerFocusClass: "containerFocusClass",
    focusInputOnContainerClick: true,
    hiddenInputName: "hiddenInputName",
    tags: ["tag1", "tag2"],
    delimeter: "|",
    delimiter: "|",
    attachTagId: true,
    allowedTags: ["tag1", "tag2"],
    disallowedTags: ["tag0"],
    trimTags: true,
    maxTags: 10,
    tabIndex: 1,
    placeholder: "placeholder",
    submitKeys: [13],
    preserveCase: true,
    inputFormatter: i => i,
    tagFormatter: i => {
        i.setAttribute("data-test", "test");
        return i;
    },
    onBeforeTagAdd: (e, t) => false,
    onTagAdd: (e, t) => {},
    onBeforeTagRemove: (e, t) => false,
    onTagRemove: (e, t) => {}
});

for (let e of taggle.getTags().elements) {
    console.log(e.localName);
}

for (let v of taggle.getTags().values) {
    console.log(v.length);
}

for (let e of taggle.getTagElements()) {
    console.log(e.localName);
}

for (let v of taggle.getTagValues()) {
    console.log(v.length);
}

taggle.getInput().name;

taggle.getContainer().localName;

taggle.getData();

taggle
    .add("str")
    .add(["a", "b"])
    .edit("x", 0)
    .move(0, 1)
    .remove("tag0")
    .remove("tag0", true)
    .removeAll()
    .setOptions(x)
    .enable()
    .disable()
    .setData({})
    .attachEvents()
    .removeEvents();
