import React from "react";

const RadioOption = ({
    group,
    option,
    isChecked,
    handleChange,
    getChecked,
}) => (
    <div className="field-radiobutton flex">
        <label className="custom-radio">
            <input
                type="radio"
                name={group.addon}
                value={option.productpricecode}
                checked={isChecked}
                onChange={handleChange}
                className="hidden-radio"
            />
            <span
                className={`radiomark ${getChecked(option) ? "checked" : ""}`}
            ></span>
        </label>
        <label htmlFor={`${group.addon}_${option.id}`}>
            {option?.articlefields?.title}
        </label>
        <div className="ml-auto">
            {option?.price > 0 ? `+ ${option.price.toFixed(2)}` : ""}
        </div>
    </div>
);

const CheckboxOption = ({
    group,
    option,
    isChecked,
    handleChange,
    getChecked,
}) => (
    <div className="field-radiobutton flex">
        <label className="custom-checkbox">
            <input
                type="checkbox"
                value={option.productpricecode}
                checked={isChecked}
                onChange={handleChange}
                className="hidden-checkbox"
            />
            <span
                className={`checkmark ${getChecked(option) ? "checked" : ""}`}
            ></span>
        </label>
        <label htmlFor={`${group.addon}_${option.id}`}>
            {option?.articlefields?.title}
        </label>
        <div className="ml-auto">
            {option?.price > 0 ? `+ ${option.price.toFixed(2)}` : ""}
        </div>
    </div>
);

const ProductAddon = ({
    productAddons,
    selectedOptions,
    handleRadioOptionChange,
    handleOptionChange
}) => {

    const getChecked = (option) => {
        return selectedOptions.some((item) =>
            Object.values(item).includes(option.productpricecode),
        );
    };

    const isEmptyObject = (obj) => Object.keys(obj).length === 0;

    const getParentGroup = (option) => {
        const { itemmap } = option
        if (!itemmap) return true;
        const result = Object.entries(itemmap).reduce(
            (acc, [groupId, indexString]) => {
                const targetIndexes = indexString.split(", ").map(Number);

                // Filter selectedOptions based on groupId and targetIndexes
                const matches = selectedOptions.filter(
                    (item) =>
                        item.groupId === groupId &&
                        targetIndexes.includes(item.index),
                );

                // If matches are found, accumulate their indexes in acc
                if (matches.length > 0) {
                    acc[groupId] = matches.map((item) => item.index).join(", ");
                }

                return acc;
            },
            {},
        );
        return !isEmptyObject(result);
    };
    console.log('here', productAddons)
    const processAddons = (addons) => {
        // Create a map for easy access to addon items by addon and itemidx
        const parentMap = {};
        addons.forEach((addonGroup) => {
            parentMap[addonGroup.addon] = addonGroup.addons.reduce((acc, addon) => {
                acc[addon.itemidx] = addon.articlefields.productcode;
                return acc;
            }, {});
        });
    
        // Traverse the addons array and add `additionalfields` where necessary
        addons.forEach((addonGroup) => {
            addonGroup.addons.forEach((addon) => {
                if (addon.itemmap) {
                    const additionalFields = [];
    
                    // Iterate through each parent addon
                    for (const [parentAddon, parentItemIdxStr] of Object.entries(addon.itemmap)) {
                        const parentItemIdxList = parentItemIdxStr.split(',');
                        parentItemIdxList.forEach((parentItemIdx) => {
                            const parentProductCode =
                                parentMap[parentAddon]?.[parentItemIdx];
                            if (parentProductCode) {
                                additionalFields.push(parentProductCode);
                            }
                        });
                    }
    
                    // Add `additionalfields` property
                    addon.additionalfields = additionalFields;
                }
            });
        });
    
        return addons;
    };
    const updatedData = processAddons(productAddons);
console.log(updatedData);
    return (
        <div>
            {productAddons.map((group, i) => (
                    <div key={i} className="field px-4">
                        <h4>{group.addgroup.title}</h4>
                        {group.addons.map((option, index) => {
                            const isChecked = selectedOptions.some((item) =>
                                Object.values(item).includes(
                                    option.productpricecode,
                                ),
                            );
                            return (
                                <div key={index}>
                                    {group.addgroup.multiselect !== "Y" && (
                                        <RadioOption
                                            group={group}
                                            option={option}
                                            isChecked={isChecked}
                                            handleChange={() =>
                                                handleRadioOptionChange(
                                                    group,
                                                    option,
                                                    index,
                                                )
                                            }
                                            getChecked={getChecked}
                                        />
                                    )}
                                    {group.addgroup.multiselect === "Y" &&
                                        getParentGroup(option) && (
                                            <CheckboxOption
                                                group={group}
                                                option={option}
                                                isChecked={isChecked}
                                                handleChange={() =>
                                                    handleOptionChange(
                                                        group.addon,
                                                        option,
                                                        option.productpricecode,
                                                        group,
                                                    )
                                                }
                                                getChecked={getChecked}
                                            />
                                        )}
                                </div>
                            );
                        })}
                    </div>
                ))}
        </div>
    );
};

export default ProductAddon;
